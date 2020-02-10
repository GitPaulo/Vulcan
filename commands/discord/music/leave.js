const leave         = module.exports;
const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');

leave.execute = async (message) => {
    const musicManager = message.guild.musicManager;
    const voiceChannel = message.member.voice.channel;

    // If not in voice, don't leave!
    if (!voiceChannel) {
        return message.client.emit(
            'channelInformation',
            message.channel,
            `Vulcan is currently not in voice!`
        );
    }

    // Leave
    await musicManager.leaveVoice();

    // Notify
    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: 'Destroyed music player and left voice channel.',
            fields     : [
                {
                    name  : 'Is Playing?',
                    value : String(musicManager.playing),
                    inline: true
                },
                {
                    name  : 'Queue Size',
                    value : String(musicManager.queue.length),
                    inline: true
                }
            ]
        }
    ));
};
