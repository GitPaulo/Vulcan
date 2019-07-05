const botchannel    = module.exports;
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

botchannel.execute = async (message) => {
    const botChannel = message.guild.botChannel = message.channel;
    const embedWrap  = messageEmbeds.reply({
        message,
        description: 'Guild bot channel changed.',
        fields: [
            {
                name: 'Bot Channel',
                value: `${botChannel.name}(${botChannel.id})`
            }
        ]
    });

    await message.channel.send(embedWrap);
};
