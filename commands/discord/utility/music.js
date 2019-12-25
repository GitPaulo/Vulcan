const music         = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

music.execute = async (message) => {
    const voiceChannelToJoin = message.member.voice.channel;
    const musicManager       = message.guild.musicManager;

    // Join voice if it does not match with requesters
    if (musicManager.voiceChannel === voiceChannelToJoin) {
        return message.client.emit(
            'channelInformation',
            message.channel,
            'Vulcan is already in your voice channel!'
        );
    }

    // Join voice
    await musicManager.joinVoice(voiceChannelToJoin);

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: `Vulcan is now ready to play music on \`${voiceChannelToJoin.name}\` :musical_note:`
        }
    ));
};
