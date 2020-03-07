const pause         = module.exports;
const Discord       = xrequire('discord.js');
const messageEmbeds = xrequire('./modules/messageEmbeds');

pause.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    if (!musicManager.connected) {
        return message.client.emit(
            'commandMisused',
            message.channel,
            'Bot mus be in a voice channel.\n'
            + 'Use the `music` command.'
        );
    }

    if (!musicManager.playing) {
        return message.client.emit(
            'commandMisused',
            message,
            `No music playing. Cannot pause!`
        );
    }

    musicManager.pause();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            title : ':pause_button:  - Pause',
            fields: [
                {
                    name : 'Paused Song',
                    value: Discord.Util.escapeMarkdown(musicManager.currentTask.song.name)
                }
            ]
        }
    ));
};
