const fs       = require('fs');
const path     = require('path');
const YAML     = require('js-yaml');

const ROOT_PATH       = path.dirname(require.main.filename);
const SETTINGS_FOLDER = 'settings';

let DefaultFile = function (location, data) {
    this.location = location;
    this.data     = data
}

const COMPLEX = 1;
const SIMPLE  = 2;
global.ParsingTypes = { COMPLEX, SIMPLE };

global.Defaults = {
    files : {
        'configuration' : new DefaultFile(
            path.join(ROOT_PATH, SETTINGS_FOLDER, 'config.yaml'),
            { 
                prefixes: ['!', '>'],
                devsID:   ['166176374036365312', '207606117159796737'], // please don't change this
                parsingType: [SIMPLE], // complex or simple
            }
        ),
        'privatedata' : new DefaultFile(
            path.join(ROOT_PATH, SETTINGS_FOLDER, 'noleakdata.yaml'),
            {
                token: `'PLEASE ADD YOUR DISCORD TOKEN HERE'`,
            }
        ),
        'dbcredentials' : new DefaultFile(
            path.join(ROOT_PATH, SETTINGS_FOLDER, 'dbcredentials.yaml'),
            {
                username: 'ur_mom_gay',
                password: 'no_u'
            }
        )
    }
};

// Checks dirs for any config/setting/essential file that might be missing!
(function () {
    // First, check if folder exists
    if (!fs.existsSync(SETTINGS_FOLDER)) {
        fs.mkdirSync(SETTINGS_FOLDER);
    }

    // Then files
    for (let fileKey in Defaults.files) {
        let defaultObject = Defaults.files[fileKey];
        let path          = defaultObject.location;

        if (!fs.existsSync(path)) {
            let data = YAML.safeDump(defaultObject.data);
            print(`Missing essential file: '${path}' - writing defaults...`);
           
            fs.writeFileSync(path, data, function(err) {
                if (err) throw err;
            }); 
        }
    }
})();