/* eslint-disable complexity */
/* eslint-disable max-statements-per-line */

// ? Load handlers
const lgHandler = xrequire('./handlers/messageLogHandler');
const atHandler = xrequire('./handlers/messageAtsHandler');
const gdHandler = xrequire('./handlers/messageGuildHandler');
const dmHandler = xrequire('./handlers/messageDirectHandler');
const prHandler = xrequire('./handlers/messageParserHandler');
const flHandler = xrequire('./handlers/messageFilterHandler');
const cgHandler = xrequire('./handlers/messageCategoryHandler');

/*
*   [Note]
    In this file, Handlers are conditionally bound independent code sections.
!   Do NOT call handlers within contitional statements.
    All controlling logic must be done in this file.
    Handlers can also be used to reduce the complexity of this file. But don't over do it.
*/

module.exports = async (message) => {
    // Destructoring
    let client; const {
        user,
        commands,
        hierarchy,
        blacklist,
        prefixRegex,
        configuration
    } = (client = message.client);

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
                'invalidCommandCall',
                message,
                `The user ${message.author.tag} is blocked from using Vulcan commands.`
            );
        }

        // Parse message and initialise message.command & parse data
        await prHandler(message);

        // Check if message was a valid command. Output similarity aid if not
        if (!message.command) {
            return client.emit(
                'invalidCommandCall',
                message,
                `The command request \`${message.parsed.cmdName}\` is invalid.\n`
                + `\`\`\`\nDid you mean?\n${
                    commands.similar(message.parsed.cmdName).map((s) => `- ${s.reference}`).slice(0, 3).join('\n')
                }\`\`\``
            );
        }

        // Check if command is disabled
        if (message.command.disabled) {
            return client.emit(
                'invalidCommandCall',
                message,
                `This command has been disabled!`
            );
        }

        // Check Authorisation level of message author
        if (!message.command.authenticate(message)) {
            return client.emit(
                'invalidCommandCall',
                message,
                `Not authorised to run command.\n\t(User Lacking Authority)`,
                [
                    {
                        name  : 'Usergroup',
                        value : `${JSON.stringify(client.fetchUsergroup(message.author.id))}`,
                        inline: true
                    },
                    {
                        name  : 'Required',
                        value : `${JSON.stringify({ name: message.command.group, level: hierarchy.get(message.command.group) })}`,
                        inline: true
                    }
                ]
            );
        }

        // Check for spam
        if (message.command.isSpamming(message.author)) {
            return client.emit(
                'invalidCommandCall',
                message,
                `Potential spamming has been detected.\nCommand '${message.command.id}' was **blocked**.`
            );
        }

        // Certain command categories require extra chegs
        // ? music & nsfw
        // TODO: Remove handler from IF expression
        if (configuration.categoryLocks && (await cgHandler(message))) {
            return;
        }

        // Assign correct handler depending on cmd env
        // * For now, these functions make the call.
        if (message.direct) {
            await dmHandler(message);
        } else {
            await gdHandler(message);
        }

        // Call
        await message.command.execute(message);

        // Register a successful call
        if (configuration.registerCmdCalls) {
            message.command.addCall(message.author);
        }
    } catch (err) {
        client.emit(
            'channelError',
            message.channel,
            err
        );
    }
};
