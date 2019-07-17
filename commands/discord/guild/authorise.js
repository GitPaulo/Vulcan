const authorise  = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

authorise.execute = async (message) => {
    const guild     = message.guild;
    const embedWrap = messageEmbeds.reply({
        message,
        description: 'Guild authorisation request has been sent to the bot owners.\n'
                      + 'Please await their response!\n'
                      + 'This can **take time!**'
    });

    await guild.requestAuthorisation(message.author);
    await message.channel.send(embedWrap);
};
