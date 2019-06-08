// Pre initialisation
require('./modules/scripts/globals');
requireall('structures/prototypes');
requireall('structures/extensions');
xrequire('./modules/scripts/defaults');

// Get them boys first.
const fs     = xrequire('fs');
const YAML   = xrequire('js-yaml');
const Vulcan = xrequire('./structures/classes/Vulcan');
const logger = xrequire('./managers/logManager').getInstance();

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
