/*
* Files on this dir are of type: <DiscordJS_Class>.js
* Will have the module.exports methods added to the Discord JS class prototype.
*/

const fs              = xrequire('fs');
const path            = xrequire('path');
const Discord         = xrequire('discord.js');
const { performance } = xrequire('perf_hooks');
const logger          = xrequire('./managers/LogManager').getInstance();

module.exports = () => {
    let files = fs.readdirSync(__dirname);

    files.forEach(function (file) {
        if (file === 'index.js')
            return;

        let t     = performance.now();
        let parts = file.split('.');

        if (parts < 2 || parts > 2)
            throw Error(`Invalid extensions file name format for: ${file}`);

        if (parts[1] !== 'js')
            throw Error(`Invalid extensions file extenstion for: ${file}`);

        let discordClassName     = parts[0];
        let discordClassFunction = Discord[discordClassName];

        if (!discordClassFunction)
            throw Error(`Invalid extensions file name class (not part of Discord structures) for: ${file}`);

        let properties = xrequire(path.join(__dirname, file));

        for (let property in properties) {
            let propertyValue = properties[property];
            discordClassFunction.prototype[property] = propertyValue;
        }

        logger.info(`Sucessfully loaded extensions file '${file}'. (took ${Math.round(performance.now() - t)}ms)`);
    });
}
