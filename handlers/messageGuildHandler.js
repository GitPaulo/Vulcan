const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

module.exports = async (message) => {
    if (message.isCommand) {
        let cmd               = message.command;
        let isExternallyValid = await cmd.validate(message);
        let isSpamming        = cmd.isSpamming(message.author);
        let canExecute        = !isSpamming && isExternallyValid;

        if (canExecute) {
            await cmd.execute(message);
        } else {
            await message.channel.send(messageEmbeds.warning(
                {
                    title: 'Command: Execution Blocked',
                    description: isSpamming ? `Potential spamming has been detected.\nCommand '${cmd.id}' was **blocked**.` : `Command **validation** has failed.`,
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
