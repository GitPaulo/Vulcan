const servers       = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

servers.execute = async (message) => message.channel.send(messageEmbeds.reply(
    {
        message,
        description: `\`\`\`\n[Count Statistics]\n`
            + `=> Networked: ${message.client.guilds.size}\n`
            + `=> Authorised: ${message.client.servers.size}\n`
            + `\n=========== [Server Listing (ALL)] ===========\n\n`
            + `${Array.from(message.client.servers.entries()).map((entry) => {
                let guild = message.client.guilds.get(entry[0]);

                if (!guild) {
                    guild = {
                        name      : '(Unknown)',
                        id        : entry[0],
                        authorised: '[A - But this guild has been un-networked!]'
                    };
                }

                let date = new Date(entry[1]).toLocaleDateString();

                return `- ${guild.name}(${guild.id})[${guild.authorised && 'A' || 'U'}] joined '${date}'\n`;
            }).join('\n')}\n\`\`\``
    }
));
