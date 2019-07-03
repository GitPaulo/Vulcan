const destroy       = module.exports;
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

destroy.execute = async (message) => {
    const musicController = message.guild.musicController;

    musicController.destroy();

    await message.channel.send(messageEmbeds.reply(
        {
            replyeeMessage: message,
            description: 'Destroyed the music player.',
            fields: [
                { name: 'Is Playing?', value: musicController.playing || 'No' },
                { name: 'Queue Size',  value: musicController.queue.length || '0' }
            ]
        }
    ));
};
