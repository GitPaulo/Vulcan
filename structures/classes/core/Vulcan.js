const os              = xrequire('os');
const fs              = xrequire('fs');
const pem             = xrequire('pem');
const path            = xrequire('path');
const yaml            = xrequire('js-yaml');
const Discord         = xrequire('discord.js');
const { performance } = xrequire('perf_hooks');
const DatabaseManager = xrequire('./managers/DatabaseManager');
const TerminalManager = xrequire('./managers/TerminalManager');
const PresenceManager = xrequire('./managers/PresenceManager');
const logger          = xrequire('./managers/LogManager').getInstance();

/****************************************************************/
global['couldnt_have_forged_it_better_myself'] = `
\\ \\    / /   | |                
 \\ \\  / /   _| | ___ __ _ _ __  
  \\ \\/ / | | | |/ __/ _\` | \'_ \\ 
   \\  /| |_| | | (_| (_| | | | |
    \\/  \\__,_|_|\\___\\__,_|_| |_| by Pas-kun & Tacos-sama\n`;
/****************************************************************/

// Dumb function : )
const chainPrint = (category, chainee) => (logger.log('Initialised => ' + category), chainee);

class Vulcan extends Discord.Client {
    constructor (vulcanOptions, discordOptions = {}) {
        // https://discord.js.org/#/docs/main/stable/typedef/ClientOptions
        super(discordOptions);

        // Easy Clap
        const { settings, defaults } = vulcanOptions;

        // ! These two properties are NOT to be changed
        Object.defineProperties(
            this,
            {
                defaults: {
                    value       : defaults,
                    writable    : false,
                    enumerable  : true,
                    configurable: false
                },
                credentials: {
                    value       : settings.credentials,
                    writable    : false,
                    enumerable  : true,
                    configurable: false
                }
            }
        );

        // Join prefixes as a regex
        const prefixString = settings.configuration.prefixes.join('|');
        const prefixRegex  = prefixString.regexEscape(['|']);

        this.prefixRegex = new RegExp(`^(${prefixRegex})`, 'u');

        // ? Initialise 'public' properties
        this.configuration = settings.configuration;
        this.blacklist     = new Map(settings.blacklist);
        this.servers       = new Map(settings.servers);
        this.usergroups    = new Map(settings.usergroups);

        // * Set up hierarchy
        const hierarchyArray = ['root', ...settings.configuration.usergroups, 'default'];

        this.defaultGroupName = 'default';
        this.rootGroupName    = 'root';
        this.hierarchy        = new Map(hierarchyArray.map((value, index) => [value, index + 1])); // ? make index not be 0 (cuz falsey)

        // * Add owners and devs to root
        [...this.configuration.devsID, ...this.configuration.ownersID].forEach((id) => {
            this.usergroups.set(id, this.rootGroupName);
        });

        console.log(this.usergroups, this.hierarchy, hierarchyArray);

        // Vulcan is here!
        logger.plain(global.couldnt_have_forged_it_better_myself, 'red');
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
        this.commands = xrequire('./handlers/commandLoadHandler')(this, folderPath);

        return chainPrint('Discord Commands', this);
    }

    loadEvents (folderPath = './events/') {
        const eventsPath          = path.join(__basedir, folderPath);
        const vulcanEventsPath    = path.join(eventsPath, 'vulcan');
        const discordjsEventsPath = path.join(eventsPath, 'discord');

        let discordEvents = fs.readdirSync(discordjsEventsPath).filter((file) => file.endsWith('.js'));
        let vulcanEvents  = fs.readdirSync(vulcanEventsPath).filter((file) => file.endsWith('.js'));

        for (let eventFile of discordEvents) {
            let t     = performance.now();
            let event = eventFile.replace(/\.js$/i, '');

            this.on(event, xrequire(path.join(discordjsEventsPath, eventFile)));
            logger.log(`Finished loading (DiscordJS) event file '${eventFile}' (took ${Math.roundDP(performance.now() - t, 2)}ms).`);
        }

        for (let eventFile of vulcanEvents) {
            let t     = performance.now();
            let event = eventFile.replace(/\.js$/i, '');

            this.on(event, xrequire(path.join(vulcanEventsPath, eventFile)));
            logger.log(`Finished loading (Vulcan) event file '${eventFile}' (took ${Math.roundDP(performance.now() - t, 2)}ms).`);
        }

        return chainPrint('Discord & Vulcan Events', this);
    }

    loadDatabase () {
        this.databaseManager = new DatabaseManager(this);

        const defaultCreds  = this.defaults.settings.credentials.data.database;
        const dbcredentials = this.credentials.database;
        const { username, password } = dbcredentials;

        if (username === defaultCreds.username) {
            logger.warning(
                `Database username (${username}) has matched the default.`
              + `\n\tThis is likely to be wrong and is unrecommended.`
            );
        }

        if (password === defaultCreds.password) {
            logger.warning(
                `Database password (${'*'.repeat(password.length)}) has matched the default.`
              + `\n\tThis is likely to be wrong and is unrecommended.`
            );
        }

        this.databaseManager.connect(username, password);

        return chainPrint('Database Connection', this);
    }

    loadPresence () {
        this.presenceManager = new PresenceManager(this);

        return chainPrint('Presence', this);
    }

    loadWebServer (port = 443) {
        pem.createCertificate({ days: 31, selfSigned: true }, (err, keys) => {
            if (err) {
                throw err;
            }

            this.webServer = xrequire('./webhooks')(this, keys);

            this.webServer.listen(port, (err) => {
                if (err) {
                    return logger.error(`Something bad happened while starting web server!\n\tERROR: ${err.message}`);
                }

                logger.debug(`Web server is listening on ${port}`);
            });
        });

        return chainPrint('Web Server', this);
    }

    connect () {
        logger.log('Attempting to connect to discord servers...');

        const defaultCreds = this.defaults.settings.credentials.data;
        const credentials  = this.credentials;

        if (credentials.token === defaultCreds.token) {
            return logger.error(`Default token detected, please change @'${defaultCreds.location}'`);
        }

        const defaultConfig = this.defaults.settings.configuration.data;
        const configuration = this.configuration;

        if (configuration.devsID.sort().join(',') !== defaultConfig.devsID.sort().join(',')) {
            logger.warning(`Default developer IDs have been changed from the default!\n\tWe are slightly unhappy :C`);
        }

        const token = credentials.token;

        this.login(token).then((_token) => {
            this.loadTime = process.uptime();
            logger.log(`Sucessfully logged in to discord servers with token: ${_token}`);
        });

        return chainPrint('Discord Connection', this);
    }

    /************************
     * Extra Client Methods *
    ************************/

    // TODO: Switch is pepega (improve)
    // ! Perhaps turn this to async? (or make equivalent async)
    update (descriptor = 'all') {
        // Handle state => settings files update
        const t0                 = performance.now();
        const shouldBreak        = (descriptor !== 'all');
        const updateSettingsFile = (id, data) => {
            fs.writeFileSync(
                this.defaults.settings[id].location,
                yaml.safeDump(data),
                'utf8'
            );
            logger.debug(`Updated file of id: ${id}`);
        };

        // Allows update selection
        // ? Maps are turned into arrays for yaml dump
        switch (descriptor) {
            case 'all':
            case 'configuration':
                updateSettingsFile('configuration', this.configuration);
                if (shouldBreak) {
                    break;
                }
            case 'blacklist':
                updateSettingsFile('blacklist', [...this.blacklist]);
                if (shouldBreak) {
                    break;
                }
            case 'servers':
                updateSettingsFile('servers', [...this.servers]);
                if (shouldBreak) {
                    break;
                }
            case 'usergroups':
                updateSettingsFile('usergroups', [...this.usergroups]);
                if (shouldBreak) {
                    break;
                }
            default:
                throw new Error(`Invalid update descriptor: ${descriptor}`);
        }

        // TODO: Do other stuff?

        logger.log(`Vulcan update completed, time taken: ${Math.roundDP(performance.now() - t0, 2)}`);
    }

    authoriseGuild (guildID) {
        const cachedGuild = this.guilds.get(guildID);

        // Add to auth servers list + date of addition
        this.servers.set(guildID, Date.now());
        this.update('servers');

        if (!cachedGuild) {
            logger.warning(`Authorised uncached guild!`);
        }

        logger.log(`Authorised guild with id: ${guildID}.`);

        return cachedGuild;
    }

    unauthoriseGuild (guildID) {
        const cachedGuild = this.guilds.get(guildID);

        this.servers.delete(guildID);
        this.update('servers');

        if (!cachedGuild) {
            logger.warning(`Unauthorising uncached guild!`);
        }

        logger.log(`Unauthorised guild with id: ${guildID}`);

        return cachedGuild;
    }

    blacklistUser (userID) {
        const cachedUser = this.users.get(userID);
        const blDate     = Date.now();

        // Add user to blacklist
        this.blacklist.set(userID, blDate);
        this.update('blacklist');

        if (!cachedUser) {
            logger.warning(`Blacklisted uncached user: ${userID}`);
        }

        logger.log(`Added user id (${userID}) to the Vulcan blacklist.`);

        return cachedUser;
    }

    unblacklistUser (userID) {
        const entry = this.blacklist.get(userID);

        if (!entry) {
            throw new Error(`User (${userID}) is not in the blacklist!`);
        }

        const cachedUser = this.users.get(userID);

        // Remove user from blacklist
        this.blacklist.delete(userID);
        this.update('blacklist');

        if (!cachedUser) {
            logger.warning(`Unblacklisted uncached user: ${userID}`);
        }

        logger.log(`Removed user id (${userID}) from the Vulcan blacklist.`);

        return cachedUser;
    }

    updateUsergroup (userID, newGroupName) {
        const newGroupLevel = this.hierarchy.get(newGroupName);

        if (typeof newGroupLevel === 'undefined') {
            throw new Error(`Invalid group id passed: ${newGroupName}`);
        }

        if (newGroupLevel < 1 || newGroupLevel > this.hierarchy.size) {
            throw new Error(`Invalid permission level. HIGHEST: ${1} LOWEST: ${this.hierarchy.size} GIVEN: ${newGroupLevel}`);
        }

        if (newGroupLevel === 1) {
            throw new Error(`Root users cannot be modified during runtime!`);
        }

        const currentGroup = this.fetchUsergroup(userID);

        if (currentGroup.name === newGroupName) {
            throw new Error(`Tried to assign a user a group which he already has! (${newGroupName})`);
        }

        const cachedUser = this.users.get(userID);

        // Update usergroups
        this.usergroups.set(userID, newGroupName);
        this.update('usergroups');

        if (!cachedUser) {
            logger.warning(`Updated usergroup of uncached user: ${userID}`);
        }

        logger.log(`User group of ${cachedUser.tag}(userID) updated from ${currentGroup.name} => ${newGroupName}.`);

        return cachedUser;
    }

    fetchUsergroup (userID) {
        const name  = this.usergroups.get(userID) || this.defaultGroupName;
        const level = this.hierarchy.get(name);

        return {
            name,
            level
        };
    }

    destroy () {
        // Stop Vulcan CLI
        if (this.terminalManager) {
            this.terminalManager.stop();
        }

        // Close other things safely (database perhaps?)
        // [here]

        super.destroy();
    }

    /************************
     * Accessors & Mutators *
     ***********************/

    get statistics () {
        return {
            emojisAccessedCount: this.emojis.array.length,
            broadcastCount     : this.voice.broadcasts.length,
            shardCount         : this.shard,
            guildCount         : this.guilds.size,
            authGuildCount     : this.servers.size,
            blacklistCount     : this.blacklist.size,
            channelCount       : this.channels.size,
            userCount          : this.users.size
        };
    }

    get performance () {
        return {
            cpuUsage: os.loadavg()[1],
            memUsage: process.memoryUsage().rss / 1024 / 1024
        };
    }
}

module.exports = Vulcan;
