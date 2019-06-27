const { promisify } = xrequire('util');
const Discord       = xrequire('discord.js');
const ytdl          = xrequire('ytdl-core');
const ytdlcd        = xrequire('ytdl-core-discord');
const httpFunctions = xrequire('./plugins/libs/httpFunctions');
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');
const logger        = xrequire('./managers/LogManager').getInstance();

ytdl.getInfoAsync = promisify(ytdl.getInfo);

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
        // Dequeue when loadedSong is over. Queue next if possible.
        if (!isSpeaking && !this.paused && !this.isQueueEmpty()) {
            if (!this.repeat)
                this.queue.shift();

            if (!this.isQueueEmpty() && this.autoplay) {
                this.log(`Playing next song...`);
                this.play(this.requestChannel);
            } else {
                if (!this.shouldPause) {
                    this.dispatcher.destroy();
                    this.dispatcher = null;
                    this.log(`No more songs to play. Destroying dispatcher...`);
                } else {
                    this.log(`Song paused!`);
                }
            }
        }
    }

    /*******************
     * Utility methods *
    ********************/

    log (str) {
        logger.log(`[MusicController] => [${this.guild.name}] => ${str}`);
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

    async enqueue (idOrUrl, requestChannel, requestAuthor) {
        if (typeof idOrUrl !== 'string')
            throw Error('Invalid id or url for the queued song. Must be a string.');

        if (!(requestChannel instanceof Discord.TextChannel))
            throw Error('Invalid text channel of request! (May happen if channel was deleted)');

        if (!((requestAuthor instanceof Discord.User) || (typeof requestAuthor === 'string')))
            throw Error('Invalid request author!');

        const metadata = JSON.parse(await httpFunctions.requestYoutubeData(idOrUrl));
        const ytdldata = await ytdl.getInfoAsync(idOrUrl);

        this.queue.push(
            {
                name: metadata.title,
                url: idOrUrl,
                // eslint-disable-next-line no-mixed-operators
                requestAuthor: ((typeof requestAuthor === 'string') && requestAuthor || requestAuthor.tag),
                author: metadata.author,
                authorUrl: metadata.author_url,
                thumbnailUrl: metadata.thumbnail_url,
                loudness: ytdldata.loudness,
                seconds: parseInt(ytdldata.length_seconds)
            }
        );

        // Update last request channel.
        // This is were the vulcan replies are sent to.
        this.requestChannel = requestChannel;

        logger.log(`Enqueued song id: '${idOrUrl}' requested by '${requestAuthor.tag}' from channel '${this.requestChannel.name}'.`);
    }

    async forcePlay (idOrUrl, requestChannel, requestAuthor) {
        await this.enqueue(idOrUrl, requestChannel, requestAuthor);

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
        if (force)
            this.dispatcher.destroy();
        this.dispatcher.end();
        this.log(`Skipping current song. Force: ${force}`);
    }

    prune () {
        this.queue = [];
        this.log(`Pruned music controller state.`);
    }

    purge () {
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
}

module.exports = MusicController;
