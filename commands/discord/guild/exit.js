const botchannel    = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

botchannel.execute = async (message) => {
    const guild     = message.guild;
    const unauth    = Boolean(message.parsed.args[0]);
    const embedWrap = messageEmbeds.reply({
        message,
        description: 'Vulcan is **leaving** this guild!\n\nGood bye! :(',
        fields     : [
            {
                name : 'Unauthorise on Leave?',
                value: String(unauth)
            },
            {
                name : 'Re-Invite',
                value: `http://discordapp.com/oauth2/authorize?client_id=604662534410207233&scope=bot&permissions=1341644225`
            }
        ]
    });

    await message.channel.send(embedWrap);

    if (unauth) {
        await message.client.unauthoriseGuild(guild.id);
    }

    await guild.leave();
};
