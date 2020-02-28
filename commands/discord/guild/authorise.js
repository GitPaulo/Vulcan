const authorise     = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

authorise.execute = async (message) => {
    const guild = message.guild;

    if (guild.authorised) {
        return message.client.emit(
            'commandMisused',
            message,
            `This guild is already authorised!`
        );
    }

    // Request authorisation from bot owners
    message.client.emit('authorisationRequest', message.author, guild);

    // Notify
    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: 'Guild authorisation request has been sent to the bot owners.\n'
                        + 'Please await review.\n\n'
                        + 'Approval **may** take a long time!'
        }
    ));
};
