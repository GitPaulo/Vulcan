const fs   = xrequire('fs');
const path = xrequire('path');

const consoleColors = {
    Reset: '\x1b[0m',
    Bright: '\x1b[1m',
    Dim: '\x1b[2m',
    Underscore: '\x1b[4m',
    Blink: '\x1b[5m',
    Reverse: '\x1b[7m',
    Hidden: '\x1b[8m',

    FgBlack: '\x1b[30m',
    FgRed: '\x1b[31m',
    FgGreen: '\x1b[32m',
    FgYellow: '\x1b[33m',
    FgBlue: '\x1b[34m',
    FgMagenta: '\x1b[35m',
    FgCyan: '\x1b[36m',
    FgWhite: '\x1b[37m',

    FgLightGreen: '\x1b[92m',

    BgBlack: '\x1b[40m',
    BgRed: '\x1b[41m',
    BgGreen: '\x1b[42m',
    BgYellow: '\x1b[43m',
    BgBlue: '\x1b[44m',
    BgMagenta: '\x1b[45m',
    BgCyan: '\x1b[46m',
    BgWhite: '\x1b[47m'
}

const logLevels = {
    error: 'error',
    warn: 'WARNING',
    info: 'info',
    debug: 'debug'
};

const logLevelsNumbers = {
    [logLevels.error]: 1,
    [logLevels.warn]: 2,
    [logLevels.info]: 3,
    [logLevels.debug]: 4
};

const classification = {
    important: {
        value: 'important',
        filename: 'important.logs.txt'
    },
    regular: {
        value: 'regular',
        filename: 'regular.logs.txt'
    },
    debug: {
        value: 'debug',
        filename: 'debug.logs.txt'
    }
}

function initialiseLogFileFromClass (filePath, logClass) {
    fs.writeFileSync(filePath, `[(INIT FILE) - ${logClass.filename} of Log classification ${logClass.value}]\n`);
}

// Note: Keep all file r/w/a methods sync to avoid deadlock. (unless you know what you are doing)
// Create folder (logs and past_logs) and files if non existant.
const maxSize  = 1 * 1024 * 1024; // 1Mb
let folderName = 'logs';
let rootPath   = __basedir;
let folderPath = path.join(rootPath, folderName);

if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
}

let oldLogsFolderPath = path.join(folderPath, 'past_logs');

if (!fs.existsSync(oldLogsFolderPath)) {
    fs.mkdirSync(oldLogsFolderPath);
}

for (let logClassKey in classification) {
    let logClass = classification[logClassKey];
    let filePath = path.join(folderPath, logClass.filename);

    if (!fs.existsSync(filePath)) {
        initialiseLogFileFromClass(filePath, logClass);
    }
}

// Implemented as Singleton class (or at least I tried)
let LoggerFactory = (function () {
    function constructLogObject (logLevelID, color, text) {
        let logLevelValue = logLevelsNumbers[logLevelID];
        let result = '(' + new Date().toLocaleString() + ')';
        result += '[' + logLevelID + '|' + logLevelValue + '] => ';
        result += text;

        return {
            logLevel: {
                id: logLevelID,
                value: logLevelValue
            },
            text: result,
            color: color
        };
    }

    function Logger () {
        this.debug = function () {
            if (this._shouldLog(logLevels.debug))
                this._write(constructLogObject(logLevels.debug, 'FgMagenta', ...arguments));
        }

        this.info = function () {
            if (this._shouldLog(logLevels.info))
                this._write(constructLogObject(logLevels.info, 'FgLightGreen', ...arguments));
        }

        this.warn = function () {
            if (this._shouldLog(logLevels.warn))
                this._write(constructLogObject(logLevels.warn, 'FgYellow', ...arguments));
        }

        this.error = function () {
            if (this._shouldLog(logLevels.error))
                this._write(constructLogObject(logLevels.error, 'FgRed', ...arguments));
        }

        this.log = function () {
            if (this._shouldLog(logLevels.debug))
                this.debug.apply(this, arguments);
        }

        // bypasses everything
        this.plain = function (str = '\n', logLevel = logLevels.info) {
            let logClass    = this.getLogClassification(logLevel);
            let logfilePath = path.join(folderPath, logClass.filename);
            this.print(str);
            fs.appendFileSync(logfilePath, str + '\n');
        }

        this.print = function () {
            console.log(consoleColors.FgWhite, ...arguments);
        }

        this.printc = function () {
            for (let i = 0; i < arguments.length; i = i + 2)
                arguments[i] = consoleColors[arguments[i]];

            let args = Array.prototype.slice.call(arguments);
            console.log(args.join(''));
        }

        this.getLogClassification = function (logLevel) {
            let n   = Object.keys(logLevelsNumbers).length;
            let mod = n % 3;
            let div = n / 3;

            let lowBound    = Math.floor(div + (mod > 0 ? 1 : 0));
            let mediumBound = lowBound + Math.floor(div);
            let highBound   = mediumBound + Math.floor(div + (mod > 1 ? 1 : 0));

            let c;
            if (logLevel.value < lowBound) {
                c = classification.important;
            } else if (logLevel.value >= lowBound && logLevel.value < highBound) {
                c = classification.regular;
            } else {
                c = classification.debug;
            }

            return c;
        }

        // eslint-disable-next-line no-unused-vars
        this._shouldLog = function (logLevel) {
            return true; // for now
        }

        this._write = function (messageObject) {
            this.printc(messageObject.color, messageObject.text);

            let logClass    = this.getLogClassification(messageObject.logLevel);
            let logfilePath = path.join(folderPath, logClass.filename);

            const stats = fs.statSync(logfilePath);

            // File too big! Copy file to old logs and then overwrite it!
            if (stats.size >= maxSize) {
                let fstr = (new Date().toJSON().slice(0, 10)) + '_' + logClass.filename;
                let numberOfRepeats = 0;

                let files = fs.readdirSync(oldLogsFolderPath);

                for (var file of files) {
                    if (file.includes(fstr))
                        numberOfRepeats++;
                }

                let oldLogFileName = fstr + (numberOfRepeats + 1);
                let oldLogFilePath = path.join(oldLogsFolderPath, oldLogFileName);

                fs.copyFileSync(logfilePath, oldLogFilePath);

                initialiseLogFileFromClass(logfilePath, logClass);
            }

            // maybe use async? (Risks confusing log order - but benefits to bot performance?)
            // alternative is queue logs and then write a batch? Needs testing.
            fs.appendFileSync(logfilePath, messageObject.text + '\n');
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
module.exports = LoggerFactory;
