/*
*   Handles the loading of commands from a specified folder.
?   Called by:
        - Vulcan Client class
        - Terminal Manager
*/

const { performance } = xrequire('perf_hooks');
const path            = xrequire('path');
const fs              = xrequire('fs');
const yaml            = xrequire('js-yaml');
const fileFunctions   = xrequire('./modules/standalone/fileFunctions');
const CommandMap      = xrequire('./structures/classes/core/CommandMap');
const logger          = xrequire('./managers/LogManager').getInstance();

// Folder structure constants
const commandsFolder = './commands';
const definitionFile = 'commands.yml';

// Lookup (folder name => class name)
const dirToClass = new Map([
    ['terminal', 'TerminalCommand'], // [0] => Discord Commands
    ['discord', 'DiscordCommand']    // [1] => Terminal Commands
]);

module.exports = (vulcan, folderPath) => {
    // Check if folder exists
    if (!fs.existsSync(folderPath)) {
        throw new Error(`Folder path: ${folderPath} does not exist!`);
    }

    // Check if folder is in the correct place
    if (path.dirname(folderPath) !== commandsFolder) {
        throw new Error(`Folder path must be direct child of ${commandsFolder}.`);
    }

    // Instantiate Command Map <main_id, Class => (dirToClass[i][1])>
    const commands = new CommandMap();

    // Determine appropriate command class
    const commandDirPath   = path.join(global.basedir, folderPath);
    const commandDirName   = path.basename(commandDirPath);
    const commandClassName = dirToClass.get(commandDirName);

    if (!commandClassName) {
        throw new Error(
            `Invalid command class name: '${commandDirName}'.\n`
            + `Likely bad folder structure?`
        );
    }

    // Load appropriate command class (depends on folderPath)
    const CommandClass = xrequire(`./structures/classes/core/${commandClassName}`);

    // Load appropriate command definition file into an object.
    const commandDefinitionsPath = path.join(folderPath, definitionFile);
    const commandDefinitionsFile = fs.readFileSync(commandDefinitionsPath, 'utf8');
    const commandDefinitions     = yaml.safeLoad(commandDefinitionsFile);

    if (
        Object.entries(commandDefinitions).length === 0 // Empty file
        || commandDefinitions.constructor !== Object // Not an object
    ) {
        throw new Error(`Failed parsing '${definitionFile}' from (${commandDefinitionsPath})`);
    }

    // Gather all command files
    const commandFiles = fileFunctions.allDirFiles(commandDirPath);
    const offset       = Object.keys(commandDefinitions).length - commandFiles.length;

    if (offset !== 0) {
        logger.warn(`The number of commands defined in '${definitionFile}' does not match the coded ones.\n\tOffset: ${offset}`);
    }

    // Load and create command objects from 'commandFiles'
    for (let fileName of commandFiles) {
        // * If we fail loading one, do not exit application!
        try {
            let t         = performance.now();
            let matches   = fileName.match(/\w*.js/);
            let commandID = matches[matches.length - 1].slice(0, -3);
            let fullPath  = path.join(commandDirPath, fileName);

            // Enforce convention
            if (commandID.hasUpperCase()) {
                throw new Error(
                    `Command files must be lowercase.`
                );
            }

            // Lookup command definition for current command (safe loaded)
            // eslint-disable-next-line security/detect-object-injection
            let commandDefinition = commandDefinitions[commandID];

            if (!commandDefinition) {
                throw new Error(
                    `Command definition not found for: '${commandID}'\n`
                    + `Path: ${fullPath}`
                );
            }

            // ? Weird but works.
            Object.defineProperties(
                commandDefinition,
                {
                    category: {
                        value       : path.dirname(fullPath).split(path.sep).slice(-1).pop(), // Add category (folder name)
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

            // Actual command object
            const commandObject = new CommandClass(vulcan, commandDefinition);
            const command       = Object.assign(commandObject, fileObject);

            // * Attach command (pepega)
            fileObject.command = command;

            /*
                Call load command if defined and signal loaded status.
            *   The load function is not forced to be asynchronous.
            ?       - commandDefiniton is not a property of the command!
            ?       - command.loaded exists to prevent calls to unloaded async depedant commands. */
            if (command.load) {
                if (command.load.constructor.name !== 'AsyncFunction') {
                    command.load(commandDefinition);
                    command.loaded = true;
                } else {
                    command.load(commandDefinition).then(() => {
                        command.loaded = true;
                    }).catch((err) => {
                        logger.error(
                            `Command '${commandID}' encountered load issues.\n`
                            + err.stack
                        );
                    });
                }
            } else {
                command.loaded = true;
            }

            // * All commands must have defined an execute function.
            if (!command.execute) {
                throw new Error(
                    `Execute function is undefined in '${command.id}'\n`
                    + `Every command must implement 'command.execute'!`
                );
            }

            // ! Only if Discord Command
            // * Execute function must be asynchronous. (its called that way in message event)
            if (
                commandClassName === dirToClass.get('discord')
                && command.execute.constructor.name !== 'AsyncFunction') {
                throw new Error(
                    `The execution function 'command.execute' must be asynchronous.\n`
                    + `Add the 'async' keyword before function definition.`
                );
            }

            // Add to commands map
            commands.addCommand(command);

            // Log completion of load :)
            logger.log(
                `Loaded (${commandDefinition.category}) command '${command.id}' from ${fileName} (took ${Math.roundDP(performance.now() - t, 2)}ms)`
            );
        } catch (err) {
            logger.error(
                `[Command Loader Error]\n${err.stack}`
            );
        }
    }

    return commands;
};
