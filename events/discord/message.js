/**
 * ? Message (Discord Event)
 * Emitted whenever a message is created.
 * (https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-message)
 */

/* eslint-disable complexity */
/* eslint-disable max-statements-per-line */

// ? Load handlers
const settings  = xrequire('./prerequisites/settings');
const lgHandler = xrequire('./handlers/messageLogHandler');
const atHandler = xrequire('./handlers/messageAtsHandler');
const gdHandler = xrequire('./handlers/messageGuildHandler');
const dmHandler = xrequire('./handlers/messageDirectHandler');
const prHandler = xrequire('./handlers/messageParserHandler');
const flHandler = xrequire('./handlers/messageFilterHandler');
const cgHandler = xrequire('./handlers/messageCategoryHandler');

// Avoid new object every message
const prefixes    = settings.configuration.prefixes;
const prefixRegex = new RegExp(`^(${prefixes.join('|').regexEscape(['|'])})`, 'u');

/**
 * ? Notes:
 * In this file, jandlers are conditionally bound independent code sections.
 * ! Do NOT call handlers within contitional statements.
 * All controlling logic must be done in this file.
*/

module.exports = async (message) => {
    // Destructoring
    let client; const {
        user,
        blacklist
    } = (client = message.client);

    const {
        configuration
    } = settings;

    try {
        // Log messages
        if (configuration.logMessages) {
            await lgHandler(message);
        }

        // Filter contents of message if they are not authored by Vulcan
        if (configuration.filterMessages && (message.author !== user)) {
            await flHandler(message);
        }

        // Handle extended ats
        if (configuration.extendedAts.enabled) {
            await atHandler(message);
        }

        // Prohibit parsing of self messages from other bots
        if (message.author.bot) {
            return;
        }

        // Validate cached prefix
        if (!message.content.match(prefixRegex)) {
            return;
        }

        // Prevents invalid strings early
        // * Identile strings and prefix only messages.
        if (message.cleanContent.isIdentile() || message.cleanContent.replace(prefixRegex, '').length <= 0) {
            return;
        }

        // Check if author is blacklisted
        if (blacklist.get(message.author.id)) {
            return client.emit(
                'commandRestricted',
                message,
                `You are blacklisted and therefore blocked from using Vulcan commands.`
            );
        }

        // Parse message and initialise message.command & parse data
        await prHandler(prefixRegex, message);

        // Check if message was a valid command. Output similarity aid if not
        if (!message.command) {
            return client.emit(
                'commandInvalid',
                message
            );
        }

        // Check if command is disabled
        if (message.command.disabled) {
            return client.emit(
                'commandBlocked',
                message,
                `Command '${message.command.id}' has been disabled!`
            );
        }

        // Check if command is loaded
        if (!message.command.loaded) {
            return client.emit(
                'commandBlocked',
                message,
                `Command '${message.command.id}' has not yet loaded!`
            );
        }

        // Check Authorisation level of message author
        if (!message.command.allowsUser(message)) {
            return client.emit(
                'commandRestricted',
                message,
                `Not authorised to run command '${message.command.id}'!`
            );
        }

        // Check for spam
        if (message.command.isSpamming(message.author)) {
            return client.emit(
                'commandBlocked',
                message,
                `Potential spamming has been detected.`
            );
        }

        // Certain command categories require extra checks (music & nsfw)
        // TODO: Remove handler from IF expression
        if (configuration.categoryLocks && !(await cgHandler(message))) {
            return;
        }

        // Assign correct handler depending on cmd env
        if (!(await (message.direct ? dmHandler : gdHandler)(message))) {
            return;
        }

        // Call
        await message.command.execute(message);

        // Register a successful call
        if (configuration.registerCmdCalls) {
            message.command.registerCall(message.author);
        }
    } catch (err) {
        client.emit(
            'channelError',
            message.channel,
            err
        );
    }
};
