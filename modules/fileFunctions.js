const fs = xrequire('fs');
const path = xrequire('path');

exports.allDirFiles = (dir, fileTypes = '.js') => {
  const filesToReturn = [];

  /**
   * @param currentPath
   */
  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (let fileName of files) {
      let curFile = path.join(currentPath, fileName);

      if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) !== -1) {
        filesToReturn.push(curFile.replace(dir, ''));
      } else if (fs.statSync(curFile).isDirectory()) {
        walkDir(curFile);
      }
    }
  }

  walkDir(dir);

  return filesToReturn;
};
