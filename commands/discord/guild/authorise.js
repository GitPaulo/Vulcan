const authorise     = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

authorise.execute = async (message) => {
    const guild = message.guild;

    if (guild.authorised) {
        return message.client.emit(
            'invalidCommandUsage',
            message,
            `This guild is already authorised!`
        );
    }

    await guild.requestAuthorisation(message.author);
    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: 'Guild authorisation request has been sent to the bot owners.\n'
                        + 'Please await their response!\n'
                        + 'This can **take time!**'
        }
    ));
};
