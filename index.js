// Libs
const YAML     = require("js-yaml");
const fs       = require('fs');
const Vulcan   = require('./structures/Vulcan');

// Load Data
const configurationsFile = fs.readFileSync('settings/config.yaml', 'utf8');
const credentialsFile    = fs.readFileSync('settings/noleakdata.yaml', 'utf8');
const configurations     = YAML.safeLoad(configurationsFile);
const credentials        = YAML.safeLoad(credentialsFile);

// client
const vulcan = new Vulcan(configurations, credentials);
vulcan.connect();
