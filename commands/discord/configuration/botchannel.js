const botchannel     = module.exports;
const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');

botchannel.execute = async (message) => {
    const bc = message.guild.botChannel = message.channel;

    await message.channel.send(messageEmbeds.reply({
        replyeeMessage: message,
        description: 'Guild bot channel changed.',
        fields: [
            {
                name: 'Bot Channel',
                value: `${bc.name}(${bc.id})`
            }
        ]
    }));
};
