const logger        = xrequire('./managers/LogManager').getInstance();
const messageEmbeds = xrequire('./modules/utility/messageEmbeds');

module.exports = async message => {
    let vulcan = message.client;

    if (!vulcan)
        return logger.error('Vulcan client not defined in message!');

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
        await message.channel.send(messageEmbeds.error(message.author.username, 'Command Validation', `Command Parse error: \`${parseError.message}\``));

    if (message.isCommand) {
        // check permissions, then check arguments are valid
        let cmd = message.command;     
        
        if (!cmd.validatePermissions(message)) {
            message.channel.send(messageEmbeds.warning(
                {
                    authorName: message.author.username,
                    title: 'Command Permissions',
                    description: `You do not have permission to run this command!`
                }
            ));
            return;
        }

        let argumentsValidation = cmd.validateMessageArguments(message); // Returns an object: { isValid: (boolean), list: (array) } // list: array with entries related to index of the invalid arg
        if (!argumentsValidation.isValid) {
            let invalidArguments = validation.list.toString();
            await message.channel.send(messageEmbeds.warning(
                {
                    title: 'Command: Argument Validation',
                    description: `The arguments corresponding to positions: \`${invalidArguments}\` did not match the expected types!`
                }
            ));
            return;
        }

        let isSpamming        = cmd.isSpamming(message.author);
        let isExternallyValid = await cmd.validate(message);
        let canExecute        = !isSpamming && isExternallyValid;

        if (canExecute) {
            await cmd.execute(message);
        } else {
            await message.channel.send(messageEmbeds.warning(
                {
                    title: 'Command: Execution',
                    description: isSpamming ? `Potential spamming has been detected.\nCommand '${cmd.name}' was **blocked**.` : `Command **validation** has failed.`,
                    fields: [
                        {
                            name: 'Throttle Value',
                            value: `${cmd.throttling}ms`
                        }
                    ]
                }
            ));
        }
    } else {
        await message.channel.send(messageEmbeds.warning(
            {
                title: 'Command: Existance Check',
                description: `The command you have entered does **not** exist!`,
                fields: [
                    {
                        name: 'Input',
                        value: `\`${message.content}\``
                    }
                ]
            }
        ));
    }
};
