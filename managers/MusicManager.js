const got             = xrequire('got');
const { promisify }   = xrequire('util');
const cheerio         = xrequire('cheerio');
const Discord         = xrequire('discord.js');
const ytdl            = xrequire('ytdl-core');
const ytdlcd          = xrequire('ytdl-core-discord');
const messageEmbeds   = xrequire('./utility/modules/messageEmbeds');
const stringFunctions = xrequire('./utility/modules/stringFunctions');
const logger          = xrequire('./managers/LogManager').getInstance();

ytdl.getInfoAsync = promisify(ytdl.getBasicInfo);

class MusicManager {
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

    get queueEmpty () {
        return this.queue.length <= 0;
    }

    /********************
     * Event functions *
    ********************/

    async onVolumeChange (oldValue, newValue) {
        await this.requestChannel.send(messageEmbeds.info(
            {
                description: `Music Controller has changed stream volume.`,
                field      : [
                    { name: 'Old Volume', value: oldValue },
                    { name: 'Old Volume', value: newValue }
                ]
            }
        ));
    }

    async onStartPlaying () {
        await this.requestChannel.send(messageEmbeds.info(
            {
                title      : `Now Playing :musical_note: :musical_note:`,
                description: `Music Controller started playing a song.`,
                fields     : [
                    { name: 'Song name',       value: this.loadedSong.name || 'Unknown',          inline: false },
                    { name: 'Request Author',  value: this.loadedSong.requestAuthor || 'Unknown', inline: true  },
                    { name: 'Upload Author',   value: this.loadedSong.author || 'Unknown',        inline: true  },
                    { name: 'Duration',        value: this.loadedSong.seconds + 's' || '0s?',     inline: true  },
                    { name: 'Age Restricted',  value: this.loadedSong.ageRestricted || 'false',   inline: true  },
                    { name: 'URL',             value: this.loadedSong.url || 'Unkonwn',           inline: false }
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
            this.guild.client.emit(
                'channelInformation',
                this.requestChannel,
                `No more songs to play. Leaving voice channel.`
            );
            await this.leaveVoice();
            this.log(`No more songs to play. Purged and left voice channel.`);
        }
    }

    /* eslint-disable no-unused-vars */
    async onSpeakEvent (isPlaying) {
        // TODO ?
    }

    /********************
     * Internal methods *
    ********************/

    log (str) {
        logger.log(`[MusicManager] => [${this.guild.name}] => ${str}`);
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

    enqueue (url, requestAuthor) {
        if (!ytdl.validateURL(url)) {
            throw new Error('URL is not parsable by the youtube download library.');
        }

        const cpos = this.queue.length;

        // Do not await for metadata fetch or else load will be slow! [might be buggy tho]
        ytdl.getInfoAsync(url).then((data) => {
            if (!this.queue[cpos]) {
                return Error(
                    `Async song data fetch could not find song.`
                    + `\n\tQueue was probably purged during load sequence.`
                );
            }

            this.queue[cpos].name          = data.title;
            this.queue[cpos].loudness      = data.loudness;
            this.queue[cpos].author        = data.author.name;
            this.queue[cpos].ageRestricted = data.age_restricted;
            this.queue[cpos].seconds       = parseInt(data.length_seconds, 10);
        }).catch((err) => {
            this.requestChannel.guild.emit('channelError', this.requestChannel, err);
        });

        this.queue.push(
            {
                url,
                name         : '(loading)',
                author       : '(loading)',
                requestAuthor: (typeof requestAuthor === 'string') && requestAuthor || requestAuthor.tag,
                loudness     : 0,
                seconds      : 0
            }
        );

        logger.log(`Enqueued song: '${url}' requested by '${requestAuthor.tag}'.`);
    }

    queueString () {
        const escmd      = Discord.Util.escapeMarkdown;
        let   buildCache = [];

        this.queue.forEach((next) => {
            buildCache.push(`**[${buildCache.length + 1}]**: ${escmd(next.name)} => ${escmd(next.url)}\n`);
        });

        return buildCache.join('\n');
    }

    /*******************
     * Control methods *
    ********************/

    async joinVoice (voiceChannel) {
        if (!(voiceChannel instanceof Discord.VoiceChannel)) {
            throw new Error(`joinVoice received an invalid voice channel!`);
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
                    throw new Error('There was an issue connecting to the voice channel, please try again.');
                }
                throw err;
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

    async loadItem (idOrURL, requestChannel, requestAuthor) {
        if (typeof idOrURL !== 'string') {
            throw new Error(`Request must be of type string!`);
        }

        if (!(requestChannel instanceof Discord.TextChannel)) {
            throw new Error('Invalid text channel of request! (May happen if channel was deleted)');
        }

        if (!((requestAuthor instanceof Discord.User) || (typeof requestAuthor === 'string'))) {
            throw new Error('Invalid request author!');
        }

        // Transform ID to UR (for now all playlist to be given as URL only)
        const url = stringFunctions.isURL(idOrURL) ? idOrURL : `http://www.youtube.com/watch?v=${idOrURL}`;

        // If not playlist then queue song, else load playlist
        if (!stringFunctions.isYoutubePlaylist(url)) {
            // Remove https for now?
            await this.enqueue(url.replace(/^https:\/\//i, 'http://'), requestAuthor);
        } else {
            const playlist  = await this.loadPlaylistToArray(url);
            const queueSize = this.queue.length;
            const estimate  = 0.125;

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
                description: `Playlist detected. Loaded playlist into queue.`,
                fields     : [
                    { name: 'Playlist',            value: url || 'Unkown',                              inline: false },
                    { name: 'Playlist Size',       value: playlist.length || 'N/A',                     inline: true  },
                    { name: 'Queue Size',          value: queueSize || 'N/A',                           inline: true  },
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
                    requestChannel.client.emit(
                        'channelInformation',
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

module.exports = MusicManager;
