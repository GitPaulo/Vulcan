require('../modules/scripts/globals');

// Remember to offset paths by their parent since we are in ./tests/
const path            = require('path');
const { performance } = require('perf_hooks');
const logger          = xrequire('./managers/logManager').getInstance();

logger.plain(
`=======================================
  Vulcan Loading Process Test [START]   
=======================================`
);

let t0 = performance.now();

// Pre initialisation
requireall('./structures/prototypes');
requireall('./structures/extensions');
xrequire('./modules/scripts/defaults');

// Get them boys first.
const fs     = xrequire('fs');
const YAML   = xrequire('js-yaml');
const Vulcan = xrequire('./structures/classes/Vulcan');

// Load Data. Remember, file functions do not use relative path. 
const configurationFile = fs.readFileSync(path.resolve(__dirname, '../settings/config.yaml'), 'utf8');
const privatedataFile   = fs.readFileSync(path.resolve(__dirname, '../settings/noleakdata.yaml'), 'utf8');
const configuration     = YAML.safeLoad(configurationFile);
const privatedata       = YAML.safeLoad(privatedataFile);

// Instantiate & export vulcan client.
module.exports = vulcan = new Vulcan(configuration, privatedata)
    .loadCommands()
    .loadEvents()
    .dbConnect();

logger.plain(
`=======================================
   Vulcan Loading Process Test [END]   
   Time: ${performance.now() - t0}ms
=======================================`
);
