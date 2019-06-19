const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

module.exports = async (message) => {
    await message.channel.send(messageEmbeds.error(
        {
            title: 'Direct Messages [Unsupported]',
            description: `Currently the bot does not support direct messages.`
        }
    ));
};
