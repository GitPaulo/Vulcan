const servers = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

servers.execute = async message =>
  message.channel.send(
    messageEmbeds.reply({
      message,
      description:
        `\`\`\`\n[Count Statistics]\n` +
        `=> Networked: ${message.client.guilds.cache.size}\n` +
        `=> Authorised: ${message.client.authorised.size}\n` +
        `\n========== [Networked ∩ Authorised] ==========\n\n` +
        `${Array.from(message.client.authorised.entries())
          .concat(
            message.client.guilds.cache
              .map(g => [g.id, g.joinedTimestamp])
              .filter(entry => !message.client.authorised.get(entry[0]))
          )
          .map(entry => {
            let guild = message.client.guilds.cache.get(entry[0]);

            if (!guild) {
              guild = {
                name: '(Unknown)',
                id: entry[0],
                authorised: true
              };
            }

            return `- ${guild.name}(${guild.id})[${(guild.authorised && 'A') || 'U'}] joined '${new Date(
              entry[1]
            ).toLocaleDateString()}'\n`;
          })
          .join('\n')}\n\`\`\``
    })
  );
