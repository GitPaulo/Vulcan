// It's useful :)
global.__basedir = __dirname;

// Pre initialisation
require('./modules/scripts/globals');
requireall('./structures/prototypes');
requireall('./structures/extensions');
require('./modules/scripts/defaults');

// Get them boys first.
const fs     = require('fs');
const YAML   = require('js-yaml');
const Vulcan = require('./structures/classes/Vulcan');
const logger = require('./managers/logManager').getInstance();

// Load Data.
const configurationFile = fs.readFileSync('./settings/config.yaml', 'utf8');
const privatedataFile   = fs.readFileSync('./settings/noleakdata.yaml', 'utf8');
const configuration     = YAML.safeLoad(configurationFile);
const privatedata       = YAML.safeLoad(privatedataFile);

// For now throw everything!
process.on('unhandledRejection', (err) => {
    logger.error(err.shortMessage());
    throw err; 
});

// Instantiate & export vulcan client.
module.exports = vulcan = new Vulcan(configuration, privatedata)
    .loadCommands()
    .loadEvents()
    .dbConnect()
    .connect();

// Log
logger.log(`Vulcan start-up has completed! Time taken: ${vulcan.uptime()}`);
