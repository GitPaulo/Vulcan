const resume        = module.exports;
const Discord       = xrequire('discord.js');
const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');

resume.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    if (musicManager.playing) {
        return message.client.emit('channelInformation', message.channel, 'Music is already playing. Therefore cannot resume.');
    }

    musicManager.resume();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            title      : ':play_pause:  - Shuffled Queue',
            description: '',
            fields     : [
                {
                    name : 'Resumed Song',
                    value: Discord.Util.escapeMarkdown(musicManager.loadedSong.name)
                }
            ]
        }
    ));
};
