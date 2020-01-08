const music         = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

music.execute = async (message) => {
    const voiceChannelToJoin = message.member.voice.channel;
    const musicManager       = message.guild.musicManager;
    const request            = message.parsed.argsString;

    // Join voice if it does not match with requesters
    if (musicManager.voiceChannel === voiceChannelToJoin) {
        return message.client.emit(
            'channelInformation',
            message.channel,
            'Vulcan is already in your voice channel!\n'
            + 'You are probably looking for the command: `play`'
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

    // If request, play immediatly
    if (request && request.length > 0) {
        // Send request
        await message.channel.send(messageEmbeds.reply(
            {
                message,
                description: `Music player request sent: \`\`\`\n${request}\`\`\``
            }
        ));

        // Queue song
        await musicManager.loadItem(request, message.channel, message.author);

        // If nothing is playing and the song was queued
        if (!musicManager.playing) {
            await musicManager.play();
        }
    }
};
