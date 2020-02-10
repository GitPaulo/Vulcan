const fs     = xrequire('fs');
const path   = xrequire('path');
const yaml   = xrequire('js-yaml');
const logger = xrequire('./managers/LogManager').getInstance();

/*
* Utility Functions & Constants
*/

const quickWrite = (object, filePath) => {
    const ext = path.extname(filePath);
    let  data = null;

    if (ext === '.json') {
        data = JSON.stringify(object);
    } else if (ext === '.yml' || ext === '.yaml') {
        data = yaml.safeDump(object);
    } else {
        throw new Error(`Invalid path extension (${filePath}) for defaults write!`);
    }

    fs.writeFileSync(filePath, data, (err) => {
        if (err) {
            throw err;
        }
    });
};

/*
* Write defaults!
    Read all directory descriptors and used them to validate current settings:
    - All directory descriptors must be JSON files. Their file name defines the target dir.
    - Each JSON file in this current dir defines a defaults directory.
!   - Each JSON file must be an array of objects of the form: { name:'', extension:'', data:{} }.
*/

const defaults = {};

fs.readdirSync(__dirname).forEach((descriptorFileName) => {
    const extension      = path.extname(descriptorFileName);
    const dirName        = descriptorFileName.substring(0, descriptorFileName.length - extension.length);
    const descriptorPath = path.join(__dirname, descriptorFileName);
    const descriptor     = xrequire(descriptorPath);

    // Only parse descriptors from json files
    if (extension !== '.json') {
        return;
    }

    // Descriptors must be unique
    if (defaults[dirName]) {
        throw new Error(`Defaults directory descriptor already found for: ${dirName}`);
    }

    // Create directory
    const dirPath = path.join(global.basedir, dirName);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    // Improved descriptor! Instead of array, it is now map-like
    // With extra useful properties.
    // (we do this so we save time on writing the descriptor files)
    const iDescriptor = {};

    // Finally, start validating existing files
    for (let fileData of descriptor) {
        // Now lets finish this..
        const filePath = path.join(
            dirPath,
            `${fileData.name}.${fileData.extension}`
        );

        // ? Create default file if it doesnt exist, else, validate existing.
        if (!fs.existsSync(filePath)) {
            logger.log(`Default file: ${filePath} is missing. Writing defaults!`);
            quickWrite(fileData.data, filePath);
        } else {
            const existingFile      = fs.readFileSync(filePath, 'utf8');
            const settingsObject    = yaml.safeLoad(existingFile);
            const missingProperties = Object.keys(fileData.data).filter((x) => !Object.keys(settingsObject).includes(x));

            if (missingProperties.length > 0) {
                for (let rootProperty of missingProperties) {
                    settingsObject[rootProperty] = fileData.data[rootProperty];
                }

                logger.log(`Root property(s) missing: ${missingProperties.toString()}, writing defaults for file in ${filePath}.`);
                quickWrite(settingsObject, filePath);
            }
        }

        // Prepare for exporting defaults
        iDescriptor[fileData.name]          = fileData;
        iDescriptor[fileData.name].location = filePath;
    }

    // We export the better version :)
    defaults[dirName] = iDescriptor;
});

module.exports = defaults;
