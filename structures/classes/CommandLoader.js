const Command = require("./Command");
const fs      = require("fs");
const path    = require("path");
const rutil   = require("../../scripts/randomutils");
const { _, performance } = require('perf_hooks');

let rootPath = path.dirname(require.main.filename)

class CommandLoader {
    constructor (vulcan) {
        this.vulcan      = vulcan; // at this point vulcan isnt global yet :*(
        this.commandList = []; // Using array. Might be slow, theta(n/2) + object look up time. Use map in the future? Need to map all alias to cmd object tho *thinking*.
    }

    loadCommands () {
        let commandsFolderPath = path.join(__dirname, "../../commands");
        const commands         = rutil.getAllFiles(commandsFolderPath);
        
        for (let commandPath of commands) {
            let t       = performance.now();
            let matches = commandPath.match(/\w*.js/)
            let cmdName = matches[matches.length - 1].slice(0, -3);
            
            try {
                let fullPath     = path.join(rootPath, "commands/" + commandPath);
                let CommandClass = require(fullPath);

                this.commandList.push(new CommandClass());

                t = rutil.round(performance.now() - t, 2);
                this.vulcan.logger.info(`Loaded command ${cmdName} from ${commandPath} (took ${t}ms)`);
            } catch( err ) {
                this.vulcan.logger.error(err);
            }
        }

        return this.commandList;
    }
}

module.exports = CommandLoader;