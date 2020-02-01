const prune       = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

prune.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    musicManager.prune();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            title      : ':notes:  - Queue Pruned',
            description: 'Cleaned all of the music queue.'
        }
    ));
};
