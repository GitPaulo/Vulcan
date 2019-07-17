const fs     = xrequire('fs');
const yaml   = xrequire('js-yaml');

module.exports = (defaults) => {
    const data     = defaults.settings;
    const settings = {};

    // Read and load Vulcan settings
    Object.keys(data).forEach((fileName) => {
        const file   = fs.readFileSync(data[fileName].location, 'utf8');
        const object = yaml.safeLoad(file);

        settings[fileName] = object;
    });

    return settings;
};
