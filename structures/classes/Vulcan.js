const { Client, Collection } = require('discord.js');
const { _, performance }     = require('perf_hooks');
const Logger                 = require('../../managers/Logger');
const os                     = require("os");
const fs                     = require('fs');
const path                   = require('path');
const rutil                  = require('../../scripts/randomutils');

const couldnt_have_forged_it_better_myself = `\\ \\    / /   | |                
 \\ \\  / /   _| | ___ __ _ _ __  
  \\ \\/ / | | | |/ __/ _\` | \'_ \\ 
   \\  /| |_| | | (_| (_| | | | |
    \\/  \\__,_|_|\\___\\__,_|_| |_| by Pas-kun & Tacos`

class Vulcan extends Client {

    constructor (configurations, credentials) {
        super();

        let t = Date.now();

        // Seal these properties! :)
        Object.defineProperties(this, {
            configurations: { value: configurations, writable: false, enumerable: false, configurable: false },
            credentials:    { value: credentials,    writable: false, enumerable: false, configurable: false },
            initialisationTime: { value: t, writable: false }
        });

        // Logger from Singleton 
        this.logger = Logger.LoggerFactory.getInstance();

        // DATABASE MANAGER NEEDED <<< TACUUUUUS
        this.storageManager = null;

        // LOAD COMMANDS SOMEHOW?? (CLASS/INTERFACE FOR COMMAND ABSTRACTION NEEDED & Way to store command info - HashMap (id --> Command object)? )
        this.commands = [];

        // Log all node-js process unhandled exceptions
        process.on("unhandledRejection", (e) => this.logger.error(e));

        // Vulcan is here!
        this.logger.print(couldnt_have_forged_it_better_myself);
    }

    loadEvents () {
        // Load Events
        let events_path = __dirname + "/../../events";
        
        fs.readdirSync(events_path).forEach(function (file) {
            vulcan.logger.info("Vulcan is loading event file '" + file + "'.");
            
            let t = performance.now();
            module.exports[path.basename(file, '.js')] = require(path.join(events_path, file)); // Store module with its name (from filename)
            t = performance.now() - t;

            vulcan.logger.info("Finished loading event file '" + file + "' (took " + rutil.round(t,2) + "ms).");
        });
        
        return this;
    }

    getOnlineStatistics () {
        return {
            guildCount:   this.guilds.size,
            channelCount: this.channels.size,
            userCount:    this.users.size,
        };
    }

    getMachineStatistics () {
        return{
            cpuUsage: os.loadavg()[1],
            memUsage: process.memoryUsage().rss / 1024 / 1024,
        }
    }

    connect () {
        this.login(this.credentials.token);
        return this;
    }
}

// sets up class to be accessable by require()
module.exports = Vulcan;