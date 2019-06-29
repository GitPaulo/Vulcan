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
    let instance; // reference to the Singleton

    function loggerConstructor () { // 'private' properties
        let folderName  = 'logs';
        let rootPath    = __basedir;
        let maxFileSize = 1 * 1024 * 1024; // 1Mb
        let nFolderPath = path.join(rootPath, folderName);
        let oFolderPath = path.join(nFolderPath, 'past_logs');
        // eslint-disable-next-line no-unused-vars
        let modifiers   = [];

        let logTypes    = {
            'debug'    : chalk.blue,
            'log'      : chalk.green,
            'warning'  : chalk.yellowBright,
            'error'    : chalk.redBright,
            'terminal' : chalk.magenta
        };

        let blueprint   = [
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
                throw Error(`Log type '${logType}' not valid for 'write' function!`);
            }

            const blueprints = blueprintsFromLogType(logType);

            for (let fileBlueprint of blueprints) {
                let logFilePath = path.join(nFolderPath, fileBlueprint.fileName);
                let stats       = fs.statSync(logFilePath);
                // File too big! Copy file to old logs and then overwrite it!
                if (stats.size >= maxFileSize) {
                    let fstr = (new Date().toJSON().slice(0, 10)) + '_' + fileBlueprint.fileName;
                    let numberOfRepeats = 0;

                    let files = fs.readdirSync(oFolderPath);

                    for (let file of files) {
                        if (file.includes(fstr)) {
                            numberOfRepeats++;
                        }
                    }

                    let oldLogFileName = fstr + (numberOfRepeats + 1);
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
                throw Error(`Log type '${logType}' not valid for 'write' function!`);
            }

            // Convert all arguments to proper strings
            let buffer = [];
            for (let arg of args) {
                buffer.push((typeof arg === 'object') ? JSON.stringify(arg) : arg.toString());
            }

            let text = applyModifiers(
                colorFunc(
                    `(${new Date().toLocaleString()})` +
                    `[${logType}] => ` +
                    buffer.join(' ')
                )
            );

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
            removeModifier: function (modID) {
                let index = modifiers.indexOf(modID);
                if (index < -1) {
                    throw Error(`Modifier '${modID}' not found in exisiting modifiers!`);
                }
                modifiers.splice(index, 1);
            },
            addModifier: function (modID) {
                modifiers.push(modID);
                this.log(`Modifier added to logger: ${modID}`);
            },
            setModifiers: function (mods) {
                if (!Array.isArray(mods)) {
                    throw Error('Expected log modifiers in array format!');
                }
                modifiers = mods;
            },
            clearModifiers: function () {
                modifiers = [];
            },
            write: function () {
                if (shouldLog(...arguments)) {
                    write(this.write.caller.name, ...arguments);
                }
            },
            plain: function (text, color = 'white') {
                let colorFunc = chalk[color];
                if (!colorFunc) {
                    throw Error(`Invalid color '${color}' for 'logger.plain'!`);
                }

                console.log(
                    applyModifiers(
                        colorFunc(
                            text
                        )
                    )
                );
            },
            // alias
            debug:    function () { this.write(...arguments); },
            log:      function () { this.write(...arguments); },
            warning:  function () { this.write(...arguments); },
            error:    function () { this.write(...arguments); },
            terminal: function () { this.write(...arguments); }
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = loggerConstructor();
            }
            return instance;
        }
    };
})();

module.exports = LogManager;
