const got             = require('got');
const { promisify }   = xrequire('util');
const cheerio         = xrequire('cheerio');
const Discord         = xrequire('discord.js');
const ytdl            = xrequire('ytdl-core');
const ytdlcd          = xrequire('ytdl-core-discord');
const messageEmbeds   = xrequire('./plugins/libs/messageEmbeds');
const stringFunctions = xrequire('./plugins/libs/stringFunctions');
const logger          = xrequire('./managers/LogManager').getInstance();

ytdl.getInfoAsync = promisify(ytdl.getBasicInfo);

class MusicController {
    constructor (guild) {
        // Init properties
        this.guild   = guild;
        this.history = [];
        this.queue   = [];

        // Defaults
        this.autoplay    = true;
        this.repeat      = false;
        this.shouldPause = false;
        this.shuffle     = false;

        // Assigned by methods
        this.requestChannel = null;
        this.voiceChannel   = null;
        this.connection     = null;
        this.dispatcher     = null;
        this.loadedSong     = null;
    }

    /************************
     * Accessors & Mutators *
    *************************/

    get playing () {
        return this.dispatcher && !this.dispatcher.paused;
    }

    get paused () {
        return !this.playing;
    }

    get idle () {
        return this.isQueueEmpty() || !this.dispatcher;
    }

    /********************
     * Event functions *
    ********************/

    async onVolumeChange (oldValue, newValue) {
        await this.requestChannel.send(messageEmbeds.info(
            {
                description: `Music Controller has changed stream volume.`,
                field: [
                    { name: 'Old Volume', value: oldValue },
                    { name: 'Old Volume', value: newValue }
                ]
            }
        ));
    }

    async onStartPlaying () {
        await this.requestChannel.send(messageEmbeds.info(
            {
                title: `Song Information [Now Playing]`,
                description: `Music Controller started playing a song.`,
                fields: [
                    { name: 'Song name',       value: this.loadedSong.name },
                    { name: 'Request Author',  value: this.loadedSong.requestAuthor },
                    { name: 'Duration',        value: this.loadedSong.seconds + '(s)' },
                    { name: 'URL',             value: this.loadedSong.url }
                ]
            }
        ));
    }

    async onPlayEvent (isSpeaking) {
        // Neccessary because dispatcher.pause calls this before updating state.
        if (this.shouldPause)
            return this.log(`Song paused!`);

        // Dequeue when loadedSong is over. Queue next if possible.
        if (!isSpeaking && !this.paused && !this.isQueueEmpty()) {
            if (!this.repeat) {
                if (this.shuffle) {
                    this.queue.shuffle();
                    this.log(`Shuffled queue!`);
                } else {
                    this.queue.shift();
                }
            } else {
                this.log(`Repeat is on. Queue did not shift!`);
            }

            if (!this.isQueueEmpty() && this.autoplay) {
                this.log(`Playing next song... '${this.queue[0].url}'`);
                this.play(this.requestChannel);
            } else {
                this.dispatcher.destroy();
                this.dispatcher = null;
                this.log(`No more songs to play. Destroying dispatcher...`);
            }
        }
    }

    /*******************
     * Utility methods *
    ********************/

    log (str) {
        logger.log(`[MusicController] => [${this.guild.name}] => ${str}`);
    }

    loadPlaylistToArray (data, opt) {
        const url   = 'https://youtube.com/watch?v=';
        const str   = data;
        const split = str.indexOf('watch') === -1 ? str : `https://www.youtube.com/playlist?list=${str.split('&list=')[1].split('&t=')[0]}`;
        const tag   = {
            name: 'data-title',
            url: 'data-video-id',
            id: 'data-video-id'
        };

        return got(split).then(res => {
            const $     = cheerio.load(res.body);
            const thumb = $('tr');
            const arr   = {
                playlist: []
            };

            if (!opt) {
                opt = Object.keys(tag);
            }

            const prefixUrl   = (holder, marks) => holder === 'url' ? `${url}${marks}` : marks;
            const getDuration = el => {
                const raw = $(el).find('.timestamp').text().split(':');
                return (parseInt(raw[0], 10) * 60) + parseInt(raw[1], 10);
            };

            const multipleDetails = Array.isArray(opt);

            arr.playlist = thumb.map((index, el) => {
                if (multipleDetails) {
                    return opt.reduce((prev, holder) => {
                        prev[holder] = prefixUrl(holder, holder === 'duration' ? getDuration(el) : el.attribs[tag[holder]]);
                        return prev;
                    }, {});
                }
                if (opt === 'duration') {
                    return getDuration(el);
                }
                return prefixUrl(opt, el.attribs[tag[opt]]);
            }).get();

            return {
                data: arr
            };
        });
    }

    /*****************
     * Class methods *
    ******************/

    async joinVoice (voiceChannel) {
        return voiceChannel
        .join()
        .then((connection) => {
            this.voiceChannel = voiceChannel;
            this.connection   = connection;
            this.log(`Joined voice channel '${voiceChannel.name}'.`);
        })
        .catch((err) => {
            if (String(err).includes('ECONNRESET'))
                throw Error('There was an issue connecting to the voice channel, please try again.');
            throw err;
        });
    }

    async leaveVoice () {
        if (!this.voiceChannel)
            throw Error('Vulcan is not in voice thus he cannot leave.');

        await this.voiceChannel.leave();

        // Reset the status
        this.purge();
    }

    async loadItem (idOrURL, requestChannel, requestAuthor) {
        if (typeof idOrURL !== 'string')
            throw Error(`Request must be of type string!`);

        if (!(requestChannel instanceof Discord.TextChannel))
            throw Error('Invalid text channel of request! (May happen if channel was deleted)');

        if (!((requestAuthor instanceof Discord.User) || (typeof requestAuthor === 'string')))
            throw Error('Invalid request author!');

        // Transform ID to UR (for now all playlist to be given as URL only)
        const url = stringFunctions.isURL(idOrURL) ? idOrURL : `https://www.youtube.com/watch?v=${idOrURL}`;

        if (!stringFunctions.isYoutubePlaylist(url)) {
            await this.enqueue(url, requestAuthor);
        } else {
            const playlist  = (await this.loadPlaylistToArray(url)).data.playlist;
            const queueSize = this.queue.length;
            const estimate  = 0.6;

            const embedWrap = messageEmbeds.info({
                description: `Playlist detected. Loaded playlist into queue.`,
                fields: [
                    { name: 'Playlist', value: url },
                    { name: 'Playlist Size', value: playlist.length || 'NaN' },
                    { name: 'Queue Size', value: queueSize || 'NaN' },
                    { name: 'Estimated Load Time', value: `${Math.round(estimate * playlist.length)} seconds` },
                    { name: 'Load Progress', value: `0/${playlist.length} (songs loaded)` }
                ]
            });

            // Embed message
            const message = await requestChannel.send(embedWrap);

            // Status edit
            let loadedSongs = 0;
            let step        = Math.round(playlist.length * 0.10);

            for (let song of playlist) {
                if (song.name === '[Deleted video]') {
                    requestChannel.client.emit('channelInfo', requestChannel, `Encountered deleted video on playlist: ${song.url}`);
                } else {
                    await this.enqueue(song.url, requestAuthor);
                }

                loadedSongs++;

                if (loadedSongs % step === 0) {
                    embedWrap.embed.fields[4].value = `${loadedSongs}/${playlist.length} (songs loaded)`;
                    await message.edit(embedWrap);
                }
            }
        }

        // Update last request channel.
        // This is were the vulcan replies are sent to.
        this.requestChannel = requestChannel;
    }

    async enqueue (url, requestAuthor) {
        if (!ytdl.validateURL(url))
            throw Error('URL is not parsable by the youtube download library.');

        const ytdldata = await ytdl.getInfoAsync(url);

        this.queue.push(
            {
                name: ytdldata.title,
                url: url,
                // eslint-disable-next-line no-mixed-operators
                requestAuthor: ((typeof requestAuthor === 'string') && requestAuthor || requestAuthor.tag),
                /* author: metadata.author,
                authorUrl: metadata.author_url,
                thumbnailUrl: metadata.thumbnail_url, */
                loudness: ytdldata.loudness,
                seconds: parseInt(ytdldata.length_seconds)
            }
        );

        logger.log(`Enqueued song: '${url}' requested by '${requestAuthor.tag}'.`);
    }

    async forcePlay (idOrURL, requestChannel, requestAuthor) {
        await this.loadItem(idOrURL, requestChannel, requestAuthor);

        if (this.queue.length > 0) {
            const forceSong = this.queue.pop();
            this.queue.splice(0, 0, forceSong);
        }

        this.play();
    }

    async play () {
        if (!this.voiceChannel)
            throw Error('Vulcan is not in any voice channel');

        if (this.isQueueEmpty())
            throw Error('Queue is empty!');

        const loadedSong = this.queue[0];
        const stream     = await ytdlcd(loadedSong.url);

        // New dispatcher every new song
        this.dispatcher = this.connection.play(
            stream,
            {
                bitrate: this.voiceChannel.bitrate / 1000,
                passes: 5,
                type: 'opus',
                volume: false
            }
        );

        // We can now safely state we are playing!
        this.loadedSong = loadedSong;

        // Setup events for song dispatcher
        this.dispatcher.on('start', this.onStartPlaying.bind(this));
        this.dispatcher.on('volumeChange', this.onVolumeChange.bind(this));
        this.dispatcher.on('speaking', this.onPlayEvent.bind(this));
        this.dispatcher.on('error', (e) => logger.error(e));
        this.dispatcher.on('debug', (d) => logger.debug(d));

        // Update history
        const max = 100;

        if (this.history.length > max)
            this.history = [];

        this.history.push(loadedSong);

        this.log(`Started playing song: ${loadedSong.url} - '${loadedSong.name}'`);
    }

    pause () {
        this.shouldPause = true;
        this.dispatcher.pause();
        this.log(`Requesting pause. Song should have paused!`);
    }

    resume () {
        this.shouldPause = false;
        this.dispatcher.resume();
        this.log(`Requesting resume. Song should have resumed!`);
    }

    skip (force = false) {
        this.dispatcher.end();

        if (force)
            this.dispatcher.destroy();

        this.log(`Skipping current song. Force: ${force}`);
    }

    prune () {
        this.queue = [];
        this.log(`Pruned music controller state.`);
    }

    purge () {
        if (this.dispatcher)
            this.dispatcher.end();

        // Reset init properties
        this.history = [];
        this.queue   = [];

        // Reset method assigned properties
        this.requestChannel = null;
        this.voiceChannel   = null;
        this.connection     = null;
        this.dispatcher     = null;
        this.loadedSong     = null;

        this.log(`Purged music controller state.`);
    }

    isQueueEmpty () {
        return this.queue.length <= 0;
    }

    queueString () {
        const escmd    = Discord.Util.escapeMarkdown;
        let buildCache = [];

        this.queue.forEach(next => {
            buildCache.push(`**[${buildCache.length + 1}]**: ${escmd(next.name)} => ${escmd(next.url)}\n`);
        });

        return buildCache.join('\n');
    }

    setRepeatSong (bool) {
        this.repeat = bool;
        this.log('Repeat set to: ' + bool);
    }

    setAutoplay (bool) {
        this.autoplay = bool;
        this.log('Autoplay set to: ' + bool);
    }

    setShuffle (bool) {
        this.shuffle = bool;
        this.log('Shuffle set to: ' + bool);
    }
}

module.exports = MusicController;
