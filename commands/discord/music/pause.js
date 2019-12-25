const pause         = module.exports;
const Discord       = xrequire('discord.js');
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

pause.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    if (!musicManager.playing) {
        return message.client.emit('channelInformation', message.channel, 'No music is playing. Therefore cannot pause.');
    }

    musicManager.pause();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                {
                    name : 'Paused Song',
                    value: Discord.Util.escapeMarkdown(musicManager.loadedSong.name)
                }
            ]
        }
    ));
};
