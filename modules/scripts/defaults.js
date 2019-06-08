const fs   = require('fs');
const path = require('path');
const YAML = require('js-yaml');

const SETTINGS_FOLDER = 'settings';
const PRINT_PREFIX    = '[DEFAULTS]';
const ROOT_PATH       = __basedir;
const PARSING_TYPES   = {
    COMPLEX: 1,
    SIMPLE: 2
};

let DefaultFile = function (location, data) {
    this.location = location;
    this.data = data
}

let log = (...args) => {
    console.log(PRINT_PREFIX, ...args);
}

let writeToDefaultFile = (object, path) => {
    let data = YAML.safeDump(object);

    fs.writeFileSync(path, data, function (err) {
        if (err) throw err;
    });
}

global.ParsingTypes = PARSING_TYPES;
global.Defaults = {
    files: {
        'configuration': new DefaultFile(
            path.join(ROOT_PATH, SETTINGS_FOLDER, 'config.yaml'), {
                prefixes: ['!', '>'],
                devsID: ['166176374036365312', '207606117159796737'], // please don't change this
                parsingType: [PARSING_TYPES.SIMPLE],
            }
        ),
        'privatedata': new DefaultFile(
            path.join(ROOT_PATH, SETTINGS_FOLDER, 'noleakdata.yaml'), {
                token: `'PLEASE ADD YOUR DISCORD TOKEN HERE'`,
                githubAuth: {
                    username: "GitPaulo",
                    password: "KONO DIO DA"
                }
            }
        ),
        'dbcredentials': new DefaultFile(
            path.join(ROOT_PATH, SETTINGS_FOLDER, 'dbcredentials.yaml'), {
                username: 'ur_mom_gay',
                password: 'no_u'
            }
        )
    }
};

// Check for missing settings files and root properties & write defaults.
(function () {
    // First, check if folder exists
    if (!fs.existsSync(SETTINGS_FOLDER)) {
        fs.mkdirSync(SETTINGS_FOLDER);
    }
    // Then, files
    for (let fileKey in Defaults.files) {
        let defaultObject = Defaults.files[fileKey];
        let path = defaultObject.location;
        if (!fs.existsSync(path)) {
            log(`Default file: ${path} is missing. Writing defaults.`);
            writeToDefaultFile(defaultObject.data, path);
        } else { // check if contents are proper
            let defaultFile = fs.readFileSync(path, 'utf8');
            let parsedObject = YAML.safeLoad(defaultFile);
            let missingProperties = Object.keys(defaultObject.data).difference(Object.keys(parsedObject));
            if (missingProperties.length > 0) {
                for (let rootProperty of missingProperties) {
                    parsedObject[rootProperty] = defaultObject.data[rootProperty];
                }
                log(`Root property(s) missing: ${missingProperties.toString()}, writing defaults for file in ${path}.`);
                writeToDefaultFile(parsedObject, path);
            }
        }
    }
})();