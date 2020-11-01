/**
 * ? Prerequisite File
 * Handles the loading of all extensions in the './structures/extensions/' folder.
 * * Note: Files on the extensions folder must be named by following the rule: <discord.js_Class>.js.
 */

const fs = xrequire('fs');
const path = xrequire('path');
const Discord = xrequire('discord.js');
const logger = xrequire('./modules/logger').getInstance();
const extensionsDir = path.join(global.basedir, './structures/extensions/');

// Load all extensions from extensionsDir
fs.readdirSync(extensionsDir).forEach(file => {
  if (file === 'index.js') {
    return;
  }

  logger.logTimeStart(`Extensions ${file}`);

  let parts = file.split('.');

  if (parts.length !== 2) {
    throw new Error(`Invalid extensions.js file name format for: ${file}`);
  }

  if (parts[1] !== 'js') {
    throw new Error(`Invalid extensions.js file extension for: ${file}`);
  }

  let discordClassName = parts[0];
  let discordClassFunction = Discord[discordClassName];

  if (!discordClassFunction) {
    throw new Error(`Invalid extensions file name class (not part of Discord structures) for: ${file}`);
  }

  Discord.Structures.extend(discordClassName, () => xrequire(path.join(extensionsDir, file)));

  logger.logTimeEnd(`Extensions ${file}`, `Loaded (extensions) file '${file}'.`);
});
