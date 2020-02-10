const unauthorise   = module.exports;
const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');

unauthorise.execute = async (message) => {
    const { guild } = message;

    if (!guild.authorised) {
        return message.client.emit(
            'invalidCommandUsage',
            message,
            `This guild is not authorised!`
        );
    }

    // Send unauthorise request
    await message.client.unauthoriseGuild(guild.id);

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: `Guild authorisation has been revoked by: ${message.author.tag}.\n`
        }
    ));
};
