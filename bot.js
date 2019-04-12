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
const configurationsFile = fs.readFileSync('./settings/config.yaml', 'utf8');
const privatedataFile    = fs.readFileSync('./settings/noleakdata.yaml', 'utf8');
const configurations     = YAML.safeLoad(configurationsFile);
const privatedata        = YAML.safeLoad(privatedataFile);

// Instantiate Vulcan Client object.
const vulcan = new Vulcan(configurations, privatedata);  // if we have trouble with this - blame tacos. *tacos will fix*

// Export (before loading events)
module.exports = vulcan;

// Connect to database (comment out if no database needed)
// vulcan.storageManager.databaseConnect()

// Fire in the hole!
vulcan.loadEvents().connect();

// Log
let uptime = process.uptime();
vulcan.logger.log(`Vulcan initialisation completed! Time since start: ${String(uptime).toHHMMSS()}`);