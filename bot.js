// Initialisation
xrequire('./plugins/scripts/coreEvents');
xrequire('./plugins/scripts/defaults');

// Vulcan init structures (via index.js)
xrequire('./structures/prototypes')();
xrequire('./structures/extensions')();

// Required modules
const fs     = xrequire('fs');
const yaml   = xrequire('js-yaml');
const Vulcan = xrequire('./structures/classes/core/Vulcan');
const logger = xrequire('./managers/LogManager').getInstance();

// Load settings & configuration data
const defautlFiles      = global.VulcanDefaults.files;
const configurationFile = fs.readFileSync(defautlFiles.configuration.location, 'utf8');
const credentialsFile   = fs.readFileSync(defautlFiles.credentials.location, 'utf8');
const permissionsFile   = fs.readFileSync(defautlFiles.permissions.location, 'utf8');
const configuration     = yaml.safeLoad(configurationFile);
const credentials       = yaml.safeLoad(credentialsFile);
const permissions       = yaml.safeLoad(permissionsFile);

// Instantiate & export vulcan client
const vulcan = module.exports = new Vulcan(
    // Vulcan Options
    {
        configuration,
        credentials,
        permissions
    },
    // Discord.js Options
    {
        disabledEvents: [
            'USER_NOTE_UPDATE',
            'TYPING_START',
            'RELATIONSHIP_ADD',
            'RELATIONSHIP_REMOVE'
        ],
        disableEveryone: true,
        messageCacheMaxSize: 1000
    }
);

// Load Vulcan (do NOT chain of instantiation)
vulcan.loadDatabase()
      .loadCommands()
      .loadEvents()
      .loadPermissions()
      .loadCLI()
      .connect(); // [must be last or omitted]

// Log
logger.log(`Vulcan start-up has completed! Time taken: ${vulcan.uptime()}`);
