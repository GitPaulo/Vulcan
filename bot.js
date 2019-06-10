// Initialisation
xrequire('./modules/scripts/initscript');
xrequire('./modules/scripts/defaults');

// Vulcan init structures (via index.js) 
xrequire('./structures/prototypes')();
xrequire('./structures/extensions')();

// File requires
const fs     = xrequire('fs');
const YAML   = xrequire('js-yaml');
const Vulcan = xrequire('./structures/classes/Vulcan');
const logger = xrequire('./managers/logManager').getInstance();

// Load Data
const configurationFile = fs.readFileSync('./settings/config.yaml', 'utf8');
const privatedataFile   = fs.readFileSync('./settings/noleakdata.yaml', 'utf8');
const configuration     = YAML.safeLoad(configurationFile);
const privatedata = YAML.safeLoad(privatedataFile);
privatedata.token = process.env.BOT_TOKEN;

// Instantiate & export vulcan client
module.exports = vulcan = new Vulcan(configuration, privatedata)
    .loadCommands()
    .loadEvents()
    .dbConnect()
    .connect();

// Log
logger.log(`Vulcan start-up has completed! Time taken: ${vulcan.uptime()}`);
