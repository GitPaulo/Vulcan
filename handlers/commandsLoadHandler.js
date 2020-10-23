/**
 * ? Handler file
 * Handles the loading of commands from a specified folder.
 * * Called by:
 *   - Vulcan (DiscordCommand)
 *   - TerminalManager (TerminalCommand)
 */

const fs              = xrequire('fs');
const path            = xrequire('path');
const yaml            = xrequire('js-yaml');
const fileFunctions   = xrequire('./modules/fileFunctions');
const logger          = xrequire('./modules/logger').getInstance();
const CommandMap      = xrequire('./structures/classes/internal/CommandMap');

// Folder structure constants
const packagesFolderName = '$packages';
const cmdsFolderName     = 'commands';
const cmdsDefinitionFile = `${cmdsFolderName}.yml`;
const cmdsFolderPath     = path.join(global.basedir, cmdsFolderName);
const cmdsPackagesPath   = path.join(cmdsFolderPath, packagesFolderName);

// Lookup (folder name => class name)
const dirToClass = new Map([
    ['terminal', 'TerminalCommand'], // [0] => Discord Commands
    ['discord', 'DiscordCommand']    // [1] => Terminal Commands
]);

module.exports = (vulcan, folder) => {
    const cmdFolderPath = path.join(cmdsFolderPath, folder);

    // Check if folder exists
    if (!fs.existsSync(cmdFolderPath)) {
        throw new Error(
            `Command folder path '${cmdFolderPath}' does not exist!`
        );
    }

    // Check if folder is in the correct place
    if (path.dirname(cmdFolderPath) !== cmdsFolderPath) {
        throw new Error(
            `Folder path '${cmdFolderPath}' must be direct child of '${cmdsFolderPath}'.`
        );
    }

    // Check if $packages folder exists
    if (!fs.existsSync(cmdsPackagesPath)) {
        throw new Error(
            `The '${packagesFolderName}' folder must exist.`
        );
    }

    // Check if folder name maps to a valid command class
    const cmdClassName = dirToClass.get(folder);

    if (!cmdClassName) {
        throw new Error(
            `Invalid command class name: '${folder}'.\n`
            + `Likely bad folder structure?`
        );
    }

    // Check if command definition file exists
    const cmdsDefinitionsPath = path.join(cmdFolderPath, cmdsDefinitionFile);

    if (!fs.existsSync(cmdsDefinitionsPath)) {
        throw new Error(
            `Could not find a command definition file! Has to be named: '${cmdsDefinitionFile}'.`
        );
    }

    // Load command definition file
    const cmdsDefinitionsFile = fs.readFileSync(cmdsDefinitionsPath, 'utf8');
    const cmdsDefinitions     = yaml.safeLoad(cmdsDefinitionsFile);

    if (
        Object.entries(cmdsDefinitions).length === 0 // Empty file
        || cmdsDefinitions.constructor !== Object // Not an object
    ) {
        throw new Error(
            `Failed parsing commands definitions file '${cmdsDefinitionFile}' from '${cmdsDefinitionsPath}'.`
        );
    }

    // Gather all cmd files
    const cmdFiles = fileFunctions.allDirFiles(cmdFolderPath);
    const offset   = Object.keys(cmdsDefinitions).length - cmdFiles.length;

    if (offset !== 0) {
        logger.warn(
            `The number of commands defined in '${cmdsDefinitionFile}' does not match the coded ones.`
            + `\n\tOffset: ${offset}`
        );
    }

    // Instantiate Command Map <main_id, Class => (dirToClass[i][1])>
    // Command Map of CommandClass!
    const commands     = new CommandMap();
    const CommandClass = xrequire(`./structures/classes/internal/${cmdClassName}`);

    // Load and create cmd objects from 'cmdFiles'
    for (let fileName of cmdFiles) {
        // * If we fail loading one, do not exit application!
        try {
            // Start time log
            logger.logTimeStart(`Command ${fileName}`);

            // Vars
            let matches  = fileName.match(/\w*.js/);
            let cmdID    = matches[matches.length - 1].slice(0, -3);
            let fullPath = path.join(cmdFolderPath, fileName);

            // Enforce convention
            if (cmdID.hasUpperCase()) {
                throw new Error(
                    `Command files must be lowercase.`
                );
            }

            // Lookup cmd definition for current cmd (safe loaded)
            // eslint-disable-next-line security/detect-object-injection
            let cmdDefinition = cmdsDefinitions[cmdID];

            if (!cmdDefinition) {
                throw new Error(
                    `Command definition not found for: '${cmdID}'\n`
                    + `Path: ${fullPath}`
                );
            }

            //  Add computed & Extra properties.
            cmdDefinition.category = path.dirname(fullPath).split(path.sep).slice(-1).pop();// Add category (folder name)
            cmdDefinition.id       = cmdID;

            // Object returned by cmd file
            // ! 'this' inside cmd files refers to this object NOT 'cmd'
            const fileObject = xrequire(fullPath);

            // Actual cmd object
            const cmdObject = new CommandClass(vulcan, cmdDefinition);
            const cmd       = Object.assign(cmdObject, fileObject);

            // * Attach command (pepega)
            fileObject.command = cmd;

            // Load packages from './packages_folder/type.id/'
            const cmdPackagePath = path.join(cmdsPackagesPath, `${folder}.${cmdID}`);
            const packages       = {};

            if (fs.existsSync(cmdPackagePath)) {
                fs.readdirSync(cmdPackagePath).forEach((file) => {
                    logger.logTimeStart(`Package ${file}`);
                    packages[file.slice(0, file.length - 3)] = xrequire(path.join(cmdPackagePath, file));

                    // Log
                    logger.logTimeEnd(
                        `Package ${file}`,
                        `Loaded (package) file '${file}' for command '${cmdID}'.`
                    );
                });
            }

            /**
             * Call load cmd if defined and signal loaded status.
             * The load function is not forced to be asynchronous.
             *   - cmdDefiniton is not a property of the cmd!
             *   - cmd.loaded exists to prevent calls to unloaded async depedant cmds.
             */
            if (cmd.load) {
                if (cmd.load.constructor.name !== 'AsyncFunction') {
                    cmd.load(cmdDefinition, packages);
                    cmd.loaded = true;
                } else {
                    cmd.load(cmdDefinition, packages).then(() => {
                        cmd.loaded = true;
                    }).catch((err) => {
                        logger.error(
                            `Command '${cmdID}' encountered load issues.\n`
                            + err.stack
                        );
                    });
                }
            } else {
                cmd.loaded = true;
            }

            // All cmds must have defined an execute function.
            if (!cmd.execute) {
                throw new Error(
                    `Execute function is undefined in '${cmd.id}'\n`
                    + `Every cmd must implement 'cmd.execute'!`
                );
            }

            // ! Only if Discord Command
            // Execute function must be asynchronous. (its called that way in message event)
            if (
                cmdClassName === dirToClass.get('discord')
                && cmd.execute.constructor.name !== 'AsyncFunction') {
                throw new Error(
                    `The execution function 'cmd.execute' must be asynchronous.\n`
                    + `Add the 'async' keyword before function definition.`
                );
            }

            // Add to cmds map
            commands.addCommand(cmd);

            // Log completion of load :)
            logger.logTimeEnd(
                `Command ${fileName}`,
                `Loaded (cmd) file for category '${cmdDefinition.category}' with id '${cmd.id}' from '${fileName}'.`
            );
        } catch (err) {
            logger.error(
                `[Command Loader Error]\n${err.stack}`
            );
        }
    }

    return commands;
};
