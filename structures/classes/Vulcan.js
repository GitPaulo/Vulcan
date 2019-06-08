const Discord            = require('discord.js');
const { _, performance } = require('perf_hooks');
const os                 = require('os');
const fs                 = require('fs');
const path               = require('path');
const YAML               = require('js-yaml');
const databaseManager    = require('../../managers/databaseManager');
const mathematics        = require('../../modules/utility/mathematics');
const fileFunctions      = require('../../modules/utility/fileFunctions');
const logger             = require('../../managers/logManager').getInstance();

////////////////////////////////////////////////////////////////
const couldnt_have_forged_it_better_myself = `\\ \\    / /   | |                
 \\ \\  / /   _| | ___ __ _ _ __  
  \\ \\/ / | | | |/ __/ _\` | \'_ \\ 
   \\  /| |_| | | (_| (_| | | | |
    \\/  \\__,_|_|\\___\\__,_|_| |_| by Pas-kun & Tacos-sama`
////////////////////////////////////////////////////////////////

let chainPrint = (category, chainee) => (logger.info('Initialised => ' +
    category
), chainee);

class Vulcan extends Discord.Client {
    constructor (configuration, privatedata) {
        super();

        // Seal these properties! :)
        Object.defineProperties(this, {
            configuration: { value: configuration,  writable: false, enumerable: false, configurable: false },
            privatedata:   { value: privatedata,    writable: false, enumerable: false, configurable: false },
        });

        // Vulcan is here!
        logger.printc('FgRed', couldnt_have_forged_it_better_myself);
    }

    /******************
     * Chain methods. *
     ******************/
    loadCommands (folderPath = './commands/') {
        let commandList = {};
        let dirPath     = path.join(__basedir, folderPath);
        let commands    = fileFunctions.allDirFiles(dirPath);

        for (let commandPath of commands) {
            let t       = performance.now();
            let matches = commandPath.match(/\w*.js/)
            let cmdName = matches[matches.length - 1].slice(0, -3);
            
            try {
                let fullPath     = path.join(dirPath, commandPath);
                let CommandClass = require(fullPath);
                
                let s               = `\\`;
                let firstOccurrence = commandPath.indexOf(s)
                let lastOccurrence  = commandPath.lastIndexOf(s);
                let CommandType     = commandPath.substring(firstOccurrence+1, lastOccurrence).replace(s, '.');
    
                let command = new CommandClass(CommandType);
                let keys    = [command.name, ...command.aliases];
    
                for (let key of keys) {
                    commandList[key] = command;
                }
    
                t = mathematics.round(performance.now() - t, 2);
                logger.info(`Loaded command ${cmdName} from ${commandPath} (took ${t}ms)`);
            } catch(err) {
                console.log(err.code, err.stack)
                logger.error(err.shortMessage());
            }
        }

        this.commands = commandList;

        return chainPrint('Vulcan Commands', this);
    }

    loadEvents (folderPath = './events/') {
        const eventsPath          = path.join(__basedir, folderPath);
        const vulcanEventsPath    = path.join(eventsPath, 'vulcan');
        const discordjsEventsPath = path.join(eventsPath, 'discordjs');
        
        let discordEvents = fs.readdirSync(discordjsEventsPath).filter(file => file.endsWith('.js'));
        let vulcanEvents  = fs.readdirSync(vulcanEventsPath).filter(file => file.endsWith('.js'));
        
        for (let eventFile of discordEvents) {
            let t     = performance.now();
            let event = eventFile.replace(/\.js$/i, '');
            this.on(event, require(path.join(discordjsEventsPath, eventFile)));
            logger.info(`Finished loading (DiscordJS) event file '${eventFile}' (took '${mathematics.round(performance.now() - t, 2)}ms').`);
        }

        for (let eventFile of vulcanEvents) {
            let t     = performance.now();
            let event = eventFile.replace(/\.js$/i, '');
            this.on(event, require(path.join(discordjsEventsPath, eventFile)));
            logger.info(`Finished loading (Vulcan) event file '${eventFile}' (took '${mathematics.round(performance.now() - t, 2)}ms').`);
        }

        return chainPrint('Discord & Vulcan Events', this);
    }
    
    dbConnect () {
        const credentialsFile = fs.readFileSync(global.Defaults.files.dbcredentials.location, 'utf8');
        const credentials     = YAML.safeLoad(credentialsFile);

        this.databaseManager = new databaseManager();
        this.databaseManager.connect(credentials.username, credentials.password);

        return chainPrint('Database Connection', this);
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

        return chainPrint('Discord Connection', this);
    }

    /**********************
     * Accessors & Others *
     **********************/

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

module.exports = Vulcan;
