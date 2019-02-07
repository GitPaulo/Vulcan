const { Client, Collection } = require('discord.js');
const { _, performance }     = require('perf_hooks');
const Logger                 = require('../../managers/Logger');
const CommandLoader          = require("./CommandLoader");
const os                     = require("os");
const fs                     = require('fs');
const path                   = require('path');
const rutil                  = require('../../scripts/randomutils');

const couldnt_have_forged_it_better_myself = `\\ \\    / /   | |                
 \\ \\  / /   _| | ___ __ _ _ __  
  \\ \\/ / | | | |/ __/ _\` | \'_ \\ 
   \\  /| |_| | | (_| (_| | | | |
    \\/  \\__,_|_|\\___\\__,_|_| |_| by Pas-kun & Tacos`

let rootPath = path.dirname(require.main.filename);

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

        // Class that handles loading all commands recursively from commands/ dir
        this.commands = new CommandLoader(this).loadCommands();

        // Log all node-js process unhandled exceptions
        //process.on("unhandledRejection", (e) => this.logger.error(e));

        // Vulcan is here!
        this.logger.print(couldnt_have_forged_it_better_myself);
        this.logger.info("========== VULCAN has initialised ==========")
    }

    loadEvents () {
        // Load Events
        let eventsPath = path.join(rootPath, "events");
        
        let vulcan = this;
        fs.readdirSync(eventsPath).forEach(function (file) {
            vulcan.logger.info("Vulcan is loading event file '" + file + "'.");
            
            let t = performance.now();
            module.exports[path.basename(file, '.js')] = require(path.join(eventsPath, file)); // Store module with its name (from filename)
            t = performance.now() - t;

            vulcan.logger.info("Finished loading event file '" + file + "' (took " + rutil.round(t,2) + "ms).");
        });
        
        return vulcan;
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
        this.logger.info("Attempting to connect to discord servers...");

        if (this.credentials.token === global.DEFAULT) {
            this.logger.warn(">>>>>>>> TOKEN IS MISSING FROM noleakdata.yaml FILE <<<<<<<<<");
        }else{
            this.login(this.credentials.token).then((token) => {
                this.logger.info(`Sucessfully logged in to discord servers with token: ${token}`)
            }).catch((err) => {
                throw err;
            });
        }

        return this;
    }
}

// sets up class to be accessable by require()
module.exports = Vulcan;