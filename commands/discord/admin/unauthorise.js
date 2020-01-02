const unauthorise   = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

unauthorise.execute = async (message) => {
    const guild = message.guild;

    if (!guild.authorised) {
        return message.client.emit(
            'invalidCommandUsage',
            message,
            `This guild is not authorised!`
        );
    }

    await message.client.unauthoriseGuild(guild.id);
    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: `Guild authorisation has been revoked by: ${message.author.tag}.\n`
        }
    ));
};
