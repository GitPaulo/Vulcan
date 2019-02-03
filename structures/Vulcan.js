const { Client, Collection } = require('discord.js');
const Logger                 = require('../managers/Logger');

class Vulcan extends Client {

    constructor(configurations, credentials) {
        super();

        this.configurations = configurations;
        this.credentials = credentials;

        // LOGGER NEEDED - WORKING ON THAT RN LULW
        this.logger = Logger.LoggerFactory.getInstance();

        // MANAGER NEEDED (STORAGE I.E.)
        

        // LOAD COMMANDS SOMEHOW?? (structure needed)

        this.inititialsationTime = Date.now();
    }

    connect() {
        this.login(this.credentials.token);
        return this;
    }
}

// sets up class to be accessed by require()
module.exports = Vulcan;