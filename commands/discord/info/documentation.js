const documentation = module.exports;
const gitBranch     = xrequire('./utility/modules/gitBranch');

// TODO - Improve this! Make prettier :)
documentation.execute = async (message) => {
    const branch = await gitBranch();

    let documentString = `=> Vulcan Command Documentation\n\t Branch: ${branch}\n\n`;
    let commands       = message.client.commands;

    // Make a simple long string and upload to hastebin
    commands.primaryIdentifiers.forEach((id) => documentString += commands.get(id).toString() + '\n// [end]\n\n');

    await message.channel.send(`\`\`\`\n${documentString}\`\`\``);
};
