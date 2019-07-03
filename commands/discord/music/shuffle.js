const shuffle       = module.exports;
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

shuffle.execute = async (message) => {
    const musicController = message.guild.musicController;

    let input = message.parsed.args[0];
    let bool  = input ? Boolean(input) : !musicController.shuffle;

    musicController.setShuffle(bool);

    await message.channel.send(messageEmbeds.reply(
        {
            replyeeMessage: message,
            fields: [
                {
                    name: 'Shuffle Status',
                    value: bool.toString()
                }
            ]
        }
    ));
};
