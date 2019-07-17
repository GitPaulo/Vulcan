const servers       = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

servers.execute = async (message) => message.channel.send(messageEmbeds.reply(
    {
        message,
        description: `\`\`\`js\n === List of Authorised Servers ===\n\n${JSON.stringify(Array.from(this.vulcan.servers.entries()))}\n\`\`\``
    }
));
