const play          = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

play.execute = async (message) => {
    // Requester must be in a voice channel
    const voiceChannelToJoin = message.member.voice.channel;

    if (!voiceChannelToJoin) {
        return message.client.emit('channelInfo', message.channel, `Play requester (${message.author.tag}) must be in a voice channel!`);
    }

    const musicManager = message.guild.musicManager;
    const request         = message.parsed.args[0];

    // If no URL/ID is provided restart playing song or play whatever is at front of queue.
    if (!request) {
        if (musicManager.queueEmpty) {
            return message.client.emit('channelWarning', message.channel, 'Queue is empty and no URL/ID was passed!');
        }

        message.client.emit('channelInfo', message.channel, 'Playing whatever is at front of queue. (or restarting current song)');

        return musicManager.play();
    }

    // Join voice if it does not match with requesters
    if (musicManager.voiceChannel !== voiceChannelToJoin) {
        await musicManager.joinVoice(voiceChannelToJoin);
    }

    // Queue song
    await musicManager.loadItem(request, message.channel, message.author);

    if (!musicManager.queueEmpty) {
        await message.channel.send(messageEmbeds.reply(
            {
                message,
                description: 'Queued an item to the music player.',
                fields     : [
                    { name: 'Queued Song', value: request },
                    { name: 'Queue Size',  value: musicManager.queue.length }
                ]
            }
        ));

        // If nothing is playing and the song was queued
        if (!musicManager.playing) {
            await musicManager.play();
        }
    } else {
        return message.client.emit('channelWarning', message.channel, 'Music player was unable to queue the request!');
    }
};
