const documentation = module.exports;
const hastebin      = xrequire('./utility/modules/hastebin.js');
const messageEmbeds = xrequire('./utility/modules/messageEmbeds.js');

// TODO - Improve this! Make prettier :)
documentation.execute = async (message) => {
    let documentString = '==================[ Vulcan Command Documentation ]==================\n\n';
    let commands       = message.client.commands;

    // Make a simple long string and upload to hastebin
    commands.primaryIdentifiers.forEach((id) => documentString += commands.get(id).toString());

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: await hastebin.post(documentString)
        }
    ));
};
