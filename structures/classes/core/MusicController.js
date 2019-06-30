const got             = xrequire('got');
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

    get voiceConnected () {
        return this.connection && this.voiceChannel;
    }

    get paused () {
        return this.dispatcher && this.dispatcher.paused;
    }

    get idle () {
        return this.voiceConnected && !this.dispatcher;
    }

    get playing () {
        return this.dispatcher && !this.paused;
    }

    isQueueEmpty () {
        return this.queue.length <= 0;
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
                title: `Now Playing :musical_note: :musical_note:`,
                description: `Music Controller started playing a song.`,
                fields: [
                    { name: 'Song name',       value: this.loadedSong.name,          inline: false },
                    { name: 'Request Author',  value: this.loadedSong.requestAuthor, inline: true  },
                    { name: 'Upload Author',   value: this.loadedSong.author,        inline: true  },
                    { name: 'Duration',        value: this.loadedSong.seconds + 's', inline: true  },
                    { name: 'Age Restricted',  value: this.loadedSong.ageRestricted, inline: true  },
                    { name: 'URL',             value: this.loadedSong.url,           inline: false }
                ]
            }
        ));
    }

    async onFinishPlaying () {
        // Destroy current dispatcher
        if (this.dispatcher) {
            this.dispatcher.destroy();
        }

        this.dispatcher = null;

        // Sort out repeat
        if (this.repeat) {
            this.queue.unshift(this.loadedSong); // Queue back in
            this.play();
            return;
        }

        // If there are more songs to play...
        if (!this.isQueueEmpty()) {
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
            this.guild.client.emit(
                'channelInfo',
                this.requestChannel,
                `No more songs to play. Leaving voice channel.`
            );
            await this.leaveVoice();
            this.log(`No more songs to play. Purged and left voice channel.`);
        }
    }

    async onSpeakEvent (isPlaying) {

    }

    /********************
     * Internal methods *
    ********************/

    log (str) {
        logger.log(`[MusicController] => [${this.guild.name}] => ${str}`);
    }

    loadPlaylistToArray (data, opt) {
        const url   = 'https://youtube.com/watch?v=';
        const str   = data;
        const tag   = { name: 'data-title', url: 'data-video-id', id: 'data-video-id' };
        const split = str.indexOf('watch') === -1
                    ? str
                    : `https://www.youtube.com/playlist?list=${str.split('&list=')[1].split('&t=')[0]}`;

        return got(split).then(res => {
            const $     = cheerio.load(res.body);
            const thumb = $('tr');

            let playlist = [];

            if (!opt) {
                opt = Object.keys(tag);
            }

            const prefixUrl   = (holder, marks) => holder === 'url' ? `${url}${marks}` : marks;
            const getDuration = el => {
                const raw = $(el).find('.timestamp').text().split(':');
                return (parseInt(raw[0], 10) * 60) + parseInt(raw[1], 10);
            };

            const multipleDetails = Array.isArray(opt);

            playlist = thumb.map((index, el) => {
                if (multipleDetails) {
                    return opt.reduce((prev, holder) => {
                        prev[holder] = prefixUrl(holder, holder === 'duration'
                            ? getDuration(el) : el.attribs[tag[holder]]);
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

    enqueue (url, requestAuthor) {
        if (!ytdl.validateURL(url)) {
            throw Error('URL is not parsable by the youtube download library.');
        }

        const cpos = this.queue.length;

        // Do not await for metadata fetch or else load will be slow! [might be buggy tho]
        ytdl.getInfoAsync(url).then((data) => {
            if (!this.queue[cpos]) {
                return Error(
                    `Async song data fetch could not find song.` +
                    +`\n\tQueue was probably purged during load sequence.`
                );
            }

            this.queue[cpos].name          = data.title;
            this.queue[cpos].loudness      = data.loudness;
            this.queue[cpos].author        = data.author.name;
            this.queue[cpos].ageRestricted = data.age_restricted;
            this.queue[cpos].seconds       = parseInt(data.length_seconds);
        }).catch((err) => {
            this.requestChannel.guild.emit('channelError', this.requestChannel, err.message);
        });

        this.queue.push(
            {
                name: '(loading)',
                url: url,
                author: '(loading)',
                // eslint-disable-next-line no-mixed-operators
                requestAuthor: (typeof requestAuthor === 'string') && requestAuthor || requestAuthor.tag,
                loudness: 0,
                seconds: 0
            }
        );

        logger.log(`Enqueued song: '${url}' requested by '${requestAuthor.tag}'.`);
    }

    queueString () {
        const escmd    = Discord.Util.escapeMarkdown;
        let buildCache = [];

        this.queue.forEach(next => {
            buildCache.push(`**[${buildCache.length + 1}]**: ${escmd(next.name)} => ${escmd(next.url)}\n`);
        });

        return buildCache.join('\n');
    }

    /*******************
     * Control methods *
    ********************/

    async joinVoice (voiceChannel) {
        if (!(voiceChannel instanceof Discord.VoiceChannel)) {
            throw Error(`joinVoice received an invalid voice channel!`);
        }

        return voiceChannel
        .join()
        .then((connection) => {
            this.voiceChannel = voiceChannel;
            this.connection   = connection;
            this.log(`Joined voice channel '${voiceChannel.name}'.`);
        })
        .catch((err) => {
            if (String(err).includes('ECONNRESET')) {
                throw Error('There was an issue connecting to the voice channel, please try again.');
            }
            throw err;
        });
    }

    async leaveVoice () {
        if (!this.voiceChannel) {
            throw Error('Vulcan is not in voice thus he cannot leave.');
        }

        await this.voiceChannel.leave();

        // Reset the status
        this.destroy();
    }

    async loadItem (idOrURL, requestChannel, requestAuthor) {
        if (typeof idOrURL !== 'string') {
            throw Error(`Request must be of type string!`);
        }

        if (!(requestChannel instanceof Discord.TextChannel)) {
            throw Error('Invalid text channel of request! (May happen if channel was deleted)');
        }

        if (!((requestAuthor instanceof Discord.User) || (typeof requestAuthor === 'string'))) {
            throw Error('Invalid request author!');
        }

        // Transform ID to UR (for now all playlist to be given as URL only)
        const url = stringFunctions.isURL(idOrURL) ? idOrURL : `https://www.youtube.com/watch?v=${idOrURL}`;

        // If not playlist then queue song, else load playlist
        if (!stringFunctions.isYoutubePlaylist(url)) {
            await this.enqueue(url, requestAuthor);
        } else {
            const playlist  = await this.loadPlaylistToArray(url);
            const queueSize = this.queue.length;
            const estimate  = 0.125;

            if (playlist.length === 0) {
                return this.guild.client.emit(
                    'channelInfo',
                    requestChannel,
                    `Unable to load playlist ${url}\n\tLikely due to youtube API reasons?`
                );
            }

            // pn = playlist's length!!!!
            const pn = playlist.length;

            const embedWrap = messageEmbeds.info({
                description: `Playlist detected. Loaded playlist into queue.`,
                fields: [
                    { name: 'Playlist',            value: url,                             inline: false },
                    { name: 'Playlist Size',       value: playlist.length,                 inline: true  },
                    { name: 'Queue Size',          value: queueSize,                       inline: true  },
                    { name: 'Estimated Load Time', value: `${Math.round(estimate * pn)}s`, inline: true  },
                    { name: 'Load Progress',       value: `0/${pn} songs`,                 inline: true  }
                ]
            });

            // Embed message
            const message = await requestChannel.send(embedWrap);

            // Status edit
            let loadedSongs = 0;
            let step        = Math.round(pn * 0.20);

            for (let song of playlist) {
                if (song.name === '[Deleted video]') {
                    requestChannel.client.emit(
                        'channelInfo',
                        requestChannel,
                        `Encountered deleted video on playlist: ${song.url}`
                    );
                } else {
                    await this.enqueue(song.url, requestAuthor);
                }

                loadedSongs++;

                if ((loadedSongs % step) === 0 || loadedSongs === pn) {
                    embedWrap.embed.fields[4].value = `${loadedSongs}/${pn} songs`;
                    await message.edit(embedWrap);
                }
            }
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

        const forceSong = this.queue.pop();
        this.queue.splice(0, 0, forceSong);

        this.play();
    }

    async play () {
        if (!this.voiceChannel) {
            throw Error('Vulcan is not in any voice channel');
        }

        if (this.isQueueEmpty()) {
            throw Error('Queue is empty!');
        }

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
        this.queue.shift();

        // Debug
        console.log(this.dispatcher && this.connection && this.loadedSong, '<<<<<< true?');

        // Setup events for song dispatcher
        this.dispatcher.on('error', (e) => logger.error(e));
        this.dispatcher.on('debug', (d) => logger.debug(d));

        this.dispatcher.on('start', this.onStartPlaying.bind(this));
        this.dispatcher.on('speaking', this.onSpeakEvent.bind(this));
        this.dispatcher.on('finish', this.onFinishPlaying.bind(this));
        this.dispatcher.on('volumeChange', this.onVolumeChange.bind(this));

        // Update history
        const max = 100;

        if (this.history.length > max) {
            this.history = [];
        }

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

        if (force) {
            this.dispatcher.destroy();
        }

        this.log(`Skipping current song. Force: ${force}`);
    }

    prune () {
        this.queue = [];
        this.log(`Pruned music controller state.`);
    }

    purge () {
        this.queue = [];
        this.log(`Destroyed queue.`);
    }

    destroy () {
        if (this.dispatcher) {
            this.dispatcher.end();
        }

        // Purge
        this.purge();

        // Reset to defaults
        this.autoplay    = true;
        this.repeat      = false;
        this.shouldPause = false;
        this.shuffle     = false;

        // Clean these up at the end of event loop
        setTimeout(() => {
            this.requestChannel = null;
            this.voiceChannel   = null;
            this.connection     = null;
            this.dispatcher     = null;
            this.loadedSong     = null;
        }, 0);

        this.log(`Destroyed music controller state.`);
    }
}

module.exports = MusicController;
