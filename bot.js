// Check for missing config/essential files & Load essential modules
require("./scripts/defaults.js");
require("./structures/extensions");

// Get them boys first.
const YAML     = require("js-yaml");
const fs       = require('fs');
const Vulcan   = require('./structures/classes/Vulcan');

// Load Data.
const configurationsFile = fs.readFileSync('./settings/config.yaml', 'utf8');
const credentialsFile    = fs.readFileSync('./settings/noleakdata.yaml', 'utf8');
const configurations     = YAML.safeLoad(configurationsFile);
const credentials        = YAML.safeLoad(credentialsFile);

// Instantiate Vulcan Client Wrapper.
const vulcan = new Vulcan(configurations, credentials);  // if we have trouble with this - blame tacos. *tacos will fix*

// Export (before loading events)
module.exports = vulcan;

// Fire in the hole.
vulcan.loadEvents().connect();