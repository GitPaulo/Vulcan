/*
*   Execution File
    This file loads vulcan as would be desired in a production environment.
*/

// Load defaults & settings
const defaults = xrequire('./modules/congregate/defaults');
const settings = xrequire('./handlers/settingsLoadHandler')(defaults);
const Vulcan   = xrequire('./structures/classes/core/Vulcan');

// Instantiate & export Vulcan client
module.exports = (
    new Vulcan(
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
    // ? All load functions are synchronous to avoid dragging.
);
