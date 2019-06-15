const Command       = xrequire('./structures/classes/Command');
const messageEmbeds = xrequire('./modules/utility/messageEmbeds');

class Ping extends Command {
    constructor (type) { // type = root folder name (passed on by command loader)
        super(type, {
                name: 'ping',
                aliases: ['pingpong', 'latency'],
                group: 'GROUP_SYSTEM_SOON_TM',
                description: 'Pings the bot and wait for a reply displaying the latency in ms.',
                examples: ['ping'],
                throttling: 5000,
                args: [],
                embed: {
                    color: 0xFF0000,
                    title: `Ping...`,
                    image: './assets/media/images/commands/Ping.gif'
                }
            }
        );

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
                { name: 'API Latency',    value: `${preMessage.createdTimestamp - message.createdTimestamp}ms` }
            ]
        });

        await message.channel.send(reply);
    }
}

module.exports = Ping;
