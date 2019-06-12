// Remember to offset paths by their parent since we are in ./tests/
const path            = require('path');
const { performance } = require('perf_hooks');
const logger          = xrequire('./managers/LogManager').getInstance();

logger.plain(
`=======================================
  Vulcan Loading Process Test [START]   
=======================================`
);

let t0 = performance.now();

// Initialisation
xrequire('./modules/scripts/initscript');
xrequire('./modules/scripts/defaults');

// Vulcan init structures (via index.js)
xrequire('./structures/prototypes')();
xrequire('./structures/extensions')();

// File requires
const fs     = xrequire('fs');
const yaml   = xrequire('js-yaml');
const Vulcan = xrequire('./structures/classes/Vulcan');

// Load Data
const configurationFile = fs.readFileSync(path.resolve(__dirname, '../settings/config.yaml'), 'utf8');
const privatedataFile   = fs.readFileSync(path.resolve(__dirname, '../settings/noleakdata.yaml'), 'utf8');
const configuration     = yaml.safeLoad(configurationFile);
const privatedata       = yaml.safeLoad(privatedataFile);

// Instantiate & export vulcan client
let vulcan = module.exports = new Vulcan(configuration, privatedata);

// Load vulcan (do NOT chain of instantiation)
vulcan.loadCommands()
      .loadEvents()
      .dbConnect()
      .connect();

logger.plain(
`=======================================
   Vulcan Loading Process Test [END]   
   Time: ${performance.now() - t0}ms
=======================================`
);
