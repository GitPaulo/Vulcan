/* Random Utility functions will be here - this is sort of a meme module */
const fs   = require("fs");
const path = require("path");

var RandomUtility = {};

RandomUtility.round = function (value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

RandomUtility.getAllFiles = function (dir, fileTypes = ".js") {
    var filesToReturn = [];

    function walkDir(currentPath) {
        var files = fs.readdirSync(currentPath);
        for (var i in files) {
            var curFile = path.join(currentPath, files[i]);
            if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) != -1) {
                filesToReturn.push(curFile.replace(dir, ''));
            } else if (fs.statSync(curFile).isDirectory()) {
                walkDir(curFile);
            }
        }
    };

    walkDir(dir);
    return filesToReturn;
}

module.exports = RandomUtility;