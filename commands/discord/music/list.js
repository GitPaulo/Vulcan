const list          = module.exports;
const hastebin      = xrequire('./modules/hastebin');
const messageEmbeds = xrequire('./modules/messageEmbeds');

list.execute = async (message) => {
    const musicManager = message.guild.musicManager;


    let queueString = musicManager.queueString();

    if (queueString.length > 1024) {
        queueString = await hastebin.post(queueString);
    }

    if (!queueString || queueString.length <= 0) {
        queueString = 'Queue is empty!';
    }

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            title : ':musical_note: | :notepad_spiral:  -  Song List',
            fields: [
                {
                    name : 'Ordering',
                    value: queueString
                }
            ]
        }
    ));
};
