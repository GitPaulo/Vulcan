
const fs   = xrequire('fs');
const path = xrequire('path');

module.exports = fileFunctions = {};

fileFunctions.allDirFiles = function (dir, fileTypes = '.js') {
    var filesToReturn = [];

    function walkDir (currentPath) {
        var files = fs.readdirSync(currentPath);
        for (var i in files) {
            var curFile = path.join(currentPath, files[i]);
            if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) !== -1) {
                filesToReturn.push(curFile.replace(dir, ''));
            } else if (fs.statSync(curFile).isDirectory()) {
                walkDir(curFile);
            }
        }
    }

    walkDir(dir);

    return filesToReturn;
}
