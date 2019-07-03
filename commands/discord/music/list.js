const list          = module.exports;
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

list.execute = async (message) => {
    const musicController = message.guild.musicController;

    if (musicController.isQueueEmpty()) {
        return message.client.emit('channelInfo', message.channel, 'Music player queue is empty!');
    }

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
};
