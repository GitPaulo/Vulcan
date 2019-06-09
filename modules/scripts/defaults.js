const fs   = xrequire('fs');
const path = xrequire('path');
const YAML = xrequire('js-yaml');

const PRINT_PREFIX = '[DEFAULTS]';
const ROOT_PATH    = __basedir;
const PARSING_TYPES = {
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
    folders: ['settings', 'data'],
    files: {
        'configuration': new DefaultFile(
            path.join(ROOT_PATH, 'settings', 'config.yaml'), {
                prefixes: ['!', '>'],
                devsID: ['166176374036365312', '207606117159796737'], // please don't change this
                parsingType: [PARSING_TYPES.SIMPLE],
            }
        ),
        'privatedata': new DefaultFile(
            path.join(ROOT_PATH, 'settings', 'noleakdata.yaml'), {
                token: `'PLEASE ADD YOUR DISCORD TOKEN HERE'`,
                githubAuth: {
                    username: "GitPaulo",
                    password: "KONO DIO DA"
                }
            }
        ),
        'dbcredentials': new DefaultFile(
            path.join(ROOT_PATH, 'settings', 'dbcredentials.yaml'), {
                username: 'ur_mom_gay',
                password: 'no_u'
            }
        )
    }
};


// Check for missing settings files and root properties & write defaults.
(function () {
    for (let folderName of Defaults.folders) {
        let folderPath = path.join(__basedir, folderName);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
    }

    for (let fileKey in Defaults.files) {
        let defaultObject = Defaults.files[fileKey];
        let filePath      = defaultObject.location;
        let folderName    = path.dirname(filePath).split(path.sep).pop();

        // check folder
        if (!Defaults.folders.includes(folderName)){
            throw new Error('Default folders are not valid!');
        }

        // check files
        if (!fs.existsSync(filePath)) {
            log(`Default file: ${filePath} is missing. Writing defaults.`);
            writeToDefaultFile(defaultObject.data, filePath);
        } else { // check if contents are proper
            let defaultFile = fs.readFileSync(filePath, 'utf8');
            let parsedObject = YAML.safeLoad(defaultFile);
            let missingProperties = Object.keys(defaultObject.data).difference(Object.keys(parsedObject));
            if (missingProperties.length > 0) {
                for (let rootProperty of missingProperties) {
                    parsedObject[rootProperty] = defaultObject.data[rootProperty];
                }
                log(`Root property(s) missing: ${missingProperties.toString()}, writing defaults for file in ${filePath}.`);
                writeToDefaultFile(parsedObject, filePath);
            }
        }
    }
})();