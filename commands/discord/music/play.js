const play          = module.exports;
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

play.execute = async (message) => {
    // Requester must be in a voice channel
    const voiceChannelToJoin = message.member.voice.channel;

    if (!voiceChannelToJoin) {
        return message.client.emit('channelInfo', message.channel, `Play requester (${message.author.tag}) must be in a voice channel!`);
    }

    const musicController = message.guild.musicController;
    const request         = message.parsed.args[0];

    // If no URL/ID is provided restart playing song or play whatever is at front of queue.
    if (!request) {
        if (musicController.isQueueEmpty()) {
            return message.client.emit('channelWarning', message.channel, 'Queue is empty and no URL/ID was passed!');
        }

        message.client.emit('channelInfo', message.channel, 'Playing whatever is at front of queue. (or restarting current song)');
        return musicController.play();
    }

    // Join voice if it does not match with requesters
    if (musicController.voiceChannel !== voiceChannelToJoin) {
        await musicController.joinVoice(voiceChannelToJoin);
    }

    // Queue song
    await musicController.loadItem(request, message.channel, message.author);

    if (!musicController.isQueueEmpty()) {
        await message.channel.send(messageEmbeds.reply(
            {
                message,
                description: 'Queued an item to the music player.',
                fields: [
                    { name: 'Queued Song', value: request },
                    { name: 'Queue Size',  value: musicController.queue.length }
                ]
            }
        ));

        // If nothing is playing and the song was queued
        if (!musicController.playing) {
            await musicController.play();
        }
    } else {
        return message.client.emit('channelWarning', message.channel, 'Music player was unable to queue the request!');
    }
};
