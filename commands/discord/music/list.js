const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');
const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

class List extends DiscordCommand {
    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        const musicController = message.guild.musicController;

        if (musicController.isQueueEmpty())
            return message.client.emit('channelInfo', message.channel, 'Music player queue is empty!');

        await message.channel.send(messageEmbeds.reply(
            {
                replyeeMessage: message,
                fields: [
                    {
                        name: 'Queue (as list)',
                        value: musicController.queueString()
                    }
                ]
            }
        ));
    }
}

module.exports = List;
