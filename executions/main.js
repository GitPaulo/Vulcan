/**
 * ? Execution File
 * This file loads vulcan as would be desired in a production environment.
 */

// Vulcan client
const Vulcan = xrequire('./structures/core/Vulcan');
let vulcan = new Vulcan(
  // Discord.js options
  {
    disabledEvents: ['USER_NOTE_UPDATE', 'TYPING_START', 'RELATIONSHIP_ADD', 'RELATIONSHIP_REMOVE'],
    disableEveryone: true,
    messageCacheMaxSize: 1000
  }
);

// Connect
vulcan.connect();

// Export vulcan
module.exports = vulcan;
