const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

module.exports = async (message) => {
    let cmd               = message.command;
    let isSpamming        = cmd.isSpamming(message.author);
    let isAuthorised      = cmd.validatePermissions(message);
    let canExecute        = !isSpamming && isAuthorised;

    if (canExecute) {
        await cmd.execute(message);
    } else {
        await message.channel.send(messageEmbeds.warning(
            {
                title: 'Command: Execution Blocked',
                description: isSpamming
                                ? `Potential spamming has been detected.\nCommand '${cmd.id}' was **blocked**.`
                                : isAuthorised
                                    ? `Not authorised to run command.\n\t(Lacking Vulcan Permissions)`
                                    : `Not authorised and you are spamming D:<!`,
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
