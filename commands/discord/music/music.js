const music         = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

music.execute = async (message) => {
    const musicManager = message.guild.musicManager;
    const targetVC     = message.member.voice.channel;

    // Join voice if it does not match with requesters
    if (musicManager.voiceChannel === targetVC) {
        return message.client.emit(
            'commandMisused',
            message.channel,
            'Vulcan is already in your voice channel!\n'
            + 'Are you looking for the command: `play`?'
        );
    }

    // Constants
    const request    = message.parsed.argsString;
    const hasRequest = request && request.length > 0;
    const wrap       = messageEmbeds.reply(
        {
            message,
            description: `Ready to jam on \`${targetVC.name}\` :musical_note:`
        }
    );

    // If already in voice channel, we are performing a move.
    if (musicManager.connected) {
        wrap.embed.description = `(Moved) ${wrap.embed.description}`;
    }

    // If request, we are performing an attached request
    if (hasRequest) {
        wrap.embed.fields = [
            {
                name : 'Request',
                value: `\`\`\`${request}\`\`\``
            }
        ];
    }

    // Join target voice channel
    await musicManager.join(targetVC);

    // Send message
    await message.channel.send(wrap);

    // Play immediatly if request
    if (hasRequest) {
        await musicManager.request(request, message.author, message.channel);
    }
};
