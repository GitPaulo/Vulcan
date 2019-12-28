const documentation = module.exports;
const hastebin      = xrequire('./utility/modules/hastebin');
const gitBranch     = xrequire('./utility/modules/gitBranch');
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

// TODO - Improve this! Make prettier :)
documentation.execute = async (message) => {
    const output   = await gitBranch();
    const commands = message.client.commands;

    let smallDocumentString = `=> All Command IDs\n=> #Commands: ${commands.identifiers.length}\n\n`;
    let documentString      = `=> Vulcan Command Documentation\n\t Branch: ${output.branch}\n\n`;

    // Make a simple long string and upload to hastebin
    commands.identifiers.forEach((id) => {
        smallDocumentString += id + ', ';
        documentString      += commands.get(id).toString() + '\n// [end]\n\n';
    });

    let url = await hastebin.post(documentString);

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            title      : 'Command Documentation',
            description: `\`\`\`\n${smallDocumentString}\`\`\``,
            fields     : [
                {
                    name : 'Full Documentation',
                    value: url
                }
            ]
        }
    ));
};
