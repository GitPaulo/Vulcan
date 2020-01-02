const servers       = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

servers.execute = async (message) => message.channel.send(messageEmbeds.reply(
    {
        message,
        description: `\`\`\`\n[Servers Statistics]\n`
            + `=> Networked: ${message.client.guilds.size}\n`
            + `=> Authorised: ${message.client.servers.size}\n`
            + `\n=== List of Authorised Servers ===\n`
            + `${Array.from(message.client.servers.entries()).map((entry) => {
                let guild = message.client.guilds.get(entry[0]);
                let date  = new Date(entry[1]).toLocaleDateString();

                return `- ${guild.name} => '${date}'`;
            }).join('\n')}\n\`\`\``
    }
));
