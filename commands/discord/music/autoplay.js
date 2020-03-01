const autoplay      = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

autoplay.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    let input = message.parsed.args[0];
    let bool  = input ? Boolean(input) : !musicManager.autoplay;

    musicManager.autoplay = bool;

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            title : ':musical_note:  - Autoplay Status',
            fields: [
                {
                    name : 'Autoplay Status',
                    value: bool.toString()
                }
            ]
        }
    ));
};
