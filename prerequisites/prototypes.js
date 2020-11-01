/**
 * ? Prerequisite File
 * Loads all prototype extension files found in './structures/prototypes/'.
 * * Note: Files on that dir must be named following pattern: <discord.js_Class>.js.
 *
 * * Files of type: <Class>.prototype.js
 *   - Will have the module.exports methods added.
 *   - With enumerate property as false, to the prototype of <Class>.
 * * Files of type: <Class>.js
 *   - Will have the module.exports methods added.
 *   - To the <Class> object.
 */

const fs = xrequire('fs');
const path = xrequire('path');
const logger = xrequire('./modules/logger').getInstance();
const prototypesDir = path.join(global.basedir, './structures/prototypes/');

// Load all prototypes in prototypeDir
fs.readdirSync(prototypesDir).forEach(file => {
  logger.logTimeStart(`Prototypes ${file}`);

  let parts = file.split('.');
  let ext = 'js';

  if (parts.length < 2 || parts.length > 3) {
    throw new Error(`Invalid prototypes.js file name: ${file}`);
  }

  if (parts[parts.length - 1] !== ext) {
    throw new Error(`Invalid prototypes.js file extension: ${file}`);
  }

  let filePath = path.join(prototypesDir, file);

  xrequire(filePath);

  logger.logTimeEnd(`Prototypes ${file}`, `Loaded (prototypes) file '${file}'.`);
});
