const usergroups = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

usergroups.execute = async message => {
  const vulcan = this.command.client;
  const scmd = message.parsed.args[0];

  if (!scmd) {
    return vulcan.emit('commandMisused', message, `Usergroups command requires subcommand usage!`);
  }

  // Avoid writing it twice :)
  let maybeFirst = message.mentions.users.first();
  let targetID = (maybeFirst && maybeFirst.id) || message.parsed.args[1];
  let output = '';

  switch (scmd) {
    case 'set':
    case 'write': {
      let newGroupName = message.parsed.args[2] || vulcan.defaultGroupName;

      if (!vulcan.hierarchy.groups.get(newGroupName)) {
        return vulcan.emit('commandMisused', message, `Invalid usergroup! Input: \`${newGroupName}\``);
      }

      output = (await this.set(targetID, newGroupName))
        ? `Usergroup '${newGroupName}' set for id: ${targetID}.`
        : `Could not set usergroup for \`${targetID}\``;
      break;
    }
    case 'get':
    case 'read': {
      let checkedGroup = await this.get(targetID);

      output = checkedGroup
        ? `Usergroup of \`${targetID}\` is \`${checkedGroup}\``
        : `Could not find a usergroup linked to id \`${targetID}\``;
      break;
    }
    case 'hierarchy':
    case 'list':
    case 'usergroups': {
      output = `\`\`\`js\n${this.list().join('\n')}\`\`\`` + `\`\`\`js\n${JSON.stringify(this.hierarchy())}\`\`\``;
      break;
    }
    default:
      return vulcan.emit('commandMisused', message, `Invalid subcommand as first argument!\n\tInput: \`${scmd}\``);
  }

  await message.channel.send(
    messageEmbeds.reply({
      message,
      fields: [
        {
          name: 'Output',
          value: output
        }
      ]
    })
  );
};

usergroups.get = async targetID => this.command.client.fetchUsergroup(targetID).name;
usergroups.set = async (targetID, newGroupName) => {
  const cachedUser = this.command.client.updateUsergroup(targetID, newGroupName);

  if (cachedUser && !cachedUser.bot) {
    (await cachedUser.createDM()).send(`Your usergroup has changed to: **${newGroupName}**!`);

    return true;
  }

  return false;
};

usergroups.list = () =>
  Array.from(this.command.client.hierarchy.rank.entries()).map(entry => {
    let user = this.command.client.users.cache.get(entry[0]);

    if (!user) {
      return `- (NN)[${entry[0]}] => ${entry[1]}`;
    }

    return `- ${user.username}#${user.discriminator} => ${entry[1]}`;
  });

usergroups.hierarchy = () => Array.from(this.command.client.hierarchy.groups.entries());
