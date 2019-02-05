// Extend structures
require("./structures/extensions");

// Get them boys first.
const YAML     = require("js-yaml");
const fs       = require('fs');
const Vulcan   = require('./structures/classes/Vulcan');

// Load Data.
const configurationsFile = fs.readFileSync('settings/config.yaml', 'utf8');
const credentialsFile    = fs.readFileSync('settings/noleakdata.yaml', 'utf8');
const configurations     = YAML.safeLoad(configurationsFile);
const credentials        = YAML.safeLoad(credentialsFile);

// Instantiate Vulcan Client Wrapper.
global.vulcan  = new Vulcan(configurations, credentials);  // I think this is an >>acceptable<< global variable?

// Fire in the hole.
vulcan.loadEvents().connect();