const destroy       = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

destroy.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    musicManager.destroy();

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: `Destroyed the music player and voice connection.\n\`This should only be used when the player has errored.\``
        }
    ));
};
