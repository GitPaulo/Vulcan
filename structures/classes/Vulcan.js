// Node Modules
const { Client, Collection } = require('discord.js');
const { _, performance }     = require('perf_hooks');
const os                     = require('os');
const fs                     = require('fs');
const path                   = require('path');

// Vulcan Modules
const RandomUtility  = require('../../modules/objects/RandomUtility');
const Logger         = require('../../managers/LogManager');
const StorageManager = require('../../managers/StorageManager');
const CommandLoader  = require('./CommandLoader');

const couldnt_have_forged_it_better_myself = `\\ \\    / /   | |                
 \\ \\  / /   _| | ___ __ _ _ __  
  \\ \\/ / | | | |/ __/ _\` | \'_ \\ 
   \\  /| |_| | | (_| (_| | | | |
    \\/  \\__,_|_|\\___\\__,_|_| |_| by Pas-kun & Tacos-sama`

let rootPath = path.dirname(require.main.filename);

class Vulcan extends Client {

    constructor (configuration, privatedata) {
        super();

        let t = performance.now();

        // Seal these properties! :)
        Object.defineProperties(this, {
            configuration: { value: configuration,  writable: false, enumerable: false, configurable: false },
            privatedata:   { value: privatedata,    writable: false, enumerable: false, configurable: false },
        });

        // Logger from Singleton 
        this.logger = Logger.getInstance();

        // Storage manager needs some work boys
        this.storageManager = new StorageManager(this);

        // Class that handles loading all commands recursively from commands/ dir
        this.commands = new CommandLoader(this).loadCommands();

        // Log all node-js process unhandled exceptions
        process.on('unhandledRejection', (err) => {
            this.logger.error(err.shortMessage());
            throw err; // for now throw everything!
        });

        // Vulcan is here!
        this.logger.printc('FgRed', couldnt_have_forged_it_better_myself);
        this.logger.info('========== VULCAN has initialised ==========');
        
        this.initialisationTime = performance.now() - t;
    }

    loadEvents () {
        // Load Events
        let eventsPath = path.join(rootPath, 'events');
        let vulcan     = this; // this scope hack-thingymacjig

        fs.readdirSync(eventsPath).forEach(function (file) {
            vulcan.logger.info(`Vulcan is loading event file '${file}'.`);
            
            let t = performance.now();
            module.exports[path.basename(file, '.js')] = require(path.join(eventsPath, file)); // Store module with its name (from filename)
            t = performance.now() - t;

            vulcan.logger.info(`Finished loading event file '${file}' (took '${RandomUtility.round(t,2)}ms').`);
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
        return {
            cpuUsage: os.loadavg()[1],
            memUsage: process.memoryUsage().rss / 1024 / 1024,
        }
    }

    uptime () {
    	return String(process.uptime()).toHHMMSS();
    }

    connect () {
        this.logger.info('Attempting to connect to discord servers...');

        if (this.privatedata.token === global.Defaults.files.privatedata.data.token) {
            this.logger.warn(`>>> Default token detected, please change @'${Defaults.files.privatedata.location}'`);
        }

        if (this.configuration.devsID.sort().join(',') !== global.Defaults.files.configuration.data.devsID.sort().join(',')) {
            this.logger.warn(`>>> Developer IDs have been changed from the default! We are slightly unhappy :C`);
        }

        this.login(this.privatedata.token).then((token) => {
            this.logger.info(`Sucessfully logged in to discord servers with token: ${token}`)
        }).catch((err) => {
            throw err;
        });

        return this;
    }
}

// sets up class to be accessable by require()
module.exports = Vulcan;
