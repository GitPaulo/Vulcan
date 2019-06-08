/*************************** 
 * Cross platform require  *
 *  We use this always!    *
 ***************************/

const path       = require('path');
global.__basedir = path.join(__dirname, '..', '..');

/*
 * xrequire - Same as `require` (https://nodejs.org/api/modules.html#modules_require)
 * Except that it takes absolute path as arguments, unlike `require` which takes
 * relative paths to modules.
 */
global.xrequire = (...module) => {
    if (module[0] && module[0].startsWith('.')) {
        return require(path.resolve(...module));
    }
    return require(module[0]);
};
global.xrequire.cache = require.cache;
global.xrequire.main = require.main;
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

/*********************** 
 * Normal Globals Here *
 ***********************/

const mathematics     = xrequire('./modules/utility/mathematics');
const { performance } = xrequire('perf_hooks');
const fs              = xrequire('fs');

global.print = console.log;

global.requireall = function (absolutePath) {
    const modulesPath = path.join(__basedir, absolutePath);
    const extensions = ['js', ''];
    const modules = fs.readdirSync(modulesPath);

    let t = performance.now();
    let n = 0;

    for (let mod of modules) {
        if (mod === 'index.js') continue;
        const fileData = mod.split('.');

        const ext = fileData.splice(-1, 1)[0];
        if (!extensions.includes(ext)) continue;

        const name = fileData.join('');
        exports[name] = xrequire(`${modulesPath}/${mod}`); // this is dumb, exports is local to util file :C
        n++;
    }

    t = mathematics.round(performance.now() - t, 2);
    console.log(`[REQUIREALL] => Sucessfully loaded ${n} modules at '${modulesPath}' (took ${t}ms)`);

    return exports;
}