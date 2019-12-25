const list          = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

list.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    if (musicManager.queueEmpty) {
        return message.client.emit('channelInformation', message.channel, 'Music player queue is empty!');
    }

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                {
                    name : 'Queue (as list)',
                    value: musicManager.queueString()
                }
            ]
        }
    ));
};
