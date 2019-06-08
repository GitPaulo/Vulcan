const path            = require('path');
const { performance } = require('perf_hooks');

// Remember to offset paths by their parent since we are in ./tests/
global.__basedir = path.join(__dirname, '/../');
const logger     = require('../managers/logManager').getInstance();

logger.plain(
`=======================================
  Vulcan Loading Process Test [START]   
=======================================`
);

let t0 = performance.now();

// Pre initialisation
require('../modules/scripts/globals');
requireall('../structures/prototypes');
requireall('../structures/extensions');
require('../modules/scripts/defaults');

// Get them boys first.
const fs     = require('fs');
const YAML   = require('js-yaml');
const Vulcan = require('../structures/classes/Vulcan');

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
