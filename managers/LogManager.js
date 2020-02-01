/* eslint-disable key-spacing */
/*
 * Implemented as a Singleton.
 * Note: There is no particular reason for this besides a whim of the developer.
 * I enjoyed working on it tho!
 * (Should write async because logger gets called on node exit event!)
 */
const fs         = xrequire('fs');
const path       = xrequire('path');
const chalk      = xrequire('chalk');
const LogManager = (function () {
    // Reference to the Singleton
    let instance;

    // ? Constructor
    function loggerConstructor () {
        let folderName  = 'logs';
        let rootPath    = global.basedir;
        let maxFileSize = 1 * 1024 * 1024;                      // 1Mb
        let nFolderPath = path.join(rootPath, folderName);
        let oFolderPath = path.join(nFolderPath, 'past_logs');

        // eslint-disable-next-line no-unused-vars
        let modifiers = [];

        // Useful last output
        // eslint-disable-next-line no-unused-vars
        let lastWarning = null;
        // eslint-disable-next-line no-unused-vars
        let lastError = null;

        // Type color lookup
        let logTypes    = {
            debug   : chalk.blue,
            log     : chalk.green,
            warning : chalk.yellowBright,
            error   : chalk.redBright,
            terminal: chalk.magenta
        };

        // File -> log type
        let blueprint = [
            {
                fileName: 'logs.txt',
                logTypes: ['debug', 'log', 'warning', 'error', 'terminal']
            },
            {
                fileName: 'dump.txt',
                logTypes: ['warning', 'error']
            }
        ];

        let initFile = function (fileBlueprint) {
            fs.writeFileSync(
                path.join(nFolderPath, fileBlueprint.fileName),
                `[LOG '${fileBlueprint.fileName}' FILE CREATED (${Date.now()})]\n`
            );
        };

        let applyModifiers = function (text) {
            for (let modifier of modifiers) {
                text = chalk[modifier](text);
            }

            return text;
        };

        let blueprintsFromLogType = function (logType) {
            let blueprints = [];

            for (let fileBlueprint of blueprint) {
                if (fileBlueprint.logTypes.includes(logType)) {
                    blueprints.push(fileBlueprint);
                }
            }

            return blueprints;
        };

        let shouldLog = function () {
            return true; // currently not used (but could be in future!)
        };

        let store = function (logType, str) {
            if (!logTypes[logType]) {
                throw new Error(`Log type '${logType}' not valid for 'write' function!`);
            }

            const blueprints = blueprintsFromLogType(logType);

            for (let fileBlueprint of blueprints) {
                let logFilePath = path.join(nFolderPath, fileBlueprint.fileName);
                let stats       = fs.statSync(logFilePath);

                // File too big! Copy file to old logs and then overwrite it!
                if (stats.size >= maxFileSize) {
                    let fstr            = (new Date().toJSON().slice(0, 10)) + '_' + fileBlueprint.fileName;
                    let numberOfRepeats = 0;

                    let files = fs.readdirSync(oFolderPath);

                    for (let file of files) {
                        if (file.includes(fstr)) {
                            numberOfRepeats++;
                        }
                    }

                    // Hack was added here for the old log file name extension - TODO: FIX!
                    let oldLogFileName = fstr.substring(0, fstr.length - 4) + (numberOfRepeats + 1) + '.txt';
                    let oldLogFilePath = path.join(oFolderPath, oldLogFileName);

                    fs.copyFileSync(logFilePath, oldLogFilePath);
                    initFile(fileBlueprint);
                }

                fs.appendFileSync(logFilePath, str + '\n');
            }
        };

        let write = function (logType, ...args) {
            let colorFunc = logTypes[logType];

            if (!colorFunc) {
                throw new Error(`Log type '${logType}' not valid for 'write' function!`);
            }

            // Convert all arguments to proper strings
            let buffer = [];

            for (let arg of args) {
                buffer.push((typeof arg === 'object') ? JSON.stringify(arg) : arg.toString());
            }

            let content = buffer.join(' ');
            let text    = applyModifiers(
                colorFunc(
                    `(${new Date().toLocaleString()})`
                    + `[${logType}] => `
                    + content
                )
            );

            // Useful
            if (logType === 'warning') {
                instance.lastWarning = content;
            }

            if (logType === 'error') {
                instance.lastError = content;
            }

            // Output & Store
            console.log(text);
            store(logType, text);
        };

        if (!fs.existsSync(nFolderPath)) {
            fs.mkdirSync(nFolderPath);
        }

        if (!fs.existsSync(oFolderPath)) {
            fs.mkdirSync(oFolderPath);
        }

        for (let fileBlueprint of blueprint) {
            let filePath = path.join(nFolderPath, fileBlueprint.fileName);

            if (!fs.existsSync(filePath)) {
                initFile(fileBlueprint);
            }
        }

        return { // 'public' properties
            removeModifier (modID) {
                let index = modifiers.indexOf(modID);

                if (index < -1) {
                    throw new Error(`Modifier '${modID}' not found in exisiting modifiers!`);
                }

                modifiers.splice(index, 1);
            },
            addModifier (modID) {
                modifiers.push(modID);
                this.log(`Modifier added to logger: ${modID}`);
            },
            setModifiers (mods) {
                if (!Array.isArray(mods)) {
                    throw new Error('Expected log modifiers in array format!');
                }

                modifiers = mods;
            },
            clearModifiers () {
                modifiers = [];
            },
            write: function () {  /* eslint-disable-line object-shorthand */ // if not like this it errors because of strict mode??
                if (shouldLog(...arguments)) {
                    write(this.write.caller.name, ...arguments);
                }
            },
            plain (text, color = 'white') {
                let colorFunc = chalk[color];

                if (!colorFunc) {
                    throw new Error(`Invalid color '${color}' for 'logger.plain'!`);
                }

                console.log(
                    applyModifiers(
                        colorFunc(
                            text
                        )
                    )
                );
            },
            // Helper
            debug ()    { this.write(...arguments); },
            log ()      { this.write(...arguments); },
            warning ()  { this.write(...arguments); },
            error ()    { this.write(...arguments); },
            terminal () { this.write(...arguments); },
            // Alias
            warn () { this.warning(...arguments); },
            err ()  { this.error(...arguments);   }
        };
    }

    return {
        getInstance () {
            if (!instance) {
                instance = loggerConstructor();
            }

            return instance;
        }
    };
})();

module.exports = LogManager;
