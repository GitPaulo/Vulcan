// Get them boys first.
const YAML     = require("js-yaml");
const fs       = require('fs');
const path     = require('path');
const Vulcan   = require('./structures/Vulcan');

// Load Data.
const configurationsFile = fs.readFileSync('settings/config.yaml', 'utf8');
const credentialsFile    = fs.readFileSync('settings/noleakdata.yaml', 'utf8');
const configurations     = YAML.safeLoad(configurationsFile);
const credentials        = YAML.safeLoad(credentialsFile);

// Instantiate Vulcan Client Wrapper.
const vulcan  = new Vulcan(configurations, credentials);
global.vulcan = vulcan; // I think this is an >>acceptable<< global variable?

// Load Events
let events_path = __dirname + "/events";
fs.readdirSync(events_path).forEach(function (file) {
    vulcan.logger.info("Event file '" + file + "' has been loaded.");
    module.exports[path.basename(file, '.js')] = require(path.join(events_path, file)); // Store module with its name (from filename) 
});

// Let's go boys.
vulcan.connect();


