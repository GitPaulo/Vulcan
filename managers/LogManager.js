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
    var instance; // reference to the Singleton

    function loggerConstructor () { // 'private' properties
        var folderName  = 'logs';
        var rootPath    = __basedir;
        var maxFileSize = 1 * 1024 * 1024; // 1Mb
        var nFolderPath = path.join(rootPath, folderName);
        var oFolderPath = path.join(nFolderPath, 'past_logs');
        // eslint-disable-next-line no-unused-vars
        var modifiers   = [];

        var logTypes    = {
            'debug'    : chalk.blue,
            'log'      : chalk.green,
            'warning'  : chalk.yellowBright,
            'error'    : chalk.redBright,
            'terminal' : chalk.magenta
        };

        var blueprint   = [
            {
                fileName: 'logs.txt',
                logTypes: ['debug', 'log', 'warning', 'error', 'terminal']
            },
            {
                fileName: 'dump.txt',
                logTypes: ['warning', 'error']
            }
        ];

        var initFile = function (fileBlueprint) {
            fs.writeFileSync(
                path.join(nFolderPath, fileBlueprint.fileName),
                `[LOG '${fileBlueprint.fileName}' FILE CREATED (${Date.now()})]\n`
            );
        };

        var applyModifiers = function (text) {
            for (let modifier of modifiers) {
                text = chalk[modifier](text);
            }
            return text;
        };

        var blueprintsFromLogType = function (logType) {
            let blueprints = [];
            for (let fileBlueprint of blueprint) {
                if (fileBlueprint.logTypes.includes(logType)) {
                    blueprints.push(fileBlueprint);
                }
            }
            return blueprints;
        };

        var shouldLog = function () {
            return true; // currently not used (but could be in future!)
        };

        var store = function (logType, str) {
            if (!logTypes[logType])
                throw new Error(`Log type '${logType}' not valid for 'write' function!`);

            const blueprints = blueprintsFromLogType(logType);

            for (let fileBlueprint of blueprints) {
                let logFilePath = path.join(nFolderPath, fileBlueprint.fileName);
                let stats       = fs.statSync(logFilePath);
                // File too big! Copy file to old logs and then overwrite it!
                if (stats.size >= maxFileSize) {
                    let fstr = (new Date().toJSON().slice(0, 10)) + '_' + fileBlueprint.fileName;
                    let numberOfRepeats = 0;

                    let files = fs.readdirSync(oFolderPath);

                    for (var file of files) {
                        if (file.includes(fstr))
                            numberOfRepeats++;
                    }

                    let oldLogFileName = fstr + (numberOfRepeats + 1);
                    let oldLogFilePath = path.join(oFolderPath, oldLogFileName);

                    fs.copyFileSync(logFilePath, oldLogFilePath);
                    initFile(fileBlueprint);
                }

                fs.appendFileSync(logFilePath, str + '\n');
            }
        };

        var write = function (logType, ...args) {
            let colorFunc = logTypes[logType];
            if (!colorFunc)
                throw new Error(`Log type '${logType}' not valid for 'write' function!`);

            let text = applyModifiers(
                colorFunc(
                    `(${new Date().toLocaleString()})` +
                    `[${logType}] => ` +
                    [...args].join('\t')
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
                var index = modifiers.indexOf(modID);
                if (index < -1)
                    throw new Error(`Modifier '${modID}' not found in exisiting modifiers!`);
                modifiers.splice(index, 1);
            },
            addModifier: function (modID) {
                modifiers.push(modID);
                this.log(`Modifier added to logger: ${modID}`);
            },
            setModifiers: function (mods) {
                if (!Array.isArray(mods))
                    throw new Error('Expected log modifiers in array format!');
                modifiers = mods;
            },
            clearModifiers: function () {
                modifiers = [];
            },
            write: function () {
                if (shouldLog(...arguments))
                    write(this.write.caller.name, ...arguments);
            },
            plain: function (text, color = 'white') {
                let colorFunc = chalk[color];
                if (!colorFunc)
                    throw new Error(`Invalid color '${color}' for 'logger.plain'!`);

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
