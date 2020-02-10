const play          = module.exports;
const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');

play.execute = async (message) => {
    const musicManager = message.guild.musicManager;
    const request      = message.parsed.argsString;

    // If no URL/ID is provided restart playing song or play whatever is at front of queue.
    if (!request) {
        if (musicManager.queueEmpty) {
            return message.client.emit(
                'channelWarning',
                message.channel,
                'Queue is empty and no URL/ID was passed!'
            );
        }

        // Play song!
        musicManager.play();

        return message.client.emit(
            'channelInformation',
            message.channel,
            'Playing whatever is at front of queue. (or restarting current song)'
        );
    }

    // Send request
    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: `Music player request sent: \`\`\`\n${request}\`\`\``
        }
    ));

    // Queue song
    await musicManager.loadItem(request, message.channel, message.author);

    // Behave depending on queue status
    if (!musicManager.queueEmpty) {
        // If nothing is playing and the song was queued
        if (!musicManager.playing) {
            await musicManager.play();
        }
    } else {
        return message.client.emit(
            'channelWarning',
            message.channel,
            'Music player was unable to queue the request!'
        );
    }
};
