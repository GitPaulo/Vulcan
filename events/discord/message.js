const mgHandler = xrequire('./handlers/messageGuildHandler');
const mdHandler = xrequire('./handlers/messageDirectHandler');
const parser    = xrequire('./handlers/messageParserHandler');
const filter    = xrequire('./handlers/messageFilterHandler');
const ats       = xrequire('./handlers/messageAtsHandler');
const logger    = xrequire('./managers/LogManager').getInstance();

/* eslint-disable complexity */
module.exports = async (message) => {
    try {
        // For now, log every message
        logger.log(
            `[${message.direct
                ? `Direct Message@${message.author.tag}`
                : `${((!message.guild.authorised && '[*UNAUTH*] => ' || '') + message.guild.name)}@${message.channel.name}`}]`
            + ` => `
            + `[${message.system ? 'Discord System' : `${message.author.tag}(${message.author.id})`}]`
            + ` => `
            + `"${message.cleanContent || (message.embeds.length ? `[Embeds: ${message.embeds.length}]` : `[Attachments Only]`)}"`
        );

        // Log any attachments
        if (message.attachments.size > 0) {
            logger.debug(message.attachments);
        }

        // Filter contents of message if they are not authored by Vulcan
        if ((message.author !== message.client.user) && await filter(message)) {
            return;
        }

        // Prohibit parsing of self messages or from other bots
        if (message.author.bot) {
            return;
        }

        // Handle extended ats
        if (message.client.configuration.extendedAts) {
            await ats(message);
        }

        // Prevents spam
        if (message.cleanContent.isIdentile() || message.cleanContent.replace(message.client.prefixRegex, '').length <= 0) {
            return;
        }

        // Validate cached prefix
        if (!message.content.match(message.client.prefixRegex)) {
            return;
        }

        // Check if author is blacklisted
        if (message.client.blacklist.get(message.author.id)) {
            return message.client.emit(
                'invalidCommandCall',
                message,
                `The user ${message.author.tag} is blocked from using Vulcan commands.`
            );
        }

        // Parse message and initialise message.command & parse data
        message.setParsed(await parser(message));

        // Check if message was a valid command
        if (!message.isCommand) {
            return message.client.emit(
                'invalidCommandCall',
                message,
                `The command request \`${message.parsed.cmdName}\` is invalid.`
            );
        }

        // Check if command is disabled
        if (message.command.disabled) {
            return message.client.emit(
                'invalidCommandCall',
                message,
                `This command has been disabled!`
            );
        }

        // Check Authorisation level of message author
        if (!message.command.authenticate(message)) {
            return message.client.emit(
                'invalidCommandCall',
                message,
                `Not authorised to run command.\n\t(User Lacking Authority)`,
                [
                    {
                        name  : 'Usergroup',
                        value : `${JSON.stringify(message.client.fetchUsergroup(message.author.id))}`,
                        inline: true
                    },
                    {
                        name  : 'Required',
                        value : `${JSON.stringify({ name: message.command.group, level: message.client.hierarchy.get(message.command.group) })}`,
                        inline: true
                    }
                ]
            );
        }

        // Check for spam
        if (message.command.isSpamming(message.author)) {
            return message.client.emit(
                'invalidCommandCall',
                message,
                `Potential spamming has been detected.\nCommand '${message.command.id}' was **blocked**.`
            );
        }

        // Music command require caller to be in the same voice channel as bot
        if (
            message.command.category === 'music'
            && message.member.voice.channel
            && !message.member.voice.channel.members.get(message.client.user.id)
        ) {
            return message.client.emit(
                'invalidCommandCall',
                message,
                `Commands from the category \`music\` require the requestee to share a voice channel with the bot.\n\n`
                + `Use the command \`music\` to have the bot join your voice channel first!`
            );
        }

        // ! If something is returned from the handler then we had a problem!
        !(await (message.direct ? mdHandler : mgHandler)(message))
        && message.command.addCall(message.author);
    } catch (err) {
        message.client.emit('channelError', message.channel, err);
    }
};
