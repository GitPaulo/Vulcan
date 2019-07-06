const purge         = module.exports;
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

purge.execute = async (message) => {
    const musicController = message.guild.musicController;

    musicController.purge();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: 'Purged music player queue.',
            fields: [
                { name: 'Is Playing?', value: musicController.playing || 'No' },
                { name: 'Queue Size',  value: musicController.queue.length || '0' }
            ]
        }
    ));
};
