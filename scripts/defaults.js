const fs       = require('fs');
const path     = require('path');
const YAML     = require("js-yaml");
const rootPath = path.dirname(require.main.filename);

global.DEFAULT = "OMG NO DATA HERE SO SAD";

// Checks dirs for any config/setting/essential file that might be missing!
let essentialsList = [
    {
        location: rootPath + "/settings/config.yaml",
        defaultData: { 
            prefixes: ["!", ">"],
        }
    },
    {
        location: rootPath + "/settings/noleakdata.yaml",
        defaultData: {
            token: global.DEFAULT,
        }
    },
    {
        location: rootPath + "/settings/database_credentials.yaml",
        defaultData: {
            username: "ur mom gay",
            password: "no u"
        }
    }
];

(function () {
    for (let defaultObject of essentialsList) {
        let path = defaultObject.location;
        if (!fs.existsSync(path)) {
            let data = YAML.safeDump(defaultObject.defaultData);
            console.log(`Missing essential file: "${path}" - writing defaults...`);
            fs.writeFileSync(path, data, function(err) {
                if (err) throw err;
            }); 
        }
    }
})();