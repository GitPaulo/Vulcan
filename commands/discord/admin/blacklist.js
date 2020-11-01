const blacklist = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

blacklist.execute = async message => {
  const vulcan = this.command.client;
  const scmd = message.parsed.args[0];

  if (!scmd) {
    return vulcan.emit('commandMisused', message, `Blacklist command requires subcommand usage!`);
  }

  // Avoid writing it twice :)
  const maybeFirst = message.mentions.users.cache.first();
  const targetID = (maybeFirst && maybeFirst.id) || message.parsed.args[1];

  let output = '';

  switch (scmd) {
    case 'add':
    case 'insert': {
      output = await this.add(targetID);
      break;
    }
    case 'delete':
    case 'remove': {
      output = await this.remove(targetID);
      break;
    }
    case 'list':
    case 'blacklist': {
      output = await this.list();
      break;
    }
    default: {
      return vulcan.emit('commandMisused', message, `Invalid subcommand as first argument!\n\tInput: \`${scmd}`);
    }
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

blacklist.add = async targetID => {
  // Blacklist :(
  const cachedUser = this.command.client.blacklistUser(targetID);

  if (cachedUser && !cachedUser.bot) {
    (await cachedUser.createDM()).send(`You have been added to the **blacklist**!`);
  }

  return `Successfully added **(${targetID})** to the blacklist!`;
};

blacklist.remove = async targetID => {
  // Unblacklist :)
  const cachedUser = this.command.client.blacklistUser(targetID);

  if (cachedUser) {
    (await cachedUser.createDM()).send(`You have been removed from the **blacklist**!`);
  }

  return `Successfully added **(${targetID})** to the blacklist!`;
};

blacklist.list = async () => `\`\`\`js\n${JSON.stringify(Array.from(this.command.client.blacklist.entries()))}\n\`\`\``;
