const Command       = require('../../structures/classes/Command');
const mathematics   = require('../../modules/utility/mathematics');
const messageEmbeds = require('../../modules/utility/messageEmbeds');

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
            `Imagine pinging vulcan...`,
            `Give me a second lad.`,
            `OI OI m8!!`,
            `Pinging...`,
            `This wont take long...`,
            `Ping request received....`,
        ]
    }

    async validate(message) {
        return true; // if true execute() will run
    }

    async execute(message) {
        let ping = mathematics.round(message.client.ping, 2);
        
        const replyMessage = await message.channel.send(this.phrases[Math.floor(Math.random() * this.phrases.length)]);
        
        let replyEmbed = messageEmbeds.cmdreply(
            `Pong!`, 
            message, 
            [ 
                { name: 'Server Latency', value: `${replyMessage.createdTimestamp - message.createdTimestamp}ms` },
                { name: 'API Latency',    value:  `${ping}ms` }
            ]
        );

        await message.channel.send(replyEmbed);
    }
}

module.exports = Ping;