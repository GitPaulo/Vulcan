const botchannel    = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

botchannel.execute = async (message) => {
    const guild         = message.guild;
    const preventUnauth = Boolean(message.parsed.args[0]);
    const embedWrap     = messageEmbeds.reply({
        message,
        description: 'Leaving this guild!\nGood bye! :(',
        fields     : [
            { name: 'Unauthorised?', value: String(!preventUnauth) }
        ]
    });

    await message.channel.send(embedWrap);

    if (!preventUnauth) {
        await message.client.unauthoriseGuild(guild.id);
    }

    await guild.leave();
};
