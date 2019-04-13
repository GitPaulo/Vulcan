const Command       = require('../../structures/classes/Command');
const RandomUtility = require('../../modules/objects/RandomUtility');
const MessageEmbeds = require('../../modules/objects/MessageEmbeds');

class Ping extends Command {
    constructor(type) { // type = root folder name (passed on by command loader)
        super(type, {
                name: 'ping',
                aliases: ['pingpong', 'latency'],
                group: 'group2',
                description: 'Pings the bot and wait for a reply displaying the latency in ms.',
                examples: ['ping'],
                throttling: 2000,
                args: [],
                embed:  {
                    color:  0xFF0000,
                    title:  `Ping...`,
                    image:  './assets/media/images/commands/Ping.gif',
                }
            }
        );

        this.phrases = [
            "Imagine pinging vulcan...",
            "Give me a second lad.",
            "OI OI m8!!",
            "Pinging...",
            "This won't take long...",
            "Ping request received....",
        ]
    }

    async validate(message) {
        return true; // if true execute() will run
    }

    async execute(message) {
        let ping = RandomUtility.round(message.client.ping, 2);
        
        const replyMessage = await message.channel.send(this.phrases[Math.floor(Math.random() * this.phrases.length)]);
        
        let reply = MessageEmbeds.cmdreply(
            `Pong!`, 
            message, 
            [ 
                { name: "Server Latency", value: `${replyMessage.createdTimestamp - message.createdTimestamp}ms` },
                { name: "API Latency",    value:  `${ping}ms` }
            ]
        );

        await message.channel.send(reply);
    }
}

module.exports = Ping;