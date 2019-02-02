const { Client, Collection } = require('discord.js');
const Logger                 = require('../managers/Logger');

class Vulcan extends Client {

    constructor(configurations, credentials) {
        super();

        this.configurations = configurations;
        this.credentials = credentials;

        // LOGGER NEEDED - WORKING ON THAT RN LULW
        this.logger = LoggerFactory.getInstance();

        // MANAGER NEEDED (STORAGE I.E.)

        // HANDLERS NEEDED (MESSAGE PARSER)
        // Remove this soon! We should aim to write class-like files claled have "handlers" for each event!
        this.on("ready", () => {
            // This event will run if the bot starts, and logs in, successfully.
            this.logger.log(`Bot has started, with ${this.users.size} users, in ${this.channels.size} channels of ${this.guilds.size} guilds.`);
            // Example of changing the bot's playing game to something useful. `client.user` is what the
            // docs refer to as the "ClientUser".
            this.user.setActivity(`Under development!`);
            
            this.guilds.forEach( function(v, k, m){
                const LUL = v.emojis.find(emoji => emoji.name === "LUL");
                v.systemChannel.send(`Hi there, i'm currently under construction. This is a test. Hopefully this shows up meaning i successfully logged in. Goodbye! Y'all are gay ${LUL}`);
            })
        });

        // LOAD COMMANDS SOMEHOW?? (structure needed)
    }

    connect() {
        this.login(this.credentials.token);
        return this;
    }
}

// sets up class to be accessed by require("./class")
module.exports = Vulcan;