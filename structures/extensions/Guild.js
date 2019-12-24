const MusicManager = xrequire('./managers/MusicManager');
const logger       = xrequire('./managers/LogManager').getInstance();

module.exports = class _Guild extends xrequire('discord.js').Guild {
    constructor (...args) {
        super(...args);

        // Each guild has one music controller
        this.musicManager = new MusicManager(this);

        // Name of bot channel
        this.botChannelName = 'bot-dump';
    }

    async requestAuthorisation (requestee = this.client.user) {
        const vulcan = this.client;
        const owners = vulcan.configuration.ownersID;

        if (owners.length <= 0) {
            return logger.warn(
                `No bot owners have been configured! There is no one to send authorisation request!\n\t`
                + `Please configure them in: ${vulcan.defaults.settings.configuration.location}`
            );
        }

        // Ask owners to accept request.
        for (let ownerID of owners) {
            const cachedOwner = vulcan.users.get(ownerID);

            if (!cachedOwner) {
                return logger.warn(`Invalid owner ID in configuration cache?`);
            }

            const dmChannel  = await cachedOwner.createDM();
            const requestMsg = await dmChannel.send(`\`\`\`New Guild Authorisation Request\n\tName: ${this.name}\n\tID: ${this.id}\`\`\``);

            // Set up reactions
            const no     = '❎';
            const yes    = '✅';
            const filter = (reaction, user) => (reaction.emoji.name === yes
                || reaction.emoji.name === no) && user !== vulcan.user;

            // ! Rate limit is a WeirdChamp
            const fuckRateLimit = 1000;

            setTimeout(async () => {
                await requestMsg.react(no);
                setTimeout(async () => {
                    await requestMsg.react(yes);
                }, fuckRateLimit);
            }, fuckRateLimit);

            // Collect!
            // ? Reminder: this will await until bot shutdown or request is answered.
            // ! If dev mode. Don't forget reload changes this, lol.
            requestMsg.awaitReactions(filter, { max: 1 })
                .then(async (collected) => {
                    // What was the decision?
                    const answer = (collected.first().emoji.name === yes);
                    const ansStr = answer ? 'APPROVED' : 'REJECTED';

                    if (answer) {
                        this.client.authoriseGuild(this.id);
                    }

                    // DM respond (cant self DM!)
                    if (requestee !== this.client.user) {
                        (await requestee.createDM()).send(
                            `Guild authorisation request for (${this.name}) has been **${ansStr}** by: ${cachedOwner.tag}`
                        );
                    }

                    // Update message
                    await requestMsg.edit(
                        `${requestMsg.content.substring(0, requestMsg.content.length - 3)}\n\tStatus: ${ansStr}\n\tResponder: ${cachedOwner.tag}\`\`\``
                    );

                    // Authorisation event!
                    this.client.emit('guildAuthorisation', this, cachedOwner, requestee, answer);
                }).catch(async (...args) => {
                    logger.error(args);
                    // Notify users?
                });
        }

        logger.log(`Guild authorisation request received by ${requestee.tag} for guild: ${this.name}(${this.id})`);
    }

    // ! May cause infinite loop
    get botChannel () {
        return this.channels.array().filter((channel) => channel.name === this.botChannelName).pop()
            || this.systemChannel || this.channels.array()[0];
    }

    get authorised () {
        return this.client.servers.get(this.id);
    }

    findChannelsByName (name, type = 'text') {
        return this.channels.array().filter((channel) =>
            (channel.name === name)
            && (type === channel.type));
    }
};
