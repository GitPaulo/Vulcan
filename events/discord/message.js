const mgHandler = xrequire('./handlers/messageGuildHandler');
const mdHandler = xrequire('./handlers/messageDirectHandler');
const parser    = xrequire('./handlers/messageParserHandler');
const filter    = xrequire('./handlers/messageFilterHandler');
const logger    = xrequire('./managers/LogManager').getInstance();

module.exports = async (message) => {
    try {
        const vulcan = message.client;
        logger.log(
            `[${message.isDirectMessage() ? 'Direct Message' : message.guild.name}@${message.channel.name}]`
            + ` => `
            + `[${message.author.tag}(${message.author.id})]`
            + ` => `
            + `"${message.content || 'Empty?'}"`
        );

        // Filter contents of message
        if (await filter(message)) {
            return;
        }

        // Prohibit parsing of self messages or from other bots
        if (message.author.bot) {
            return;
        }

        // Validate prefix [FIX] + random console outputs
        if (message.content.match(new RegExp(`^(${vulcan.configuration.prefixes.join('|')})`, 'i')) === null) {
            return;
        }

        // Check if Vulcan can respond
        if (message.channel.type === 'text' && !message.guild.me.hasPermission('SEND_MESSAGES')) {
            return;
        }

        /* if (author is blacklisted){} TODO */

        // Parse message and initialise message.command & parse data
        message.setParsed(await parser(message));

        // Check if message was a valid command
        if (!message.isCommand) {
            return message.client.emit('channelWarning', message.channel, `The command request \`${message.content}\` is invalid.`);
        }

        // Call Appropriate message handler
        await (message.isDirectMessage() ? mdHandler : mgHandler)(message);

        // Register Recent Call for command [throttling]
        message.command.addCall(message.author);
    } catch (err) {
        message.client.emit('channelError', message.channel, err);
    }
};
