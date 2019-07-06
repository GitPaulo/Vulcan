const skip          = module.exports;
const Discord       = xrequire('discord.js');
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

skip.execute = async (message) => {
    const musicController = message.guild.musicController;

    let force = Boolean(message.parsed.args[0]);

    if (musicController.queueEmpty && !musicController.playing) {
        return message.client.emit('channelInfo', message.channel, 'Cannot skip because queue is empty and there is nothing playing!');
    }

    let lsName = Discord.Util.escapeMarkdown(musicController.loadedSong.name);
    musicController.skip(force);

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                {
                    name: 'Skipped Song',
                    value: lsName
                },
                {
                    name: 'Was Forced?',
                    value: force.toString()
                }
            ]
        }
    ));
};
