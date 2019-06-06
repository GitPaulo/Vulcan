const { Client, Collection } = require('discord.js');
const { _, performance }     = require('perf_hooks');
const os                     = require('os');
const fs                     = require('fs');
const path                   = require('path');
const mathematics            = require('../../modules/utility/mathematics');
const logger                 = require('../../managers/logManager').getInstance();
const StorageManager         = require('../../managers/storageManager');
const CommandLoader          = require('./CommandLoader');
const rootPath               = path.dirname(require.main.filename);

/******************************************************************/
const couldnt_have_forged_it_better_myself = `\\ \\    / /   | |                
 \\ \\  / /   _| | ___ __ _ _ __  
  \\ \\/ / | | | |/ __/ _\` | \'_ \\ 
   \\  /| |_| | | (_| (_| | | | |
    \\/  \\__,_|_|\\___\\__,_|_| |_| by Pas-kun & Tacos-sama`
/*******************************************************************/

class Vulcan extends Client {

    constructor (configuration, privatedata) {
        super();

        let t = performance.now();

        // Seal these properties! :)
        Object.defineProperties(this, {
            configuration: { value: configuration,  writable: false, enumerable: false, configurable: false },
            privatedata:   { value: privatedata,    writable: false, enumerable: false, configurable: false },
        });

        // Storage manager needs some work boys
        this.storageManager = new StorageManager();

        // Class that handles loading all commands recursively from commands/ dir
        this.commands = new CommandLoader().loadCommands();

        // Log all node-js process unhandled exceptions
        process.on('unhandledRejection', (err) => {
            logger.error(err.shortMessage());
            throw err; // for now throw everything!
        });

        // Vulcan is here!
        logger.printc('FgRed', couldnt_have_forged_it_better_myself);
        logger.info('========== VULCAN has initialised ==========');
        
        this.initialisationTime = performance.now() - t;
    }

    loadEvents () {
        // Load Events
        let eventsPath = path.join(rootPath, 'events');

        fs.readdirSync(eventsPath).forEach(function (file) {
            logger.info(`Vulcan is loading event file '${file}'.`);
            
            let t = performance.now();
            module.exports[path.basename(file, '.js')] = require(path.join(eventsPath, file)); // Store module with its name (from filename)
            t = performance.now() - t;

            logger.info(`Finished loading event file '${file}' (took '${mathematics.round(t,2)}ms').`);
        });
        
        return this;
    }

    connect () {
        logger.info('Attempting to connect to discord servers...');

        if (this.privatedata.token === global.Defaults.files.privatedata.data.token) {
            logger.warn(`>>> Default token detected, please change @'${Defaults.files.privatedata.location}'`);
        }

        if (this.configuration.devsID.sort().join(',') !== global.Defaults.files.configuration.data.devsID.sort().join(',')) {
            logger.warn(`>>> Developer IDs have been changed from the default! We are slightly unhappy :C`);
        }

        this.login(this.privatedata.token).then((token) => {
            logger.info(`Sucessfully logged in to discord servers with token: ${token}`)
        }).catch((err) => {
            throw err;
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
        return {
            cpuUsage: os.loadavg()[1],
            memUsage: process.memoryUsage().rss / 1024 / 1024,
        }
    }

    uptime () {
    	return String(process.uptime()).toHHMMSS();
    }
}

// sets up class to be accessable by require()
module.exports = Vulcan;
