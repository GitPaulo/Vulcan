/**
 * ? Prerequisite File
 * Generates and/or validates all of the 'settings' folder.
 * Creates and exports a 'settings' object based on that data.
 */

const fs = xrequire('fs');
const path = xrequire('path');
const yaml = xrequire('js-yaml');
const logger = xrequire('./modules/logger').getInstance();

/**
 * ? Notes
 * Setting files => .yml  => (Genrated).
 * Default files => .json => (Hard Coded).
 * Extra settings properties will be ignore.
 *
 * ? Overwrite Rules
 * Property has undefined data.
 * Property is of the wrong data type.
 */

const settings = {};
const settingsPath = './settings/';
const defaultsPath = './prerequisites/_settings';

// ? Directory Generation
if (!fs.existsSync(settingsPath)) {
  fs.mkdirSync(settingsPath);

  // Log
  logger.log(`Created 'settings' directory at '${settingsPath}'`);
}

// ? File Validation
fs.readdirSync(defaultsPath).forEach(file => {
  // Constants
  const key = file.slice(0, -5);
  const defaultPath = path.join(defaultsPath, file);
  const settingPath = path.join(settingsPath, file.slice(0, -4) + 'yml');

  // Load default object
  let defaultFile = fs.readFileSync(defaultPath);
  let defaultObject = JSON.parse(defaultFile);

  // ? If no setting file
  // Create and copy all data from default file
  if (!fs.existsSync(settingPath)) {
    fs.writeFileSync(
      settingPath,
      yaml.safeDump(defaultObject) // Convert json => yaml
    );

    settings[key] = defaultObject;

    logger.log(`Copying settings defaults: '${defaultPath}' => '${settingPath}'.`);

    return;
  }

  // Load setting object
  let settingFile = fs.readFileSync(settingPath);
  let settingObject = yaml.safeLoad(settingFile);

  // ? Pre Validation
  // Compare root properties (before anything)
  let defaultRoots = Object.keys(defaultObject);
  let settingRoots = Object.keys(settingObject);

  if (defaultRoots.length > settingRoots.length) {
    defaultRoots.difference(settingRoots).forEach(prop => {
      settingObject[prop] = defaultObject[prop];

      logger.warn(`Removed extra property: '${key}.${prop}'`);
    });
  }

  if (defaultRoots.length < settingRoots.length) {
    settingRoots.difference(defaultRoots).forEach(prop => {
      delete settingObject[prop];

      logger.warn(`Removed extra property: '${key}.${prop}'`);
    });
  }

  if (defaultRoots.length !== settingRoots.length) {
    fs.writeFileSync(
      settingPath,
      yaml.safeDump(settingObject) // Convert and dump default object
    );

    logger.log(`Corrected root properties of setting file: '${file}'`);
  }

  // Build key Hierarchy
  let defaultKH = Object.keyHierarchy(defaultObject).sort();
  let settingKH = Object.keyHierarchy(settingObject).sort();

  // ? Validaiton
  // Uses property string paths: 'a.b.c'
  defaultKH.forEach((dPath, index) => {
    // Resolve string paths
    let sPath = settingKH[index];
    let dValue = Object.resolveKeyPath(defaultObject, dPath);
    let sValue = Object.resolveKeyPath(settingObject, dPath);

    // Store comparisons
    const hasCorrectDepth = dPath === sPath;
    const hasCorrectType = global.type(dValue) === global.type(sValue);

    // Move on if correct
    if (hasCorrectDepth && hasCorrectType) {
      return;
    }

    logger.warn(
      `Invalid setting property (${sPath}) detected in file '${file}'.\n` +
        `\thasCorrectDepth=${hasCorrectDepth}\n` +
        `\thasCorrectType=${hasCorrectType}`
    );

    // Correct path
    let cPath = null;

    // Search for correct position
    if (!hasCorrectDepth) {
      let match = sPath.match(dPath);

      // If no match, smthg wrong??
      if (match === null) {
        throw Error(`Settings string path didnt resolve a common root node.`);
      }

      cPath = match[0];
    } else {
      // Then dPath must be correct
      cPath = dPath;
    }

    // Resolve corrected value from 'cPath'
    let cValue = Object.resolveKeyPath(defaultObject, cPath);

    // Assign setting object the 'cPath' value of the default object
    Object.assignByKeyPath(settingObject, cPath, cValue);

    // Store setting back as yaml
    fs.writeFileSync(settingPath, yaml.safeDump(settingObject));

    // Log success
    logger.warn(
      `Corrected invalid setting property (${sPath}) with:\n` +
        `\tDefault value: ${cValue}\n` +
        `\tDefault path: ${cPath}`
    );
  });

  // For export
  settings[key] = settingObject;
});

/**
 * ? Export Structure:
 * { setting_file_name1: [Object], ..., setting_file_nameN: [Object] }
 */
module.exports = Object.safeLiteral(settings);
