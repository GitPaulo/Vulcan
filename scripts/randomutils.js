/* Random Utility functions will be here - this is sort of a meme module */
const fs                 = require("fs");
const path               = require("path");
const { _, performance } = require('perf_hooks');

const RUtil = {};

RUtil.round = function (value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

RUtil.loadModules = function (path) {
    const extensions = ["js", ""];
    const modules = fs.readdirSync(path);

    let t = performance.now();
    let n = 0;

    for (let mod of modules) {
        if (mod === "index.js") continue;
        const fileData = mod.split(".");

        const ext = fileData.splice(-1, 1)[0];
        if (!extensions.includes(ext)) continue;

        const name = fileData.join("");
        exports[name] = require(`${path}/${mod}`); // this is dumb, exports is local to util file :C
        n++;
    }

    t = RUtil.round(performance.now() - t, 2);
    console.log(`=[ Sucessfully loaded ${n} modules at '${path}' (took ${t}ms) ]=`);

    return n;
}

RUtil.getAllFiles = function (dir, fileTypes = ".js") {
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

module.exports = RUtil;