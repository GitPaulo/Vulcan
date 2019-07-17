const botchannel    = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

botchannel.execute = async (message) => {
    message.guild.botChannelName = message.channel.name;
    const embedWrap  = messageEmbeds.reply({
        message,
        description: `Set guild bot channel to this channel (${message.channel.name}(${message.channel.id})).`
    });

    await message.channel.send(embedWrap);
};
