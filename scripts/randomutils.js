/* Random Utility functions will be here - this is sort of a meme module */
const fs                 = require("fs");
const { _, performance } = require('perf_hooks');

exports.round = function (value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

exports.loadModules = function (path){
    const extensions = ["js", ""];
    const modules    = fs.readdirSync(path);

    let t = performance.now();
    let n = 0;

    for (let mod of modules) {
        if (mod === "index.js") continue;
        const fileData = mod.split(".");

        const ext = fileData.splice(-1, 1)[0];
        if (!extensions.includes(ext)) continue;

        const name = fileData.join("");
        exports[name] = require(`${path}/${mod}`);
        n++;
    }

    t = exports.round(performance.now()-t, 2);
    console.log(`=[ Sucessfully loaded ${n} modules at '${path}' (took ${t}ms) ]=`);

    return n;
}