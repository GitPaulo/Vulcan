const autoplay      = module.exports;
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

autoplay.execute = async (message) => {
    const musicController = message.guild.musicController;

    let input = message.parsed.args[0];
    let bool  = input ? Boolean(input) : !musicController.autoplay;

    musicController.setAutoplay(bool);

    await message.channel.send(messageEmbeds.reply(
        {
            replyeeMessage: message,
            fields: [
                {
                    name: 'Autoplay Status',
                    value: bool.toString()
                }
            ]
        }
    ));
};
