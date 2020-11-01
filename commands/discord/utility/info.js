const info = module.exports;
const gitBranch = xrequire('./modules/gitBranch');
const messageEmbeds = xrequire('./modules/messageEmbeds');
const settings = xrequire('./prerequisites/settings');

info.execute = async message => {
  const performance = message.client.performance;
  const statistics = message.client.statistics;
  const address = await message.client.resolveIp();
  const { branch, status } = await gitBranch();
  const { configuration } = settings;

  // Turn into actual names, if valid
  let atOwners = configuration.hosts.map(ownerID => {
    let owner = message.client.users.cache.get(ownerID);

    if (owner) {
      return `<@${owner.id}>`;
    }

    return ownerID;
  });

  // Turn into actual names, if valid
  let atHosts = message.client.guilds.cache.map(guild => guild.owner);

  // Output information
  await message.channel.send(
    messageEmbeds.reply({
      message,
      description: `Hello there, I'm Vulcan and here lies my information.\n\t\`ipv4: ${address.v4}\`\n\t\t\`ipv6: ${address.v6}\``,
      fields: [
        {
          name: 'Github Repo',
          value: message.client.constants.client.github
        },
        {
          name: 'Version & Branch',
          value: `Branch: '${branch}'\n${status}`
        },
        {
          name: 'Bot Owners',
          value: atOwners.toString() || '(No Owners)'
        },
        {
          name: 'Bot Hosts',
          value: atHosts.toString() || '(No Hosts)'
        },
        {
          name: 'CPU Usage',
          value: `${performance.cpuUsage}`,
          inline: true
        },
        {
          name: 'Memory Usage',
          value: `${performance.memUsage}`,
          inline: true
        },
        {
          name: 'User Count',
          value: `${statistics.userCount}`,
          inline: true
        },
        {
          name: 'Guild Count',
          value: `${statistics.guildCount}`,
          inline: true
        },
        {
          name: 'Perfixes',
          value: `${configuration.prefixes.join(', ')}`,
          inline: true
        },
        {
          name: 'Auth-Server Count',
          value: `${message.client.authorised.size}`,
          inline: true
        },
        {
          name: 'Blacklist Size',
          value: `${message.client.blacklist.size}`,
          inline: true
        }
      ]
    })
  );
};
