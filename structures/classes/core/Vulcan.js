const Discord           = xrequire('discord.js');
const { performance }   = xrequire('perf_hooks');
const os                = xrequire('os');
const fs                = xrequire('fs');
const path              = xrequire('path');
const mathFunctions     = xrequire('./plugins/libs/mathFunctions');
const DatabaseManager   = xrequire('./managers/DatabaseManager');
const TerminalManager   = xrequire('./managers/TerminalManager');
const PermissionManager = xrequire('./managers/PermissionManager');
const logger            = xrequire('./managers/LogManager').getInstance();

/****************************************************************/
// eslint-disable-next-line camelcase
const couldnt_have_forged_it_better_myself = `\\ \\    / /   | |                
 \\ \\  / /   _| | ___ __ _ _ __  
  \\ \\/ / | | | |/ __/ _\` | \'_ \\ 
   \\  /| |_| | | (_| (_| | | | |
    \\/  \\__,_|_|\\___\\__,_|_| |_| by Pas-kun & Tacos-sama`;
/****************************************************************/

// Dumb function : )
let chainPrint = (category, chainee) => (logger.log('Initialised => ' +
    category
// eslint-disable-next-line no-sequences
), chainee);

class Vulcan extends Discord.Client {
    constructor (settings, options = {}) {
        // https://discord.js.org/#/docs/main/stable/typedef/ClientOptions
        super(options);

        // Seal these properties! :)
        Object.defineProperties(this,
            {
                configuration: {
                    value: settings.configuration,
                    writable: false,
                    enumerable: false,
                    configurable: false
                },
                credentials: {
                    value: settings.credentials,
                    writable: false,
                    enumerable: false,
                    configurable: false
                },
                permissions: {
                    value: settings.permissions,
                    writable: false,
                    enumerable: false,
                    configurable: false
                }
            }
        );

        // Vulcan is here!
        logger.plain(couldnt_have_forged_it_better_myself, 'red');
    }

    /*****************
     * Chain methods *
     *****************/

    loadCLI () {
        this.terminalManager = new TerminalManager();
        this.terminalManager.loadCommands();

        this.on('ready', () => {
            logger.log(`Starting CLI...`);
            this.terminalManager.start(this);
        });

        return chainPrint('Vulcan Command Line Interface', this);
    }

    loadCommands (folderPath = './commands/discord/') {
        this.commands = xrequire('./handlers/commandLoadHandler')(folderPath);

        return chainPrint('Discord Commands', this);
    }

    loadEvents (folderPath = './events/') {
        const eventsPath          = path.join(__basedir, folderPath);
        const vulcanEventsPath    = path.join(eventsPath, 'vulcan');
        const discordjsEventsPath = path.join(eventsPath, 'discord');

        let discordEvents = fs.readdirSync(discordjsEventsPath).filter(file => file.endsWith('.js'));
        let vulcanEvents  = fs.readdirSync(vulcanEventsPath).filter(file => file.endsWith('.js'));

        for (let eventFile of discordEvents) {
            let t     = performance.now();
            let event = eventFile.replace(/\.js$/i, '');
            this.on(event, xrequire(path.join(discordjsEventsPath, eventFile)));
            logger.log(`Finished loading (DiscordJS) event file '${eventFile}' (took ${mathFunctions.round(performance.now() - t, 2)}ms).`);
        }

        for (let eventFile of vulcanEvents) {
            let t     = performance.now();
            let event = eventFile.replace(/\.js$/i, '');
            this.on(event, xrequire(path.join(vulcanEventsPath, eventFile)));
            logger.log(`Finished loading (Vulcan) event file '${eventFile}' (took ${mathFunctions.round(performance.now() - t, 2)}ms).`);
        }

        return chainPrint('Discord & Vulcan Events', this);
    }

    loadDatabase () {
        this.databaseManager = new DatabaseManager(this);

        const username = this.credentials.dbCredentials.username;
        const password = this.credentials.dbCredentials.password;

        if (username === global.VulcanDefaults.files.credentials.data.dbCredentials.username) {
            logger.warning(`Database username (${username}) has matched the default.\n\tThis is likely to be wrong and is unrecommended.`);
        }

        if (password === global.VulcanDefaults.files.credentials.data.dbCredentials.password) {
            logger.warning(`Database password (${'*'.repeat(password.length)}) has matched the default.\n\tThis is likely to be wrong and is unrecommended.`);
        }

        this.databaseManager.connect(username, password);

        return chainPrint('Database Connection', this);
    }

    loadPermissions () {
        // Dev ids => roots by default
        for (let devID of this.configuration.devsID) {
            this.permissions.roots.push(devID);
        }

        this.permissionManager = new PermissionManager(this.permissions);
        logger.debug('######### Permissions Enabled ##########');
        logger.debug(this.permissionManager.permissions);

        return chainPrint('Permission system', this);
    }

    connect () {
        logger.log('Attempting to connect to discord servers...');

        if (this.credentials.token === global.VulcanDefaults.files.credentials.data.token) {
            logger.error(`Default token detected, please change @'${global.VulcanDefaults.files.credentials.location}'`);
            return;
        }

        if (this.configuration.devsID.sort().join(',') !== global.VulcanDefaults.files.configuration.data.devsID.sort().join(',')) {
            logger.warning(`Default developer IDs have been changed from the default!\n\tWe are slightly unhappy :C`);
        }

        this.login(this.credentials.token).then((token) => {
            logger.log(`Sucessfully logged in to discord servers with token: ${token}`);
        });

        return chainPrint('Discord Connection', this);
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
