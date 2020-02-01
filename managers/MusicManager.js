/* eslint-disable class-methods-use-this */
const got             = xrequire('got');
const ytsr            = require('ytsr');
const { promisify }   = xrequire('util');
const cheerio         = xrequire('cheerio');
const caller          = xrequire('caller-id');
const Discord         = xrequire('discord.js');
const ytdl            = xrequire('ytdl-core');
const ytdlcd          = xrequire('ytdl-core-discord');
const messageEmbeds   = xrequire('./utility/modules/messageEmbeds');
const stringFunctions = xrequire('./utility/modules/stringFunctions');
const logger          = xrequire('./managers/LogManager').getInstance();

ytdl.getInfoAsync = promisify(ytdl.getBasicInfo);

/**
 * * Every guild has a copy of this object.
 *
 * ! Limitations
 * Because of the reliance of youtube as the only source of music streaming
 * there are a few limitations:
 *  * Regionally restricted (requires a proxy)
 *  * Private
 *  * Rentals
 *
 * ? Music can be queued via loadItem(keyword)
 * 'keyword' is either a:
 *      - URL (yt)
 *      - ID (yt)
 *      - Search query
 */

class MusicManager {
    constructor (guild) {
        // Init properties
        this.guild   = guild;
        this.history = [];
        this.queue   = [];

        // Defaults
        this.autoplay        = true;
        this.repeat          = false;
        this.shuffle         = false;
        this.shouldPause     = false;
        this.loadingPlaylist = false;
        this.afkTimeout      = 2 * (60 * 1000); // 2 minutes
        this.maxHistory      = 100; // History array max size

        // Assigned by methods
        this.requestChannel = null; // * The text channel from which the latest request was made.
        this.voiceChannel   = null; // * The voice channel vulcan is in.
        this.connection     = null; // * The connection object to the voice channel. (assigned on join)
        this.dispatcher     = null; // * The music dispatcher. (created on music play)
        this.loadedSong     = null; // * The loaded song object. (created on item load)
    }

    /************************
     * Accessors & Mutators *
    *************************/

    get voiceConnected () {
        return this.connection && this.voiceChannel;
    }

    get paused () {
        return this.dispatcher && this.dispatcher.paused;
    }

    get idle () {
        return this.voiceConnected && !this.dispatcher && !this.loadingPlaylist;
    }

    get playing () {
        return this.dispatcher && !this.paused;
    }

    get queueEmpty () {
        return this.queue.length <= 0;
    }

    /********************
     * Event functions  *
     * ? Dispatcher     *
    ********************/

    async onVolumeChange (oldValue, newValue) {
        await this.requestChannel.send(messageEmbeds.info(
            {
                description: `Music Manager has changed stream volume.`,
                field      : [
                    { name: 'Old Volume', value: oldValue },
                    { name: 'New Volume', value: newValue }
                ]
            }
        ));
    }

    async onStartPlaying () {
        await this.requestChannel.send(messageEmbeds.info(
            {
                description: ``, // Ugly other wise
                title      : `Now Playing :musical_note: :musical_note:`,
                fields     : [
                    { name: 'Song name',       value: this.loadedSong.name || 'Unknown',          inline: false },
                    { name: 'Request Author',  value: this.loadedSong.requestAuthor || 'Unknown', inline: true  },
                    { name: 'Upload Author',   value: this.loadedSong.author || 'Unknown',        inline: true  },
                    { name: 'Duration',        value: this.loadedSong.seconds + 's' || '0s?',     inline: true  },
                    { name: 'URL',             value: this.loadedSong.url || 'Unkonwn',           inline: false }
                ]
            }
        ));
    }

    async onFinishPlaying () {
        // Destroy current dispatcher
        if (this.dispatcher) {
            this.dispatcher.destroy();
            this.dispatcher = null;
        }

        // Sort out repeat
        if (this.repeat) {
            this.queue.unshift(this.loadedSong); // Queue back in
            this.play();

            return;
        }

        // If there are more songs to play...
        if (!this.queueEmpty) {
            // Sort out shuffle [maybe guarantee no repeats?]
            if (this.shuffle) {
                this.queue.shuffle();
                this.log(`Shuffled queue!`);
            }

            // Play next song if autoplay
            if (this.autoplay) {
                this.log(`Playing next song... '${this.queue[0].url}'`);
                this.play();
            } else {
                this.log(`Autoplay is off and there are songs to play!`);
            }
        } else { // No more songs to play...
            this.log(`No more songs to play. Starting AFK check.`);

            // Prevent from staying in channel forever.
            // ? Skip triggers this!
            this.inactivityCheck((inactive) => {
                if (inactive) {
                    this.guild.client.emit(
                        'channelInformation',
                        this.requestChannel,
                        `Voice inactivity detected (\`timeout=${this.afkTimeout}\`).\nLeaving voice channel!`
                    );
                }
            });
        }
    }

    /* eslint-disable no-unused-vars */
    async onSpeakEvent (isPlaying) {
        // TODO
    }

    /********************
     * Event functions  *
     * ? Connection     *
    ********************/

    async onConnectionError (err) {
        logger.error(`[Music Manager] ${err.message}`);
    }

    // ? May trigger after a region change.
    async onReconnect () {
        this.log('Vulcan voice connection has reconnected.');
    }

    /********************
     * Internal methods *
    ********************/

    log (str) {
        logger.log(`[MusicManager] => [${this.guild.name}] => [${caller.getData().functionName}] => ${str}`);
    }

    inactivityCheck (cb) {
        return setTimeout(() => {
            // If still in after timeout and not playing
            if (this.idle) {
                this.leaveVoice();
                cb(true);
            } else {
                cb(false);
            }
        }, this.afkTimeout);
    }

    loadPlaylistToArray (data, opt) {
        const url   = 'http://youtube.com/watch?v=';
        const str   = data;
        const tag   = { name: 'data-title', url: 'data-video-id', id: 'data-video-id' };
        const split = (str.indexOf('watch') === -1)
            ? str
            :  `http://www.youtube.com/playlist?list=${str.split('&list=')[1].split('&t=')[0]}`;

        return got(split).then((res) => {
            const $     = cheerio.load(res.body);
            const thumb = $('tr');

            let playlist = [];

            if (!opt) {
                opt = Object.keys(tag);
            }

            const prefixUrl   = (holder, marks) => (holder === 'url')
                ? `${url}${marks}`
                : marks;

            const getDuration = (el) => {
                const raw = $(el).find('.timestamp').text().split(':');

                return (parseInt(raw[0], 10) * 60) + parseInt(raw[1], 10);
            };

            const multipleDetails = Array.isArray(opt);

            playlist = thumb.map((_index, el) => {
                if (multipleDetails) {
                    return opt.reduce((prev, holder) => {
                        prev[holder] = prefixUrl(holder, holder === 'duration'
                            ? getDuration(el)
                            : el.attribs[tag[holder]]);

                        return prev;
                    }, {});
                }

                if (opt === 'duration') {
                    return getDuration(el);
                }

                return prefixUrl(opt, el.attribs[tag[opt]]);
            }).get();

            return playlist;
        });
    }

    // ! Playlist loading calls this n times, maybe dont do that?
    async enqueue (url, requestAuthor) {
        if (!ytdl.validateURL(url)) {
            throw new Error('URL is not parsable by the youtube download library.');
        }

        const cpos = this.queue.length;
        const data = await ytdl.getInfoAsync(url);

        // ! Can we check this earlier?
        if (!data.title) {
            this.log(`Unable to enqueue url: ${url}. Video is likely unavailable!`);

            return;
        }

        this.queue.push(
            {
                url,
                name         : data.title,
                loudness     : data.loudness,
                author       : data.author.name || 'Unknown',
                seconds      : parseInt(data.length_seconds, 10),
                requestAuthor: (typeof requestAuthor === 'string') && requestAuthor || requestAuthor.tag
            }
        );

        this.log(`Enqueued song: '${url}' requested by '${requestAuthor.tag}'.`);
    }

    queueString () {
        const escmd      = Discord.Util.escapeMarkdown;
        let   buildCache = [];

        this.queue.forEach((song) => {
            buildCache.push(
                `**[${buildCache.length + 1}]**: ${escmd(song.name || '(Loading...)')} => ${escmd(String(song.url))}\n`
            );
        });

        return buildCache.join('\n');
    }

    /*******************
     * Control methods *
    ********************/

    async joinVoice (voiceChannel) {
        if (!(voiceChannel instanceof Discord.VoiceChannel)) {
            throw new Error(`Received an invalid voice channel!`);
        }

        // Set up voice channel join
        this.connection   = await voiceChannel.join();
        this.voiceChannel = voiceChannel;
        this.log(`Joined voice channel '${voiceChannel.name}'.`);

        // Set up conenction events
        this.connection.on('warn', logger.warn);
        this.connection.on('error', this.onConnectionError.bind(this));
        this.connection.on('reconnecting', this.onReconnect.bind(this));

        // Begin inactivity check
        this.inactivityCheck((inactive) => {
            if (inactive) {
                this.guild.client.emit(
                    'channelInformation',
                    this.requestChannel,
                    `Voice inactivity detected (\`timeout=${this.afkTimeout}\`).\nLeaving voice channel!`
                );
            }
        });
    }

    async leaveVoice () {
        if (!this.voiceChannel) {
            throw new Error('Vulcan is not in voice thus he cannot leave.');
        }

        await this.voiceChannel.leave();

        // Reset the status
        this.destroy();
    }

    async loadItem (request, requestChannel, requestAuthor) {
        if (typeof request !== 'string') {
            throw new Error(`Request must be of type string!`);
        }

        if (!(requestChannel instanceof Discord.TextChannel)) {
            throw new Error('Invalid text channel of request! (May happen if channel was deleted)');
        }

        if (!((requestAuthor instanceof Discord.User) || (typeof requestAuthor === 'string'))) {
            throw new Error('Invalid request author!');
        }

        // * Parsing request => URL
        let url = '';

        if (ytdl.validateURL(request)) {
            url = request;
        } else if (ytdl.validateID(request)) {
            url = `http://www.youtube.com/watch?v=${request}`;
        } else {
            // ? Search for a video with those keywords.
            const ytResults = (await ytsr(request)).items;

            if (ytResults.length <= 0) {
                return this.guild.client.emit(
                    'channelInformation',
                    requestChannel,
                    `Unable to find youtube music videos for the request!`
                );
            }

            url = ytResults[0].link;
        }

        // If not playlist then queue song, else load playlist
        if (!stringFunctions.isYoutubePlaylist(url)) {
            // Remove https for now?
            await this.enqueue(url.replace(/^https:\/\//i, 'http://'), requestAuthor);
        } else { // ? playlist
            // Playlists take time, we need to know we are not inactive!
            this.loadingPlaylist = true;

            const playlist  = await this.loadPlaylistToArray(url);
            const estimate  = 0.5;

            if (playlist.length === 0) {
                return this.guild.client.emit(
                    'channelInformation',
                    requestChannel,
                    `Unable to load playlist ${url}\n\tLikely due to youtube API reasons?`
                );
            }

            // pn = playlist's length!!!!
            const pn = playlist.length;

            const embedWrap = messageEmbeds.info({
                description: `Playlist detected.  :notes:\nLoading full playlist into queue...`,
                fields     : [
                    { name: 'Playlist',            value: url || 'Unkown',                              inline: false },
                    { name: 'Playlist Size',       value: playlist.length || 'N/A',                     inline: true  },
                    { name: 'Queue Size',          value: this.queue.length || 0,                       inline: true  },
                    { name: 'Estimated Load Time', value: `${Math.roundDP(estimate * pn, 2) || '??'}s`, inline: true  },
                    { name: 'Load Progress',       value: `0/${pn || '??'} songs`,                      inline: true  }
                ]
            });

            // Embed message
            const message = await requestChannel.send(embedWrap);

            // Status edit
            let loadedSongs = 0;
            let step        = Math.round(pn * 0.35);

            for (let song of playlist) {
                if (song.name === '[Deleted video]') {
                    this.log(`Encoutnered deleted video: ${song}`);
                } else {
                    await this.enqueue(song.url, requestAuthor);
                }

                loadedSongs++;

                if ((loadedSongs % step) === 0 || loadedSongs === pn) {
                    embedWrap.embed.fields[2].value = this.queue.length;
                    embedWrap.embed.fields[4].value = `${loadedSongs}/${pn} songs`;

                    await message.edit(embedWrap);
                }
            }

            // done
            this.loadingPlaylist = false;
        }

        // Update last request channel.
        // This is were the vulcan replies are sent to.
        this.requestChannel = requestChannel;
    }

    async forcePlay (idOrURL, requestChannel, requestAuthor) {
        if (stringFunctions.isYoutubePlaylist(idOrURL)) {
            return requestChannel.client.emit(
                'channelWarning',
                requestChannel,
                `Force play is not compatible with playlists!`
            );
        }

        await this.loadItem(idOrURL, requestChannel, requestAuthor);
        this.queue.splice(0, 0, this.queue.pop());
        this.play();
    }

    async play () {
        if (!this.voiceChannel) {
            throw new Error('Vulcan is not in any voice channel');
        }

        if (this.queueEmpty) {
            throw new Error('Queue is empty!');
        }

        const loadedSong = this.queue[0];
        const stream     = await ytdlcd(
            loadedSong.url,
            // ? ytdl options (ytdlcd is optimised for discord but uses ytdl options)
            {
                quality: 'highestaudio'
            }
        );

        // New dispatcher every new song
        this.dispatcher = this.connection.play(
            stream,
            {
                bitrate: 'auto',
                passes : 5,
                type   : 'opus',
                volume : false
            }
        );

        // We can now safely state we are playing!
        this.loadedSong = loadedSong;
        this.queue.shift();

        // Setup events for song dispatcher
        this.dispatcher.on('error', logger.error);
        this.dispatcher.on('debug', logger.debug);
        this.dispatcher.on('start', this.onStartPlaying.bind(this));
        this.dispatcher.on('speaking', this.onSpeakEvent.bind(this));
        this.dispatcher.on('finish', this.onFinishPlaying.bind(this));
        this.dispatcher.on('volumeChange', this.onVolumeChange.bind(this));

        // Update history
        if (this.history.length > this.maxHistory) {
            this.history = [];
        }

        this.history.push(loadedSong);

        this.log(`Started playing song: ${loadedSong.url} - '${loadedSong.name}'`);
    }

    pause () {
        this.shouldPause = true;
        this.dispatcher.pause();
        this.log(`Requesting pause. Song will be paused!`);
    }

    resume () {
        this.shouldPause = false;
        this.dispatcher.resume();
        this.log(`Requesting resume. Song will be resumed!`);
    }

    skip (force = false) {
        if (this.dispatcher) {
            this.dispatcher.end();

            if (force) {
                this.dispatcher.destroy();
            }
        }

        this.log(`Skipping current song. Force: ${force}`);
    }

    prune () {
        this.queue = [];
        this.log(`Removed all elements from player queue.`);
    }

    purge () {
        // Destroy dispatcher via skip
        this.skip(true);

        // Reset to defaults
        this.queue       = [];
        this.autoplay    = true;
        this.repeat      = false;
        this.shouldPause = false;
        this.shuffle     = false;

        this.log(`Reset Music Manager state to defaults.`);
    }

    destroy () {
        if (this.dispatcher) {
            this.dispatcher.end();
        }

        // Purge
        this.purge();

        // Clean these up at the end of event loop
        setTimeout(() => {
            this.requestChannel = null;
            this.voiceChannel   = null;
            this.connection     = null;
            this.dispatcher     = null;
            this.loadedSong     = null;
        }, 0);

        this.log(`Destroyed Music Manager.`);
    }
}

module.exports = MusicManager;
