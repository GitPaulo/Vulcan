const { performance } = xrequire('perf_hooks');
const path            = xrequire('path');
const fs              = xrequire('fs');
const yaml            = xrequire('js-yaml');
const mathFunctions     = xrequire('./plugins/libs/mathFunctions');
const fileFunctions   = xrequire('./plugins/libs/fileFunctions');
const CommandMap      = xrequire('./structures/classes/core/CommandMap');
const logger          = xrequire('./managers/LogManager').getInstance();

module.exports = (folderPath) => {
    const commands = new CommandMap();
    const dirPath  = path.join(__basedir, folderPath);

    // Load Command Definition File
    const commandsDefinitionFile = fs.readFileSync(path.join(folderPath, 'commands.yml'), 'utf8');
    const commandsDefinition     = yaml.safeLoad(commandsDefinitionFile);

    // Load Command Class Files
    for (let fileName of fileFunctions.allDirFiles(dirPath)) {
        try {
            let t = performance.now();
            let matches = fileName.match(/\w*.js/);
            let commandID = matches[matches.length - 1].slice(0, -3);
            let fullPath = path.join(dirPath, fileName);
            let CommandClass = xrequire(fullPath);

            let commandDefinition = commandsDefinition[commandID];
            commandDefinition.type = path.dirname(fullPath).split(path.sep).slice(-1).pop(); // add type (folder name)
            commandDefinition.id = commandID;

            if (!commandDefinition)
                throw Error(`Command definition not found for \nID: ${commandID}\nPATH: ${fullPath}`);

            let command = new CommandClass(commandDefinition);
            commands.addCommand(command);

            logger.log(`Loaded (${commandDefinition.type}) command '${command.id}' from ${fileName} (took ${mathFunctions.round(performance.now() - t, 2)}ms)`);
        } catch (err) {
            logger.error(
                `Command Loader Error => ${err.message}\n` +
                `Stack: ${err.stack}`
            );
        }
    }

    return commands;
};
