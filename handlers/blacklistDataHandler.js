/**
 * ? Handler file
 * Handles the loading and storage subroutines for the data representing the blacklisted users.cache.
 */

const fs         = xrequire('fs');
const path       = xrequire('path');
const yaml       = xrequire('js-yaml');
const dataFolder = xrequire('./prerequisites/data');
const filePath   = path.join(dataFolder, 'blacklist.yml');

module.exports.load = () => {
    const file = fs.readFileSync(filePath);
    const obj  = yaml.safeLoad(file);

    return new Map(obj);
};

module.exports.store = (data) => {
    fs.writeFileSync(
        filePath,
        yaml.safeDump(data),
        'utf8'
    );
};

