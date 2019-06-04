// Require globals and defaults + structures needed before initialisation
require('./modules/scripts/globals.js');
require('./modules/scripts/defaults.js');
requireall('./structures/prototypes');
requireall('./structures/extensions');

// Get them boys first.
const fs     = require('fs');
const YAML   = require('js-yaml');
const Vulcan = require('./structures/classes/Vulcan');

// Load Data.
const configurationFile = fs.readFileSync('./settings/config.yaml', 'utf8');
const privatedataFile   = fs.readFileSync('./settings/noleakdata.yaml', 'utf8');
const configuration     = YAML.safeLoad(configurationFile);
const privatedata       = YAML.safeLoad(privatedataFile);

// Instantiate Vulcan Client object.
const vulcan   = new Vulcan(configuration, privatedata); // if we have trouble with this - blame tacos. *tacos will fix*
module.exports = vulcan;

// Connect to database (comment out if no database needed)
// vulcan.storageManager.databaseConnect()

// Fire in the hole!
vulcan.loadEvents().connect();

// Log
vulcan.logger.log(`Vulcan initialisation completed! Time taken: ${vulcan.uptime()}`);
