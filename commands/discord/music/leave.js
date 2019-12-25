const leave         = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

leave.execute = async (message) => {
    const musicManager = message.guild.musicManager;
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
        return message.client.emit(
            'channelInformation',
            message.channel,
            `Vulcan is currently not in voice!`
        );
    }

    // Leave voice channel
    musicManager.leaveVoice();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: 'Destroyed music player and left voice channel.',
            fields     : [
                {
                    name : 'Is Playing?',
                    value: musicManager.playing || 'Unknown'
                },
                {
                    name : 'Queue Size',
                    value: musicManager.queue.length || 'No Queue'
                }
            ]
        }
    ));
};
