/**
 * ? Prerequisite File
 * Initialises all extra global properties.
 */

const os = require('os');
const path = require('path');

/**
 * Variables
 */

global['couldnt_have_forged_it_better_myself'] = `
\\ \\    / /   | |                
 \\ \\  / /   _| | ___ __ _ _ __  
  \\ \\/ / | | | |/ __/ _\` | \'_ \\ 
   \\  /| |_| | | (_| (_| | | | |
    \\/  \\__,_|_|\\___\\__,_|_| |_| Created by: Paulo-kun & Carlos-sama\n`;

global.basedir = path.join(__dirname, '..');
global.platform = os.platform();
global.isLinux = global.__platform === 'linux';
global.isWindows = global.__platform === 'win32';
global.loaded = false;

/**
 * Functions
 */

global.xrequire = function (...module) {
  let uri = null;
  const loadData = {
    started: Date.now(),
    ended: false
  };

  global.xrequire.loads.set(module[0], loadData);

  if (module[0] && module[0].startsWith('.')) {
    uri = path.resolve(...module);
  } else {
    uri = module[0];
  }

  const ret = require(uri);

  return (loadData.ended = Date.now()), ret;
};

global.sxrequire = function (...module) {
  return (
    global.xrequire.loads.get(module[0]) && global.xrequire.loads.get(module[0]).ended && global.xrequire(...module)
  );
};

global.xrequire.loads = new Map();
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

global.extend = (prototype, propertyName, value) => {
  // Being explicit
  Object.defineProperty(prototype, propertyName, {
    enumerable: false,
    configurable: false,
    writable: false,
    value
  });
};

global.type = function (obj) {
  return {}.toString.call(obj).match(global.type.regex)[1].toLowerCase();
};

global.type.regex = /\s([^\]]+)/;
