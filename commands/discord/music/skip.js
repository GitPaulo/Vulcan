const skip          = module.exports;
const Discord       = xrequire('discord.js');
const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');

skip.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    let force = Boolean(message.parsed.args[0]);

    if (musicManager.queueEmpty && !musicManager.playing) {
        return message.client.emit(
            'channelInformation',
            message.channel,
            'There is nothing to skip!'
        );
    }

    let lsName = Discord.Util.escapeMarkdown(musicManager.loadedSong.name);

    // Skip current song
    musicManager.skip(force);

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            title      : ':fast_forward:  - Skipped Song',
            description: '',
            fields     : [
                {
                    name : 'Skipped Song',
                    value: lsName
                }
            ]
        }
    ));
};
