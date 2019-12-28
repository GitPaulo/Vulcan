const servers       = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

servers.execute = async (message) => message.channel.send(messageEmbeds.reply(
    {
        message,
        description: `\`\`\`js\n === List of Authorised Servers ===\n\n${Array.from(this.command.client.servers.entries())
            .map((entry) => {
                let guild = this.command.client.guilds.get(entry[0]);
                let date  = new Date(entry[1]).toLocaleDateString();

                return `- ${guild.name} => '${date}'`;
            }).join('\n')}\n\`\`\``
    }
));
