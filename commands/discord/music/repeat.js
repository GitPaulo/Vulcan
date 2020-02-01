const repeat        = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

repeat.execute = async (message) => {
    const musicManager = message.guild.musicManager;

    let input = message.parsed.args[0];
    let bool  = input ? Boolean(input) : !musicManager.repeat;

    musicManager.repeat = bool;

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            title      : ':notes:  - Song Repeat',
            description: '',
            fields     : [
                {
                    name : 'Repeat Status',
                    value: bool.toString()
                }
            ]
        }
    ));
};
