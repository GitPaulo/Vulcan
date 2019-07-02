const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');
const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

class Ping extends DiscordCommand {
    constructor (commandDefinition) {
        super(commandDefinition);
        this.phrases = [
            `Imagine pinging vulcan...`,
            `Give me a second lad.`,
            `OI OI m8!!`,
            `Pinging...`,
            `This wont take long...`,
            `Ping request received....`
        ];
    }

    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        let preMessage = await message.channel.send(this.phrases[Math.floor(Math.random() * this.phrases.length)]);
        let reply      = messageEmbeds.reply({
            replyeeMessage: message,
            title: 'Pong!',
            fields: [
                {
                    name: 'API Latency',
                    value: `${preMessage.createdTimestamp - message.createdTimestamp}ms`
                }
            ]
        });

        await message.channel.send(reply);
    }
}

module.exports = Ping;
