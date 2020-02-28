/**
 * ? Manager File: Music
 * Represents a layer of control between the music commands and the music stream.
 * TODO: Abstract for more than just 'youtube' links.
 */

/* eslint-disable class-methods-use-this */
const got           = xrequire('got');
const ytsr          = xrequire('ytsr');
const { promisify } = xrequire('util');
const EventEmitter  = require('events');
const cheerio       = xrequire('cheerio');
const caller        = xrequire('caller-id');
const Discord       = xrequire('discord.js');
const ytdl          = xrequire('ytdl-core-discord');
const messageEmbeds = xrequire('./modules/messageEmbeds');
const logger        = xrequire('./modules/logger').getInstance();

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
 * ? Music can be queued via the .request() which parses a request
 * Thus far a request resolvable can be:
 *      - URL (yt)
 *      - ID (yt)
 *      - Search query (yt)
 */

class MusicManager extends EventEmitter {
    constructor (guild) {
        super();

        // Init properties
        this.client  = guild.client;
        this.guild   = guild;
        this.history = [];
        this.queue   = [];
        this.checks  = [];

        // Default
        this.autoplay    = true;
        this.repeat      = false;
        this.shuffle     = false;
        this.loading     = false;
        this.shouldPause = false;
        this.afkTimeout  = 2 * (60 * 100); // 2 minutes
        this.maxHistory  = 100; // History array max size

        // Assigned by methods
        this.connection  = null; // * The connection object to the voice channel. (assigned on join)
        this.dispatcher  = null; // * The music dispatcher. (created on music play (_enqueue))
        this.currentTask = null; // * The loaded task. (created on processing a request)

        // Self events
        this.on('timeoutLeave', this._onTimeoutLeave);

        // Log
        logger.log(`[Managers] => Instance of Music Manager created for '${this.guild.name}'`);
    }

    /************************
     * Accessors & Mutators *
    *************************/

    get connected () {
        return this.connection && this.connection.channel;
    }

    get paused () {
        return this.dispatcher && this.dispatcher.paused;
    }

    get idle () {
        return this.connected && !this.dispatcher && !this.loading;
    }

    get playing () {
        return !this.paused;
    }

    get free () {
        return this.queue.length <= 0;
    }

    /********************
     * Event functions  *
     * ? Self           *
    ********************/

    async _onTimeoutLeave () {
        // May happen if always idle
        const source = this.currentTask
            ? this.currentTask.source
            : this.guild.botChannel;

        // Beautify
        const f  = Math.formatMilliseconds;
        const df = 'Unknown';

        await source.send(messageEmbeds.musicManager(
            {
                title      : `Inactivity Prevention`,
                description: `Voice inactivity detected.\nLeft voice to save resources.`,
                fields     : [
                    { name: 'Timeout', value: `${f(this.afkTimeout)}`      || df, inline: true },
                    { name: 'Channel', value: this.connection.channel.name || df, inline: true }
                ]
            }
        ));
    }

    /********************
     * Event functions  *
     * ? Dispatcher     *
    ********************/

    async _onVolumeChange (oldValue, newValue) {
        // Beautify
        const source = this.currentTask.source;
        const df     = 'Unknown';

        await source.send(messageEmbeds.musicManager(
            {
                description: `Music Manager has changed stream volume.`,
                field      : [
                    { name: 'Old Volume', value: oldValue || df },
                    { name: 'New Volume', value: newValue || df }
                ]
            }
        ));
    }

    async _onStartPlaying () {
        // Destructor task
        const { requester, source, song } = this.currentTask;

        // Useful for time update
        const starTime = Date.now();
        const duration = song.seconds * 1000;
        const endTime  = starTime + duration;

        // Beautify
        const f    = Math.formatMilliseconds;
        const df   = 'Unknown';
        const line = '=======';
        const wrap = messageEmbeds.musicManager(
            {
                description: ``, // Remove description for aesthetics
                title      : `Now Playing :musical_note: :musical_note:`,
                fields     : [
                    { name: 'Song',                        value: song.name || df,            inline: false },
                    { name: 'Requester',                   value: `<@${requester.id}>` || df, inline: true  },
                    { name: 'Author',                      value: song.author || df,          inline: true  },
                    { name: 'Duration',                    value: f(duration) || df,          inline: true  },
                    { name: `${line} [ Preview ] ${line}`, value: song.url || df,             inline: false }
                ],
                image: {
                    // Smalles thumbnail
                    url: song.thumbnail.thumbnails[0].url
                }
            }
        );

        // Hold message
        await source.send(wrap);
        let timeMsg = await source.send(`:clock1: \`Elapsed Time: ${f(duration)}\``);

        // * Move?
        const updateInterval = 5 * 1000;

        // ? Periodically update
        const timer = setInterval(async () => {
            let timeLeft = endTime - Date.now();

            if (timeLeft <= 0) {
                await timeMsg.edit(`:clock1: \`Elapsed Time: (Finished)\``);
                clearInterval(timer);

                return;
            }

            await timeMsg.edit(`:clock1: \`Elapsed Time: ${f(timeLeft)}\``);
        }, updateInterval);
    }

    async _onFinishPlaying () {
        // ? Destory dispatcher
        if (this.dispatcher) {
            this.dispatcher = null;
        }

        // ? Repeat
        if (this.repeat) {
            this._log(`Repeating song.`);

            // Queue back in & dequeue to play
            this.queue.unshift(this.currentTask);
            this._dequeue();

            return;
        }

        // ? Inactivity Check
        if (this.free) {
            this._log(`Detected idle player.`);

            // Prevent from staying in channel forever.
            this._inactivityCheck((inactive) => {
                if (inactive) {
                    this.emit('timeoutLeave');
                }
            });

            return;
        }

        // ? Shuffle Feature
        if (this.shuffle) {
            this.queue.shuffle();
            this._log(`Shuffled queue!`);
        }

        // ? Next Song Decision
        if (this.autoplay) {
            this._log(`Autoplay: Dequeuing next task.`);
            this._dequeue();
        } else {
            this._log(`Autoplay is off. Will not start next song.`);
        }
    }

    /* eslint-disable no-unused-vars */
    async _onSpeakEvent (isPlaying) {
        // ! This is called every stream tick
    }

    /********************
     * Event functions  *
     * ? Connection     *
    ********************/

    async _onConnectionError (err) {
        this._log(`${err.message}`, 'error');
    }

    // ? May trigger after a region change.
    async _onReconnect () {
        this._log('Vulcan voice connection has reconnected.', 'warn');
    }

    /********************
     * Internal methods *
    ********************/

    _log (str, type = 'log') {
        logger[type](`[MusicManager] => [${this.guild.name}] => [${caller.getData().functionName}] => ${str}`);
    }

    _inactivityCheck (cb) {
        this.checks.push(setTimeout(() => {
            // If still in after timeout and not playing
            if (this.idle) {
                this.leave();
                cb(true);
            } else {
                cb(false);
            }
        }, this.afkTimeout));

        // Peek
        return this.checks[this.checks.length - 1];
    }

    _URLtoID (url) {
        const match = url.match(
            /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );

        return match && match[1];
    }

    _isPlaylist (url) {
        // * Improve regex?
        let regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
        let match  = url.match(regExp);

        if (match && match[2]) {
            return match[2];
        }

        return null;
    }

    _shortenURL (url) {
        const short = `http://youtu.be/`;

        // Start
        let m = url.match('v=');

        if (m) {
            return `${short}${url.substring(m.index + 2)}`;
        }

        m = url.lastIndexOf('/');

        if (m) {
            return `${short}${url.substring(m + 1)}`;
        }

        return url;
    }

    async _loadPlaylistToArray (rurl) {
        // ! Cant have short here?
        // TODO: Improve
        const short = `http://youtu.be/`;
        const base  = `http://www.youtube.com/`;
        const str   = rurl;
        const split = (str.indexOf('watch') === -1)
            ? str
            :  `${base}playlist?list=${str.split('&list=')[1].split('&t=')[0]}`;

        const res   = await got(split);
        const $     = cheerio.load(res.body);
        const thumb = $('tr');

        return thumb.map((_index, el) => `${short}${el.attribs['data-video-id']}`).get();
    }

    /**
     * Prepares a task to be played.
     * Pushes task to Music Manager queue.
     * @param {MusicManager.Task} task The task to be enqueued.
     */
    async _enqueue (task) {
        // Flag - not idle
        this.loading = true;

        // To prepare task
        // * We load task song data on enqueue
        await task.load();

        // Flag & update
        this.loading = false;

        // Push data to queue
        this.queue.push(task);

        // Log
        this._log(`Enqueued a task.`);
    }

    /**
     * Dequeues a task.
     * ! Creates stream and plays song through connection.
     * Updates Music Manager state.
     */
    async _dequeue () {
        if (this.free) {
            throw new Error('Queue is empty!');
        }

        // Task
        const task = this.queue[0];

        // Pick song from task
        task.ready();

        // Dequeue task, if no more songs
        if (task.songs.length <= 0) {
            this.queue.shift();
        }

        // Create stream
        const stream = await ytdl(
            task.song.url,
            // ? ytdl options (ytdlcd is optimised for discord but uses ytdl options)
            {
                filter : 'audioonly',
                quality: 'highestaudio'
            }
        );

        // New dispatcher every new song
        this.dispatcher = null;

        // ! This starts the song
        try {
            this.dispatcher = this.connection.play(
                stream,
                {
                    bitrate: 'auto', // Use voice channel's bit rate
                    passes : 4,      // Proportional to bandwidth
                    volume : false,  // Disallow volume control
                    type   : 'opus'
                }
            );
        } catch (err) {
            this.destroy();

            return logger.warn(err);
        }

        // ? Setup events
        this.dispatcher.on('error', logger.warn);
        this.dispatcher.on('debug', logger.debug);
        this.dispatcher.on('start', this._onStartPlaying.bind(this));
        this.dispatcher.on('speaking', this._onSpeakEvent.bind(this));
        this.dispatcher.on('finish', this._onFinishPlaying.bind(this));
        this.dispatcher.on('volumeChange', this._onVolumeChange.bind(this));

        // ? Update state
        // We are now procesing this task
        this.currentTask = task;

        // Update history
        if (this.history.length > this.maxHistory) {
            this.history = [];
        }

        // History
        this.history.push(task);

        // Log
        this._log(`Dequeued a task.`);
    }

    /********************
     * External methods *
    *********************/

    /**
     * Creates a new connection to a voice channel.
     * Joins that channel and sets up connection events.
     * @param {*} voiceChannel Voice channel to join.
     */
    async join (voiceChannel) {
        voiceChannel = this.guild.channels.resolve(voiceChannel);

        if (!voiceChannel) {
            throw new Error(`Could not resolve voice channel.`);
        }

        // ? Create connection & join channel
        this.connection = await voiceChannel.join();
        this.connection.on('warn', logger.warn);
        this.connection.on('error', this._onConnectionError.bind(this));
        this.connection.on('reconnecting', this._onReconnect.bind(this));

        // ? Begin inactivity check
        this._inactivityCheck((inactive) => {
            if (inactive) {
                this.emit('timeoutLeave');
            }
        });

        // Log
        this._log(`Joined voice channel '${voiceChannel.name}' and set up connection events.`);
    }

    /**
     * Leaves current voice channel.
     * Destroys Music Manager instance.
     */
    async leave () {
        if (!this.connection) {
            throw new Error(`Not connected to a voice channel.`);
        }

        // Send end event
        this.connection.disconnect();

        // Reset the status
        this.destroy();

        // Log
        this._log(`Music manager has left.`);
    }

    /**
     * Resolves a SongResolvable into a valid url.
     * @param {RequestResolvable} request Musica Manager request to resolve
     * @returns {Request} A Music Manager Request
     */
    async resolveRequest (request) {
        // ? Right now all requests come as strings.
        request = String(request);

        // Request type
        let url  = null;
        let type = null;

        // Resolve url
        if (this._isPlaylist(request)) {
            url = request;
        } else if (ytdl.validateURL(request)) {
            url = request;
        } else if (ytdl.validateID(request)) {
            url = `http://www.youtube.com/watch?v=${request}`;
        } else { // ? Search for a video with those keywords.
            const ytResults = (await ytsr(request)).items;

            if (ytResults.length <= 0) {
                return null;
            }

            url = ytResults[0].link;
        }

        // Resolve type
        if (this._isPlaylist(url)) {
            type = MusicManager.Request.YOUTUBE_PLAYLIST;
        } else {
            type = MusicManager.Request.YOUTUBE_VIDEO;
            // * Only single video supported, check _isPlaylist!
            url = this._shortenURL(url);
        }

        return new MusicManager.Request(
            this,
            url,
            this._URLtoID(url),
            type
        );
    }

    /**
     * Parses a music request.
     * Enqueues request and, if possible, plays the request.
     * @param {RequestResolvable} request The request to be resolved
     * @param {GuildMember} requester The guild member that initiated the request via a discord command
     * @param {TextChannel} source The text channel from which the author made the request
     */
    async request (request, requester, source) {
        source = this.guild.channels.resolve(source);

        if (!source) {
            throw new Error(`Could not resolve channel`);
        }

        requester = this.guild.members.resolve(requester);

        if (!requester) {
            throw new Error(`Could not resolve requester.`);
        }

        // Notify of request resolving
        const m = await source.send(`:gear: \`Resolving Request...\``);

        // Resolve
        request = await this.resolveRequest(request);

        // There may be no resolve!
        if (!request) {
            await m.edit(`:gear: \`Found no results for request! :(\``);

            return this._log('Could not resolve request.', 'warn');
        }

        // Notify of enqueue
        await m.edit(`:gear: \`Processing Request: ${request.id}\``);

        // Generate task
        await this._enqueue(new MusicManager.Task(
            this,
            request,
            requester,
            source
        ));

        // Notify of completed enqueue
        await m.edit(`:gear: \`Request Processed\``);

        // If idle, dequeue to play a song
        if (this.idle) {
            this._log('Music Player idle, dequeuing task from request.');

            await this._dequeue();
        }

        // Log
        this._log(`Request processed.`);
    }

    async forcePlay (idOrURL, requestChannel, requestAuthor) {
        throw new Error(`Not implemented yet.`);
    }

    pause () {
        if (!this.dispatcher) {
            throw new Error(`Dispatcher not found on pause.`);
        }

        this.shouldPause = true;
        this.dispatcher.pause();

        // Log
        this._log(`Requesting pause. Song will be paused!`);
    }

    resume () {
        if (!this.dispatcher) {
            throw new Error(`Dispatcher not found on resume.`);
        }

        this.shouldPause = false;
        this.dispatcher.resume();

        // Log
        this._log(`Requesting resume. Song will be resumed!`);
    }

    skip (force = false) {
        if (!this.dispatcher) {
            throw new Error(`Dispatcher not found on skip.`);
        }

        // Send end event
        this.dispatcher.end();

        if (force) {
            this.dispatcher.destroy();
        }

        // Log
        this._log(`Skipping current song. Force: ${force}`);
    }

    prune () {
        this.queue = [];

        // Log
        this._log(`Removed all elements from player queue.`);
    }

    purge () {
        if (this.dispatcher) {
            this.dispatcher.end();
        }

        // Reset to defaults
        this.queue       = [];
        this.autoplay    = true;
        this.repeat      = false;
        this.shouldPause = false;
        this.shuffle     = false;

        // Log
        this._log(`Reset Music Manager state to defaults.`);
    }

    destroy () {
        // Purge
        this.purge();

        // Clean these up at the end of event loop
        setTimeout(() => {
            this.connection  = null;
            this.dispatcher  = null;
            this.currentTask = null;
        }, 0);

        // Clear checks
        this.checks.forEach((check) => clearTimeout(check));

        // Log
        this._log(`Destroyed Music Manager.`);
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
}

MusicManager.Request = class {
    constructor (manager, url, id, type) {
        if (typeof url !== 'string') {
            throw new Error(``);
        }

        this.url    = url;
        this.id     = id;
        this.type   = type;
        this.mnager = manager;
        this.client = manager.client;
    }
};

// Constants for types
MusicManager.Request.YOUTUBE_VIDEO    = 1;
MusicManager.Request.YOUTUBE_PLAYLIST = 2;

MusicManager.Task = class {
    constructor (manager, request, requester, source) {
        this.request   = request;
        this.requester = requester;
        this.source    = source;
        this.manager   = manager;
        this.client    = manager.client;
        this.songs     = [];
        this.song      = null;
    }

    async load () {
        let urls = [this.request.url];
        let rmsg = null;
        let i    = 1;

        if (this.request.type === MusicManager.Request.YOUTUBE_PLAYLIST) {
            urls = await this.manager._loadPlaylistToArray(urls[0]);

            // Notify of playlist
            rmsg = await this.source.send(`:musical_note: :notepad_spiral: \`Playlist Detected!\``);
        }

        const etime = urls.length * 550;

        for (let url of urls) {
            if (!url) {
                continue;
            }

            const info = await ytdl.getInfoAsync(url);

            // * Weird properties :c
            this.songs.push({
                url,
                name     : info.title,
                loudness : info.loudness,
                author   : info.player_response.videoDetails.author,
                seconds  : parseInt(info.length_seconds, 10),
                thumbnail: info.player_response.videoDetails.thumbnail
            });

            // Notify playlist loading
            if (rmsg && (i === urls.length) || (i % 5 === 0)) {
                rmsg.edit(
                    `:musical_note: :notepad_spiral: \`Playlist Loading | Song ${i}/${urls.length} | Expected Time: ${Math.formatMilliseconds(etime)}\``
                );
            }

            i++;
            this.manager._log(`Loaded a song: ${url}`);
        }

        return this.songs;
    }

    ready () {
        this.song = this.songs.shift();
    }
};

module.exports = MusicManager;
