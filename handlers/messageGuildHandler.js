// *Note: message.command is validated and authorised for execution at this point.
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

module.exports = async (message) => {
    await message.command.execute(message);
};
