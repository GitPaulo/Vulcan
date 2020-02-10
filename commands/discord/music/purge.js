const purge         = module.exports;
const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');

purge.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    // Purge music player
    musicManager.purge();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: 'Purged music player state.\nState was reset to **defaults** and any playing music was skipped.'
        }
    ));
};
