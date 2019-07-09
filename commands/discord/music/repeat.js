const repeat        = module.exports;
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

repeat.execute = async (message) => {
    const musicController = message.guild.musicController;

    let input = message.parsed.args[0];
    let bool  = input ? Boolean(input) : !musicController.repeat;

    musicController.repeat = bool;

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                {
                    name : 'Repeat Status',
                    value: bool.toString()
                }
            ]
        }
    ));
};
