const fs   = require('fs');
const path = require('path');

const consoleColors = {
    Reset      : '\x1b[0m',
    Bright     : '\x1b[1m',
    Dim        : '\x1b[2m',
    Underscore : '\x1b[4m',
    Blink      : '\x1b[5m',
    Reverse    : '\x1b[7m',
    Hidden     : '\x1b[8m',

    FgBlack   : '\x1b[30m',
    FgRed     : '\x1b[31m',
    FgGreen   : '\x1b[32m',
    FgYellow  : '\x1b[33m',
    FgBlue    : '\x1b[34m',
    FgMagenta : '\x1b[35m',
    FgCyan    : '\x1b[36m',
    FgWhite   : '\x1b[37m',

    FgLightGreen : '\x1b[92m',

    BgBlack   : '\x1b[40m',
    BgRed     : '\x1b[41m',
    BgGreen   : '\x1b[42m',
    BgYellow  : '\x1b[43m',
    BgBlue    : '\x1b[44m',
    BgMagenta : '\x1b[45m',
    BgCyan    : '\x1b[46m',
    BgWhite   : '\x1b[47m',
}

const logLevels = {
    ERROR: 'ERROR',
    WARN:  'WARNING',
    INFO:  'INFO',
    DEBUG: 'DEBUG',
};

const logLevelsNumbers = {
    [logLevels.ERROR]: 1,
    [logLevels.WARN]:  2,
    [logLevels.INFO]:  3,
    [logLevels.DEBUG]: 4,
};

const classification = {
    IMPORTANT: {
        value:    'IMPORTANT',
        filename: 'important_logs.txt',
    },
    CASUAL: {
        value:    'CASUAL',
        filename: 'casual_logs.txt',
    },
    PLEB: {
        value:    'PLEB',
        filename: 'pleb_logs.txt'
    }      
}

function initialiseLogFileFromClass(filePath, logClass){
    fs.writeFileSync(filePath, `[INIT File ${logClass.filename} of Log classification ${logClass.value}]\n`); 
}

// Note: Keep all file r/w/a methods sync to avoid deadlock. (unless you know what you are doing)
// Create folder (logs and oldlogs) and files if non existant.
const LOG_FILE_MAX_SIZE = 1*1024*1024; // 1Mb

let folder_name = 'logs';
let rootPath    = __basedir;
let folderPath  = path.join(rootPath, folder_name);

if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
}

let oldLogsFolderPath = path.join(folderPath, 'oldlogs');

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
    function constructLogObject(logLevelID, color, text) {
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
            color: color,
        };
    }

    function Logger() {
        this.debug = function () {
            if (this._shouldLog(logLevels.DEBUG))
                this._write(constructLogObject(logLevels.DEBUG, 'FgMagenta', ...arguments));
        }

        this.info = function () {
            if (this._shouldLog(logLevels.INFO))
                this._write(constructLogObject(logLevels.INFO, 'FgLightGreen', ...arguments));
        }

        this.warn = function () {
            if (this._shouldLog(logLevels.WARN))
                this._write(constructLogObject(logLevels.WARN, 'FgYellow', ...arguments));
        }

        this.error = function () {
            if (this._shouldLog(logLevels.ERROR))
                this._write(constructLogObject(logLevels.ERROR, 'FgRed', ...arguments));
        }

        this.log = function () {
            if (this._shouldLog(logLevels.DEBUG))
                this.debug.apply(this, arguments);
        }

        // bypasses everything
        this.plain = function(str="\n", logLevel=logLevels.INFO) {
            let logClass    = this.getLogClassification(logLevel);
            let logfilePath = path.join(folderPath, logClass.filename);
            console.log(str);
            fs.appendFileSync(logfilePath, str + '\n'); 
        }

        this.print = function () {
            console.log(consoleColors.FgWhite, ...arguments);
        }

        this.printc = function () {
            for (let i = 0; i < arguments.length; i = i+2)
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
                c = classification.IMPORTANT;
            }else if(logLevel.value >= lowBound && logLevel.value < highBound) {
                c = classification.CASUAL;
            }else{
                c = classification.PLEB;
            }
        
            return c;
        }

        this._shouldLog = function (logLevel) {
            return true; // for now
        }

        this._write = function (messageObject) {
            this.printc(messageObject.color, messageObject.text);
            
            let logClass    = this.getLogClassification(messageObject.logLevel);
            let logfilePath = path.join(folderPath, logClass.filename);
            
            const stats = fs.statSync(logfilePath);

            // File too big! Copy file to old logs and then overwrite it! 
            if (stats.size >= LOG_FILE_MAX_SIZE) {
                let fstr = (new Date().toJSON().slice(0,10)) + '_' + logClass.filename;
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