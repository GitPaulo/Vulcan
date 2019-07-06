const list          = module.exports;
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

list.execute = async (message) => {
    const musicController = message.guild.musicController;

    if (musicController.queueEmpty) {
        return message.client.emit('channelInfo', message.channel, 'Music player queue is empty!');
    }

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                {
                    name: 'Queue (as list)',
                    value: musicController.queueString()
                }
            ]
        }
    ));
};
