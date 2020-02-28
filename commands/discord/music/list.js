const list          = module.exports;
const hastebin      = xrequire('./modules/hastebin');
const messageEmbeds = xrequire('./modules/messageEmbeds');

list.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    if (musicManager.queueEmpty) {
        return message.client.emit('channelInformation', message.channel, 'Music player queue is empty!');
    }

    let queueString = musicManager.queueString();

    if (queueString.length > 1024) {
        queueString = await hastebin.post(queueString);
    }

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            title      : ':musical_note: | :notepad_spiral:  - Queue List',
            description: '',
            fields     : [
                {
                    name : 'Queue (as list)',
                    value: queueString
                }
            ]
        }
    ));
};
