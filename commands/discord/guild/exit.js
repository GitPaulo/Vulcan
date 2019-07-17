const botchannel    = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

botchannel.execute = async (message) => {
    const guild     = message.guild;
    const embedWrap = messageEmbeds.reply({
        message,
        description: 'Attempting to leave this guild!\nGood bye! :('
    });

    await message.channel.send(embedWrap);
    await message.client.unauthoriseGuild(guild.id);
    await guild.leave();
};
