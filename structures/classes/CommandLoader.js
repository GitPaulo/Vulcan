const Command = require('./Command');
const fs      = require('fs');
const path    = require('path');
const mathematics        = require('../../modules/utility/mathematics');
const fileFunctions      = require('../../modules/utility/fileFunctions');
const { _, performance } = require('perf_hooks');

let rootPath = path.dirname(require.main.filename)

class CommandLoader {
    constructor(vulcan) {
        this.vulcan      = vulcan;
        this.commandList = {};
    }

    loadCommands() {
        let commandsFolderPath = path.join(__dirname, '../../commands');
        const commands         = fileFunctions.getAllFiles(commandsFolderPath);

        for (let commandPath of commands) {
            let t       = performance.now();
            let matches = commandPath.match(/\w*.js/)
            let cmdName = matches[matches.length - 1].slice(0, -3);
            
            try {
                let fullPath     = path.join(rootPath, 'commands', commandPath);
                let CommandClass = require(fullPath);
                
                let s               = `\\`;
                let firstOccurrence = commandPath.indexOf(s)
                let lastOccurrence  = commandPath.lastIndexOf(s);
                let CommandType     = commandPath.substring(firstOccurrence+1, lastOccurrence).replace(s, '.');
                

                let command = new CommandClass(CommandType);
                let keys    = [command.name, ...command.aliases];

                for (let key of keys) {
                    this.commandList[key] = command;
                }

                t = mathematics.round(performance.now() - t, 2);
                this.vulcan.logger.info(`Loaded command ${cmdName} from ${commandPath} (took ${t}ms)`);
            } catch(err) {
                print(err.code, err.stack)
                this.vulcan.logger.error(err.shortMessage());
            }
        }

        return this.commandList;
    }
}

module.exports = CommandLoader;