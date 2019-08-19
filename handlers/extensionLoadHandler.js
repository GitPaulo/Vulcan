// *Note: Files on the extensions fodler must be named following pattern: <discord.js_Class>.js

const fs              = xrequire('fs');
const path            = xrequire('path');
const Discord         = xrequire('discord.js');
const { performance } = xrequire('perf_hooks');
const logger          = xrequire('./managers/LogManager').getInstance();

const extensionsDir = path.join(__basedir, './structures/extensions/');

module.exports = () => {
    const files = fs.readdirSync(extensionsDir);

    files.forEach((file) => {
        if (file === 'index.js') {
            return;
        }

        let t     = performance.now();
        let parts = file.split('.');

        if (parts.length !== 2) {
            throw new Error(`Invalid extensions file name format for: ${file}`);
        }

        if (parts[1] !== 'js') {
            throw new Error(`Invalid extensions file extenstion for: ${file}`);
        }

        let discordClassName     = parts[0];
        let discordClassFunction = Discord[discordClassName];

        if (!discordClassFunction) {
            throw new Error(`Invalid extensions file name class (not part of Discord structures) for: ${file}`);
        }

        Discord.Structures.extend(discordClassName,
            () => xrequire(path.join(extensionsDir, file))
        );

        logger.log(`Sucessfully loaded extensions file '${file}'. (took ${Math.roundDP(performance.now() - t, 2)}ms)`);
    });
};
