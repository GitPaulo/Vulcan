/**
 * ? Handler file
 * Handles the loading of pre-written constant data.
 */

const fs = xrequire('fs');
const path = xrequire('path');
const yaml = xrequire('js-yaml');
const dataFolder = xrequire('./prerequisites/data');
const filePath = path.join(dataFolder, 'constants.yml');

module.exports.load = () => {
  const file = fs.readFileSync(filePath);
  const obj = yaml.safeLoad(file);

  return Object.safeLiteral(obj);
};

module.exports.store = () => {
  throw new Error(`Cannot overwrite constant data!`);
};
