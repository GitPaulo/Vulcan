const fs   = require('fs');
const path = require('path');

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
const LOG_FILE_MAX_SIZE = 3000; // 10Mb

let folder_name = "logs";
let rootPath    = path.dirname(require.main.filename);
let folderPath  = path.join(rootPath, folder_name);

if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
}

let oldLogsFolderPath = path.join(folderPath, "oldlogs");

if (!fs.existsSync(oldLogsFolderPath)) {
    fs.mkdirSync(oldLogsFolderPath);
}

for (let logClassKey in classification) {
    let logClass = classification[logClassKey];
    let filePath  = path.join(folderPath, logClass.filename);

    if (!fs.existsSync(filePath)) {
        initialiseLogFileFromClass(filePath, logClass);
    }
}

// Implemented as Singleton class (or at least I tried)
let LoggerFactory = (function () {
    function constructLogObject(logLevelID, text) {
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
        };
    }

    function Logger() {
        this.debug = function () {
            if (this._shouldLog(logLevels.DEBUG))
                this._write(constructLogObject(logLevels.DEBUG, ...arguments));
        }

        this.info = function () {
            if (this._shouldLog(logLevels.INFO))
                this._write(constructLogObject(logLevels.INFO, ...arguments));
        }

        this.warn = function () {
            if (this._shouldLog(logLevels.WARN))
                this._write(constructLogObject(logLevels.WARN, ...arguments));
        }

        this.error = function () {
            if (this._shouldLog(logLevels.ERROR))
                this._write(constructLogObject(logLevels.ERROR, ...arguments));
        }

        this.log = function () {
            if (this._shouldLog(logLevels.DEBUG))
                this.debug.apply(this, arguments);
        }

        this.print = function (...args) {
            console.log(...args);
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
            this.print(messageObject.text);
            
            let logClass    = this.getLogClassification(messageObject.logLevel);
            let logfilePath = path.join(folderPath, logClass.filename);
            
            const stats = fs.statSync(logfilePath);

            // File too big! Copy file to old logs and then overwrite it! 
            if (stats.size >= LOG_FILE_MAX_SIZE) {
                let fstr = (new Date().toJSON().slice(0,10)) + "_" + logClass.filename;
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
            fs.appendFileSync(logfilePath, messageObject.text + "\n"); 
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