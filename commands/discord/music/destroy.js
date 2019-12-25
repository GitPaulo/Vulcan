const destroy       = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

destroy.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    musicManager.destroy();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: 'Destroyed the music player.',
            fields     : [
                {
                    name : 'Is Playing?',
                    value: musicManager.playing || 'No'
                },
                {
                    name : 'Queue Size',
                    value: musicManager.queue.length || '0'
                }
            ]
        }
    ));
};
