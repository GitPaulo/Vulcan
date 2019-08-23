const leave         = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

leave.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    musicManager.leaveVoice();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: 'Destroyed music player and left voice channel.',
            fields     : [
                { name: 'Is Playing?', value: musicManager.playing || 'Unknown' },
                { name: 'Queue Size',  value: musicManager.queue.length || 'NaN' }
            ]
        }
    ));
};
