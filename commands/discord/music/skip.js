const skip          = module.exports;
const Discord       = xrequire('discord.js');
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

skip.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    let force = Boolean(message.parsed.args[0]);

    if (musicManager.queueEmpty && !musicManager.playing) {
        return message.client.emit(
            'channelInformation',
            message.channel,
            'Cannot skip because queue is empty and there is nothing playing!'
        );
    }

    let lsName = Discord.Util.escapeMarkdown(musicManager.loadedSong.name);

    // Skip current song
    musicManager.skip(force);

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                {
                    name : 'Skipped Song',
                    value: lsName
                },
                {
                    name : 'Was Forced?',
                    value: force.toString()
                }
            ]
        }
    ));
};
