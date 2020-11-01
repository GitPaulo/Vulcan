/**
 * ? Prerequisite File
 * Handles the generation and validation of the 'data' folder.
 * * Note: '__data' folder contains the default application data.
 */

const fs = xrequire('fs');
const path = xrequire('path');
const logger = xrequire('./modules/logger').getInstance();

// ? Check folder
const dataPath = './data/';
const defaultsPath = './prerequisites/_data';

if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath);
  logger.log(`Created 'data' directory.`);
}

// ? Simply check existance and replace
fs.readdirSync(defaultsPath).forEach((file, _index) => {
  let filePath = path.join(dataPath, file);
  let defaultPath = path.join(defaultsPath, file);

  if (!fs.existsSync(filePath)) {
    fs.copyFileSync(defaultPath, filePath);
    logger.log(`Copied default data file '${defaultPath}' => '${filePath}'.`);
  }
});

module.exports = dataPath;
