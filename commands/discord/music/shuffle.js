const shuffle       = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

shuffle.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    let input = message.parsed.args[0];
    let bool  = input ? Boolean(input) : !musicManager.shuffle;

    musicManager.shuffle = bool;

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                {
                    name : 'Shuffle Status',
                    value: bool.toString()
                }
            ]
        }
    ));
};
