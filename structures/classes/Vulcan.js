const Discord            = xrequire('discord.js');
const { performance }    = xrequire('perf_hooks');
const os                 = xrequire('os');
const fs                 = xrequire('fs');
const path               = xrequire('path');
const yaml               = xrequire('js-yaml');
const DatabaseManager    = xrequire('./managers/DatabaseManager');
const PermissionManager = xrequire('./managers/PermissionManager');
const mathematics        = xrequire('./modules/utility/mathematics');
const fileFunctions      = xrequire('./modules/utility/fileFunctions');
const logger             = xrequire('./managers/LogManager').getInstance();

/****************************************************************/
// eslint-disable-next-line camelcase
const couldnt_have_forged_it_better_myself = `\\ \\    / /   | |                
 \\ \\  / /   _| | ___ __ _ _ __  
  \\ \\/ / | | | |/ __/ _\` | \'_ \\ 
   \\  /| |_| | | (_| (_| | | | |
    \\/  \\__,_|_|\\___\\__,_|_| |_| by Pas-kun & Tacos-sama`;
/****************************************************************/

let chainPrint = (category, chainee) => (logger.log('Initialised => ' +
    category
// eslint-disable-next-line no-sequences
), chainee);

class Vulcan extends Discord.Client {
    constructor (configuration, privatedata, permissions) {
        super();

        // Seal these properties! :)
        Object.defineProperties(this, {
            configuration: { value: configuration,  writable: false, enumerable: false, configurable: false },
            privatedata: { value: privatedata,    writable: false, enumerable: false, configurable: false },
            permissions: { value: permissions,    writable: false, enumerable: false, configurable: false }
        });

        // Vulcan is here!
        logger.plain(couldnt_have_forged_it_better_myself, 'red');
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
            let matches = commandPath.match(/\w*.js/);
            let cmdName = matches[matches.length - 1].slice(0, -3);

            try {
                let fullPath     = path.join(dirPath, commandPath);
                let CommandClass = xrequire(fullPath);
                let commandType  = path.dirname(fullPath).split(path.sep).slice(-1).pop();

                let command = new CommandClass(commandType);
                let keys    = [command.name, ...command.aliases];

                for (let key of keys) {
                    commandList[key] = command;
                }

                t = mathematics.round(performance.now() - t, 2);
                logger.log(`Loaded command ${cmdName} from ${commandPath} (took ${t}ms)`);
            } catch (err) {
                console.log(err.code, err.stack);
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
            this.on(event, xrequire(path.join(discordjsEventsPath, eventFile)));
            logger.log(`Finished loading (DiscordJS) event file '${eventFile}' (took ${mathematics.round(performance.now() - t, 2)}ms).`);
        }

        for (let eventFile of vulcanEvents) {
            let t     = performance.now();
            let event = eventFile.replace(/\.js$/i, '');
            this.on(event, xrequire(path.join(vulcanEventsPath, eventFile)));
            logger.log(`Finished loading (Vulcan) event file '${eventFile}' (took ${mathematics.round(performance.now() - t, 2)}ms).`);
        }

        return chainPrint('Discord & Vulcan Events', this);
    }

    dbConnect () {
        const credentialsFile = fs.readFileSync(global.Defaults.files.dbcredentials.location, 'utf8');
        const credentials     = yaml.safeLoad(credentialsFile);

        this.databaseManager = new DatabaseManager();
        this.databaseManager.connect(credentials.username, credentials.password);

        return chainPrint('Database Connection', this);
    }

    connect () {
        logger.log('Attempting to connect to discord servers...');

        if (this.privatedata.token === global.Defaults.files.privatedata.data.token) {
            logger.warn(`>>> Default token detected, please change @'${Defaults.files.privatedata.location}'`);
        }

        if (this.configuration.devsID.sort().join(',') !== global.Defaults.files.configuration.data.devsID.sort().join(',')) {
            logger.warn(`>>> Developer IDs have been changed from the default! We are slightly unhappy :C`);
        }

        this.login(this.privatedata.token).then((token) => {
            logger.log(`Sucessfully logged in to discord servers with token: ${token}`);
        }).catch((err) => {
            throw err;
        });

        return chainPrint('Discord Connection', this);
    }

    enablePermissions () {
        this.permissionManager = new PermissionManager(this.permissions);

        return chainPrint('Permission system', this);
    }

    /**********************
     * Accessors & Others *
     **********************/

    getOnlineStatistics () {
        return {
            guildCount: this.guilds.size,
            channelCount: this.channels.size,
            userCount: this.users.size
        };
    }

    getMachineStatistics () {
        return {
            cpuUsage: os.loadavg()[1],
            memUsage: process.memoryUsage().rss / 1024 / 1024
        };
    }

    uptime () {
        return String(process.uptime()).toHHMMSS();
    }
}

module.exports = Vulcan;
