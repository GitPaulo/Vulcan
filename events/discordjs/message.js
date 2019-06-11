const logger        = xrequire('./managers/logManager').getInstance();
const messageEmbeds = xrequire('./modules/utility/messageEmbeds');

module.exports = async message => {
    // message.client === vulcan
    logger.info('[GUILD: ' + message.guild.name + '] => [MESSAGE][' + message.author.username + '][' + message.channel.name + ']: ' + message.content);

    // Don't respond to self - bad recursion can happen LULW
    if (message.author.bot) return;

    let found = false;
    for (let prefix of vulcan.configuration.prefixes) {
        found = found || Boolean(message.content[0] === prefix);
    }

    if (!found) return; // Before we parse, we must check that it's worth parsing!

    let parseError = xrequire('./handlers/messageHandler')(vulcan, message);

    if (parseError.hasError)
        message.channel.send(messageEmbeds.error(message.author.username, 'Command Validation', `Command Parse error: ${parseError.message}`));

    if (message.isCommand) {
        let cmd        = message.command;
        let validation = cmd.validateMessageArguments(message); // Returns an object: { isValid: (boolean), list: (array) } // list: array with entries related to index of the invalid arg

        if (!validation.isValid) {
            let invalidArguments = validation.list.toString();
            message.channel.send(messageEmbeds.warning(
                {
                    authorName: message.author.username,
                    title: 'Command Argument Validation',
                    description: `The arguments corresponding to positions: \`${invalidArguments}\` did not match the expected types!`
                }
            ));
            return;
        }

        let hasTimedOut       = cmd.checkTimeout(message.author);
        let isExternallyValid = await cmd.validate(message);
        let canExecute        = !hasTimedOut && isExternallyValid;

        if (canExecute) {
            await cmd.execute(message);
        } else {
            message.channel.send(messageEmbeds.warning(
                {
                    authorName: message.author.username,
                    title: 'Command Validation',
                    description: hasTimedOut ? 'Command Timeout triggered => WOA, WAIT YOU FUCKER!' : 'Command validation failed :(!'
                }
            ));
        }
    } else {
        message.channel.send(messageEmbeds.warning(
            {
                authorName: message.author.username,
                title: 'Command Existance Check',
                description: 'The command you have entered does not exist!'
            }
        ));
    }
};
