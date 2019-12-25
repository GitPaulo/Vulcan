const purge         = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

purge.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    // Purge music queue
    musicManager.purge();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: 'Purged music player queue.',
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
