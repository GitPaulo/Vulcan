const fs = require('fs');

let Logfile = null;

const LogLevels = {
    ERROR: 'ERROR',
    WARN:  'WARNING',
    INFO:  'INFO',
    DEBUG: 'DEBUG',
};

const LogLevelsNumbers = {
    [LogLevels.ERROR]: 1,
    [LogLevels.WARN]:  2,
    [LogLevels.INFO]:  3,
    [LogLevels.DEBUG]: 4,
};

// Implemented as Singleton class (or at least I tried)
let LoggerFactory = (function () {
    function constructLogObject(level, text) {
        let result = '(' + new Date().toLocaleString() + ')';
        result += '[' + level + '|' + LogLevelsNumbers[level] + '] =>';
        result += text;

        return {
            level,
            result
        };
    }

    function Logger() {
        this.debug = function () {
            if (this._shouldLog(LogLevels.DEBUG))
                this._write(constructLogObject(LogLevels.DEBUG, ...arguments));
        }

        this.info = function () {
            if (this._shouldLog(LogLevels.INFO))
                this._write(constructLogObject(LogLevels.INFO, ...arguments));
        }

        this.warn = function () {
            if (this._shouldLog(LogLevels.WARN))
                this._write(constructLogObject(LogLevels.WARN, ...arguments));
        }

        this.error = function () {
            if (this._shouldLog(LogLevels.ERROR))
                this._write(constructLogObject(LogLevels.ERROR, ...arguments));
        }

        this.log = function () {
            if (this._shouldLog(LogLevels.DEBUG))
                this.debug.apply(this, arguments);
        }

        this._shouldLog = function (level) {
            return true; // for now
        }

        this._write = function (messageObject) {
            console.log(messageObject.result);
        }
    }

    let instance;

    return {
        getInstance: function () {
            if (instance == null) {
                instance = new Logger();
                // Hide the constructor so the returned object can't be new'd...
                instance.constructor = null;
            }
            return instance;
        }
    };
})();

// Use exports!
module.exports.LoggerFactory = LoggerFactory;