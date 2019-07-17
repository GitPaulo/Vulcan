// TODO Allow direct message commands. Should they be specified in the command descriptor?
// *Note: message.command is validated and authorised for execution at this point.

const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

module.exports = async (message) => {
    await message.channel.send(messageEmbeds.error(
        {
            title      : 'Direct Messages [Unsupported]',
            description: `Currently the bot does not support direct messages.`
        }
    ));
};
