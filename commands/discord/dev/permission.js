const permission    = module.exports;
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

permission.execute = async (message) => {
    const argsLength = message.parsed.args.length;

    if (argsLength < 1) {
        return message.client.emit('invalidCommandCall', `Expected at least 1 argument.`, message);
    }

    const cmd               = message.parsed.args[0];
    const permissionManager = message.client.permissionManager;
    const embedWrap         = messageEmbeds.reply({
        message,
        title: `Permissions request received`,
        fields: [
            {
                name: 'Arguments',
                value: ((argsLength === 0) ? 'none' : message.parsed.args.join(', '))
            },
            {
                name: 'Output',
                value: 'Processing...'
            }
        ]
    });

    const reply = await message.channel.send(embedWrap);

    switch (cmd) {
        case 'check':
            if (!message.parsed.args[1]) {
                return message.client.emit('invalidCommandCall', `Expected 2 arguments.`, message);
            }

            let id         = message.parsed.args[1].slice(3, -1);
            let permission = permissionManager.getUserPermissions(id, true);

            embedWrap.embed.fields[1].value = permission;
            reply.edit(embedWrap);
            break;
        default:
            return message.client.emit(
                'invalidCommandCall',
                `The command **${cmd}** was not found in the list of sub-commands for this operation.`,
                message
            );
    }
};
