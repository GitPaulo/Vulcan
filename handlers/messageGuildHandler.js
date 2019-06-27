const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

module.exports = async (message) => {
    let cmd               = message.command;
    let isExternallyValid = await cmd.validate(message);
    let isSpamming        = cmd.isSpamming(message.author);
    let isAuthorised      = cmd.validatePermissions(message);
    let canExecute        = !isSpamming && isExternallyValid && isAuthorised;

    if (canExecute) {
        await cmd.execute(message);
    } else {
        await message.channel.send(messageEmbeds.warning(
            {
                title: 'Command: Execution Blocked',
                description: isSpamming
                                ? `Potential spamming has been detected.\nCommand '${cmd.id}' was **blocked**.`
                                : isExternallyValid
                                    ? `Command **validation** has failed.`
                                    : `Not authorised to run command.\n\t(Lacking Vulcan Permissions)`,
                fields: [
                    {
                        name: 'Throttle Value',
                        value: `${cmd.throttling}ms`
                    }
                ]
            }
        ));
    }
};
