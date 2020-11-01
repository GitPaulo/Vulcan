const documentation = module.exports;
const hastebin = xrequire('./modules/hastebin');
const gitBranch = xrequire('./modules/gitBranch');
const messageEmbeds = xrequire('./modules/messageEmbeds');

// TODO - Improve this! Make prettier :)
documentation.execute = async message => {
  let wrap = null;
  const scmd = message.parsed.args[0];
  const { commands } = message.client;

  // CMD specific doc
  if (scmd) {
    let command = commands.get(scmd);

    if (!command) {
      return message.client.emit(
        'commandMisused',
        message,
        `The command **${scmd}** was not found in the list of commands.`
      );
    }

    wrap = messageEmbeds.reply({
      message,
      title: `Command Documentation: '${command.id}'`,
      description: `\`\`\`\n${command.description}\`\`\``,
      fields: [
        {
          name: 'Usage Examples',
          value: `\`\`\`\n${command.examples.join('\n')}\n\`\`\``
        },
        {
          name: `Alias`,
          value: `\`${command.aliases.join(', ')}\``
        }
      ]
    });
  } else {
    // Full docs
    let output = await gitBranch();
    let smallDocumentString = `[Vulcan@${output.branch}]\n=> Total Commands: ${commands.identifiers.length}\n\n`;
    let documentString = `=> Vulcan Command Documentation\n\t Branch: ${output.branch}\n\n`;

    // Make a simple long string and upload to hastebin
    commands.identifiers.forEach(id => {
      smallDocumentString += id + ', ';
      documentString += commands.get(id).toString() + '\n// [end]\n\n';
    });

    wrap = messageEmbeds.reply({
      message,
      title: 'Command Documentation',
      description: `\`\`\`\n${smallDocumentString.trim().slice(0, -1)}\`\`\``,
      fields: [
        {
          name: 'Full Documentation',
          value: await hastebin.post(documentString)
        }
      ]
    });
  }

  await message.channel.send(wrap);
};
