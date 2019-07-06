const pause         = module.exports;
const Discord       = xrequire('discord.js');
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

pause.execute = async (message) => {
    const musicController = message.guild.musicController;

    if (!musicController.playing) {
        return message.client.emit('channelInfo', message.channel, 'No music is playing. Therefore cannot pause.');
    }

    musicController.pause();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                {
                    name: 'Paused Song',
                    value: Discord.Util.escapeMarkdown(musicController.loadedSong.name)
                }
            ]
        }
    ));
};
