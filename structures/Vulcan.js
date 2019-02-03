const { Client, Collection } = require('discord.js');
const { _, performance }     = require('perf_hooks');
const Logger                 = require('../managers/Logger');
const fs                     = require('fs');
const path                   = require('path');
const rutil                  = require('../scripts/randomutils');

class Vulcan extends Client {

    constructor(configurations, credentials) {
        super();

        this.configurations = configurations;
        this.credentials    = credentials;

        // LOGGER NEEDED - WORKING ON THAT RN LULW
        this.logger = Logger.LoggerFactory.getInstance();

        // MANAGER NEEDED (STORAGE I.E.)
        

        // LOAD COMMANDS SOMEHOW?? (structure needed)

        this.initialisationTime = Date.now();
    }

    loadEvents(){
        // Load Events
        let events_path = __dirname + "/../events";
        
        fs.readdirSync(events_path).forEach(function (file) {
            vulcan.logger.info("Vulcan is loading event file '" + file + "'.");
            
            let t = performance.now();
            module.exports[path.basename(file, '.js')] = require(path.join(events_path, file)); // Store module with its name (from filename)
            t = performance.now() - t;

            vulcan.logger.info("Finished loading event file '" + file + "' (took " + rutil.round(t,2) + "ms).");
        });
        
        return this;
    }

    connect() {
        this.login(this.credentials.token);
        return this;
    }
}

// sets up class to be accessed by require()
module.exports = Vulcan;