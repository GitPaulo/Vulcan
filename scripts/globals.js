const os   = require('os');
const path = require('path');

// Extra Globals
// * Note __dirname is NOT global, dont adopt indentifier style
global.basedir   = path.join(__dirname, '..');
global.platform  = os.platform();
global.isLinux   = global.__platform === 'linux';
global.isWindows = global.__platform === 'win32';
global.discordRL = 500; // (in ms) https://discordapp.com/developers/docs/topics/gateway#rate-limiting#
global.loaded    = false;

// ? Global Function 'xrequire'
// Absolute path version of node's 'require()'
global.xrequire = (...module) => {
    if (module[0] && module[0].startsWith('.')) {
        return require(path.resolve(...module));
    }

    return require(module[0]);
};

global.xrequire.cache   = require.cache;
global.xrequire.main    = require.main;
global.xrequire.resolve = (request, options = null) => {
    if (request.startsWith('.')) {
        return require.resolve(path.resolve(request), options);
    }

    return require.resolve(request, options);
};

global.xrequire.resolve.paths = (request) => {
    if (request.startsWith('.')) {
        return require.resolve.paths(path.resolve(request));
    }

    return require.resolve.paths(request);
};

// ? Function 'print'
// Wrapper and alias around console.log & stores a print history.
console.history    = [];
global._consoleLog = console.log;
global.print       = (console.log = function () {
    if (this.history > 100) {
        this.history = [];
    }

    // Make sure everything is proper
    this.history.push(
        [...arguments].map(
            (v) => JSON.stringify(v)
        ).join(', ')
    );

    // Call old log with regular args
    global._consoleLog.apply(console, arguments);
}).bind(console);

// ? Function: 'extendPrototype'
// Quick access Object.defineProperty();
global.extendPrototype = (prototype, propertyName, value) => {
    // Being explicit
    Object.defineProperty(prototype, propertyName, {
        enumerable  : false,
        configurable: false,
        writable    : false,
        value
    });
};

