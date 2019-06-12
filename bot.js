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
const logger = xrequire('./managers/LogManager').getInstance();

// Load Data
const configurationFile = fs.readFileSync('./settings/config.yaml', 'utf8');
const privatedataFile   = fs.readFileSync('./settings/noleakdata.yaml', 'utf8');
const permissionsFile   = fs.readFileSync('./settings/user_permissions.yaml', 'utf8');
const configuration     = YAML.safeLoad(configurationFile);
const privatedata       = YAML.safeLoad(privatedataFile);
const permissions       = YAML.safeLoad(permissionsFile);

// Heroku ENV token
if(process.env.BOT_TOKEN)
    privatedata.token = process.env.BOT_TOKEN;

// Instantiate & export vulcan client
module.exports = vulcan = new Vulcan(configuration, privatedata, permissions)
    .loadCommands()
    .loadEvents()
    .dbConnect()
    .connect();

// Log
logger.log(`Vulcan start-up has completed! Time taken: ${vulcan.uptime()}`);
