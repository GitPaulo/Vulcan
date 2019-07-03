const forceplay     = module.exports;
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

forceplay.execute = async (message) => {
    const musicController = message.guild.musicController;

    let request = message.parsed.args[0];

    if (!request) {
        return message.client.emit('invalidCommandCall', `Expected 1 argument (song source), instead got nothing!`, message);
    }

    // Join voice if not already in
    if (!musicController.voiceChannel) {
        await musicController.joinVoice(message.member.voice.channel);
    }

    await musicController.forcePlay(request, message.channel, message.author);
    await message.channel.send(messageEmbeds.reply(
        {
            replyeeMessage: message,
            decription: 'Force played a song.\nWill play on top of queue without affecting queue state.',
            fields: [
                { name: 'Forced Song', value: request },
                { name: 'Current Queue Size',  value: musicController.queue.length }
            ]
        }
    ));
};
