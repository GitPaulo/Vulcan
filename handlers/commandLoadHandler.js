const { performance } = xrequire('perf_hooks');
const path            = xrequire('path');
const fs              = xrequire('fs');
const yaml            = xrequire('js-yaml');
const fileFunctions   = xrequire('./utility/modules/fileFunctions');
const CommandMap      = xrequire('./structures/classes/core/CommandMap');
const logger          = xrequire('./managers/LogManager').getInstance();

// Constants
const definitionFile = 'commands.yml';
const dirToClass     = {
    terminal: 'TerminalCommand',
    discord : 'DiscordCommand'
};

module.exports = (vulcan, folderPath) => {
    // Command Map <ID, DiscordCommand/TerminalCommand>
    const commands         = new CommandMap();
    const dirPath          = path.join(__basedir, folderPath);
    const dirName          = path.basename(dirPath);
    const commandClassName = dirToClass[dirName];

    if (!commandClassName) {
        throw new Error(`Invalid command class name coming from: '${dirName}'. Likely bad folder structure.`);
    }

    // Fetch necessary things
    const CommandClass           = xrequire(`./structures/classes/core/${commandClassName}`);
    const commandDefinitionsPath = path.join(folderPath, definitionFile);
    const commandDefinitionsFile = fs.readFileSync(commandDefinitionsPath, 'utf8');
    const commandDefinitions     = yaml.safeLoad(commandDefinitionsFile);

    if (Object.entries(commandDefinitions).length === 0 || commandDefinitions.constructor !== Object) {
        throw new Error(`Failed parsing '${definitionFile}' from (${commandDefinitionsPath})`);
    }

    const commandFiles = fileFunctions.allDirFiles(dirPath);
    const offset       = Object.keys(commandDefinitions).length - commandFiles.length;

    if (offset !== 0) {
        logger.warn(`The number of commands defined in '${definitionFile}' does not match the coded ones.\n\tOffset: ${offset}`);
    }

    // Load all commands under 'folderPath'
    for (let fileName of commandFiles) {
        try {
            let t         = performance.now();
            let matches   = fileName.match(/\w*.js/);
            let commandID = matches[matches.length - 1].slice(0, -3);
            let fullPath  = path.join(dirPath, fileName);

            // Fetch command definition using id & validate
            let commandDefinition = commandDefinitions[commandID];

            if (!commandDefinition) {
                throw new Error(`Command definition not found for \nID: ${commandID}\nPATH: ${fullPath}`);
            }

            Object.defineProperties(commandDefinition,
                {
                    category: {
                        value       : path.dirname(fullPath).split(path.sep).slice(-1).pop(),   // Add category (folder name)
                        writable    : false,
                        enumerable  : false,
                        configurable: false
                    },
                    id: {
                        value       : commandID,
                        writable    : false,
                        enumerable  : false,
                        configurable: false
                    }
                }
            );

            // Object returned by command file
            // ! 'this' inside cmd files refers to this object NOT 'command'
            const fileObject = xrequire(fullPath);

            // Actual command Object
            const commandObject = new CommandClass(vulcan, commandDefinition);
            const command       = Object.assign(commandObject, fileObject);

            // * Attach command (pepega)
            fileObject.command = command;

            // Call load command if defined
            // ? commandDefiniton will not become a property of command!
            if (command.load) {
                command.load(commandDefinition);
            }

            if (!command.execute) {
                throw new Error(`Execute function is undefined in '${command.id}'\nEvery command must implement 'command.execute'!`);
            }

            // Add to map
            commands.addCommand(command);

            // Log :D
            logger.log(`Loaded (${commandDefinition.category}) command '${command.id}' from ${fileName} (took ${Math.roundDP(performance.now() - t, 2)}ms)`);
        } catch (err) {
            logger.error(
                `[Command Loader Error]\n${err.stack}`
            );
        }
    }

    return commands;
};
