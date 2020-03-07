
const invite = module.exports;

invite.execute = async (message) => {
    await message.channel.send(message.client.constants.client.invite);
};
