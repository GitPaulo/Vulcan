const resume        = module.exports;
const Discord       = xrequire('discord.js');
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

resume.execute = async (message) => {
    const musicController = message.guild.musicController;

    if (musicController.playing) {
        return message.client.emit('channelInfo', message.channel, 'Music is already playing. Therefore cannot resume.');
    }

    musicController.resume();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                {
                    name: 'Resumed Song',
                    value: Discord.Util.escapeMarkdown(musicController.loadedSong.name)
                }
            ]
        }
    ));
};
