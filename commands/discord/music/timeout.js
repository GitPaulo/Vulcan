const timeout       = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

timeout.execute = async (message) => {
    const musicManager = message.guild.musicManager;
    const input        = message.parsed.args[0];

    if (isNaN(input)) {
        return;
    }

    musicManager.timeout = parseInt(input, 10);

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                {
                    name : 'Inactivity Timeout',
                    value: input
                }
            ]
        }
    ));
};
