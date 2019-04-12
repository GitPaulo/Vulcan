const Command = require("../../structures/classes/Command");
const RandomUtility   = require("../../modules/objects/RandomUtility");

class Ping extends Command {
    constructor(type) { // type = root folder name (passed on by command loader)
        super(type, {
            name: 'ping',
            aliases: ['pingpong', 'latency'],
            group: 'group2',
            description: 'Pings the bot and wait for a reply displaying the latency in ms.',
            examples: ['ping'],
            throttling: 2000,
            args: []
        });
    }

    async validate(message) {
        return true; // if true execute() will run
    }

    async execute(message) {
        const m  = await message.channel.send("Ping?");
        let ping = RandomUtility.round(message.client.ping, 2);
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${ping}ms`);
    }
}

module.exports = Ping;