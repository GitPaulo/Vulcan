// Pre-initialisation scripts
xrequire('./utility/scripts/coreEvents');

// Load structures
xrequire('./handlers/prototypeLoadHandler')();
xrequire('./handlers/extensionLoadHandler')();

// Load defaults & settings
const defaults = xrequire('./utility/defaults');
const settings = xrequire('./handlers/settingsLoadHandler')(defaults);

// Instantiate & export vulcan client
const Vulcan = xrequire('./structures/classes/core/Vulcan');
const vulcan = module.exports = new Vulcan(
    // Vulcan options
    {
        defaults,
        settings
    },
    // Discord.js options
    {
        disabledEvents: [
            'USER_NOTE_UPDATE',
            'TYPING_START',
            'RELATIONSHIP_ADD',
            'RELATIONSHIP_REMOVE'
        ],
        disableEveryone    : true,
        messageCacheMaxSize: 1000
    }
);

// Start vulcan
vulcan
    // ! .loadDatabase() // Not used
    .loadCommands()
    .loadEvents()
    .loadPresence()
    .loadFileServer()
    .loadWebServer()
    .loadCLI()
    .connect();

// Load complete flag
global.__loaded = true;
