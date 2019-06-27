const fs     = xrequire('fs');
const path   = xrequire('path');
const yaml   = xrequire('js-yaml');
const logger = xrequire('./managers/LogManager').getInstance();

let log = (message) => {
    logger.log(`[VulcanDefaults] => ${message}`);
};

let writeToDefaultFile = (object, path) => {
    let data = yaml.safeDump(object);

    fs.writeFileSync(path, data, function (err) {
        if (err) throw err;
    });
};

global.VulcanDefaults = {
    folders: [
            'settings',
            'data'
        ],
    files: {
        'configuration': {
            location: path.join(__basedir, 'settings', 'config.yml'),
            data: {
                prefixes: [
                    '!',
                    '>'
                ],
                devsID: [ // Please don't change this
                    '166176374036365312',
                    '207606117159796737'
                ]
            }
        },
        'credentials': {
            location: path.join(__basedir, 'settings', 'credentials.yml'),
            data: {
                token: `PLEASE ADD YOUR DISCORD TOKEN HERE`,
                githubOAuth: `PLEASE ADD YOUR GITHUB O-AUTH TOKEN HERE`,
                dbCredentials: {
                    username: 'ur_mom_gay',
                    password: 'no_u'
                }
            }
        },
        // Commands will have 3 groups. Group 1 only roots can use. Group 2 only admin and above can use. Group 3 everyone can use.
        // Everyone not in this file is a pleb by default.
        'permissions': {
            location: path.join(__basedir, 'settings', 'permissions.yml'),
            data: {
                roots: [], // configuration.devIDs are roots by default
                admins: []
            }
        }
    }
};

// Check for missing settings files and root properties & write VulcanDefaults.
(() => {
    for (let folderName of global.VulcanDefaults.folders) {
        let folderPath = path.join(__basedir, folderName);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
    }

    for (let fileKey in global.VulcanDefaults.files) {
        let defaultObject = global.VulcanDefaults.files[fileKey];
        let filePath      = defaultObject.location;
        let folderName    = path.dirname(filePath).split(path.sep).pop();

        // Check folder
        if (!VulcanDefaults.folders.includes(folderName)) {
            throw Error('Default folders are not valid!');
        }

        // Check files
        if (!fs.existsSync(filePath)) {
            log(`Default file: ${filePath} is missing. Writing VulcanDefaults.`);
            writeToDefaultFile(defaultObject.data, filePath);
        } else { // check if contents are proper
            let defaultFile       = fs.readFileSync(filePath, 'utf8');
            let parsedObject      = yaml.safeLoad(defaultFile);
            let missingProperties = Object.keys(defaultObject.data).filter(x => !Object.keys(parsedObject).includes(x));

            if (missingProperties.length > 0) {
                for (let rootProperty of missingProperties) {
                    parsedObject[rootProperty] = defaultObject.data[rootProperty];
                }

                log(`Root property(s) missing: ${missingProperties.toString()}, writing VulcanDefaults for file in ${filePath}.`);
                writeToDefaultFile(parsedObject, filePath);
            }
        }
    }
})();
