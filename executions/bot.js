/*
*   Execution File
    This file loads vulcan as would be desired in a production environment.
*/

// Load defaults & settings
const defaults = xrequire('./utility/defaults');
const settings = xrequire('./handlers/settingsLoadHandler')(defaults);

// Instantiate & export Vulcan client
module.exports = (
    new (xrequire('./structures/classes/core/Vulcan'))(
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
    )// ! .loadDatabase()
        .loadCommands()
        .loadEvents()
        .loadPresence()
        .loadFileServer()
        .loadWebServer()
        .loadCLI()
        .connect()
);
