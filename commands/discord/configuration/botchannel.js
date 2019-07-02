const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');
const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

class BotChannel extends DiscordCommand {
    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        const bc = message.guild.botChannel = message.channel;

        await message.channel.send(messageEmbeds.reply({
            replyeeMessage: message,
            description: 'Guild bot channel changed.',
            fields: [
                {
                    name: 'Bot Channel',
                    value: `${bc.name}(${bc.id})`
                }
            ]
        }));
    }
}

module.exports = BotChannel;
