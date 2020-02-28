/**
 * ? Prerequisite File
 * Adds a history to console module functions.
 */

console._log   = console.log;
console._info  = console.info;
console._warn  = console.warn;
console._error = console.error;
console._debug = console.debug;

/* Declare our console history variable. */
console.history = [];

/* Redirect all calls to the collector. */
console.log = function () {
    return console._collect('log', arguments);
};

console.info = function () {
    return console._collect('info', arguments);
};

console.warn = function () {
    return console._collect('warn', arguments);
};

console.error = function () {
    return console._collect('error', arguments);
};

console.debug = function () {
    return console._collect('debug', arguments);
};

/* Define the main log catcher. */
console._collect = function (type, args) {
    let time = new Date().toUTCString();

    if (!type) {
        type = 'log';
    }

    if (!args || args.length === 0) {
        return;
    }

    // eslint-disable-next-line prefer-spread
    console['_' + type].apply(console, args);

    let stack = false;

    // Cheat way ;)
    try {
        throw new Error('');
    } catch (error) {
        let stackParts = error.stack.split('\n');

        stack = [];

        for (let i = 0; i < stackParts.length; i++) {
            if (stackParts[i].indexOf('console-history.js') > -1
                || stackParts[i].indexOf('console-history.min.js') > -1
                || stackParts[i] === 'Error'
            ) {
                continue;
            }

            stack.push(stackParts[i].trim());
        }
    }

    // Add the log to our history.
    console.history.push(
        {
            type,
            stack,
            timestamp: time,
            arguments: args
        }
    );
};
