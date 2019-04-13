// GLOBALS FILE! 
const RandomUtility     = require('../objects/RandomUtility');
const { _, performance} = require('perf_hooks');
const fs                = require('fs');
const path              = require('path');

global.print = function () {
    console.log('[PRINT]', ...arguments);
}

global.xrequire = (...module) => {
    if (module[0] && module[0].startsWith('.')) {
        return require(path.resolve(...module));
    }
    return require(module[0]);
};

global.xrequire.cache = require.cache;
global.xrequire.main  = require.main;

global.xrequire.resolve = (request, options = null) => {
    if (request.startsWith('.')) {
        return require.resolve(path.resolve(request), options);
    }
    return require.resolve(request, options);
};

global.xrequire.resolve.paths = request => {
    if (request.startsWith('.')) {
        return require.resolve.paths(path.resolve(request));
    }
    return require.resolve.paths(request);
};

global.requireall = function () {
    let path         = arguments[0];
    const extensions = ['js', ''];
    const modules    = fs.readdirSync(path);

    let t = performance.now();
    let n = 0;

    for (let mod of modules) {
        if (mod === 'index.js') continue;
        const fileData = mod.split('.');

        const ext = fileData.splice(-1, 1)[0];
        if (!extensions.includes(ext)) continue;

        const name = fileData.join('');
        exports[name] = xrequire(`${path}/${mod}`); // this is dumb, exports is local to util file :C
        n++;
    }

    t = RandomUtility.round(performance.now() - t, 2);
    console.log(`[REQUIREALL] => Sucessfully loaded ${n} modules at '${path}' (took ${t}ms)`);

    return exports;
}