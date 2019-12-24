const documentation = module.exports;
const gitBranch     = xrequire('./utility/modules/gitBranch');
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

// TODO - Improve this! Make prettier :)
documentation.execute = async (message) => {
    const output = await gitBranch();

    let documentString = `=> Vulcan Command Documentation\n\t Branch: ${output.branch}\n\n`;
    let commands       = message.client.commands;

    // Make a simple long string and upload to hastebin
    commands.primaryIdentifiers.forEach((id) => documentString += commands.get(id).toString() + '\n// [end]\n\n');

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            title      : 'Command Documentation',
            description: `\`\`\`\n${documentString}\`\`\``
        }
    ));
};
