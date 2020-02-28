const enqueue       = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

enqueue.execute = async (message) => {
    const musicManager = message.guild.musicManager;
    const request      = message.parsed.argsString;

    // If already in voice channel, we are performing a move.
    if (!musicManager.connected) {
        return message.client.emit(
            'commandMisused',
            message.channel,
            'Bot mus be in a voice channel.\n'
            + 'Use the `music` command.'
        );
    }

    // Send request
    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: `Processing music request: \`\`\`\n${request}\`\`\``
        }
    ));

    // Queue song
    await musicManager.request(request, message.author, message.channel);
};
