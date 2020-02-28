/**
 * ? Handler file
 * Handles the loading and storage subroutines for the data representing the usergroups.
 */

const fs         = xrequire('fs');
const path       = xrequire('path');
const yaml       = xrequire('js-yaml');
const dataFolder = xrequire('./prerequisites/data');
const settings   = xrequire('./prerequisites/settings');
const filePath   = path.join(dataFolder, 'rank.yml');

module.exports.load = () => {
    const file = fs.readFileSync(filePath);
    const rank = new Map(yaml.safeLoad(file));

    return {
        rank,
        groups: new Map([
            ['root', Infinity], // ? Root is always top
            ...settings.configuration.extraGroups,
            ['host', 0], // ? Guild Owners
            ['default', 0] // ? Non assigined
        ])
    };
};

module.exports.store = (data) => {
    fs.writeFileSync(
        filePath,
        yaml.safeDump(data),
        'utf8'
    );
};
