const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');
const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');

class Permission extends DiscordCommand {
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        let permissionManager = message.client.permissionManager;
        let argsLength        = message.args.length;
        let replyEmbedData    = {
            replyeeMessage: message,
            title: `Permissions request received`,
            fields: [
                {
                    name: 'Arguments',
                    value: ((message.args.length === 0) ? 'none' : message.args.join(', '))
                },
                {
                    name: 'Output',
                    value: 'Processing...'
                }
            ]
        };

        let premessage = await message.channel.send(messageEmbeds.reply(replyEmbedData));

        if (argsLength < 1) {
            return message.client.emit('invalidCommandCall', `Expected at least 1 argument.`, message);
        } else {
            switch (message.args[0]) {
                case 'check':
                    if (!message.args[1])
                        return message.client.emit('invalidCommandCall', `Expected 2 arguments.`, message);

                    let id         = message.args[1].slice(3, -1);
                    let permission = permissionManager.getUserPermissions(id, true);

                    replyEmbedData.fields[1].value = permission;
                    premessage.edit(messageEmbeds.reply(replyEmbedData));
                    break;
                default:
                    break;
            }
        }
    }
}

module.exports = Permission;
