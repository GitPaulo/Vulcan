const assert = require("assert");

function rassert (exp, msg) {
    assert(exp, msg)
    return exp;
}

class Command {
    constructor (type, properties) {
        this.type  = rassert(typeof type == "string" && type, "Command type property is invalid! Please check file structure & CommandLoader.") // && statement to return last true value
        this.name  = rassert(properties.name, "Essential command name property is undefined!");
        this.group = rassert(properties.group, "Essential command group property is undefined!");
        this.args  = rassert(properties.args, "Essential command args property is undefined!");
        
        this.aliases     = properties.aliases || [];
        this.description = properties.description || "[No description for this command]";
        this.examples    = properties.examples || [];
        this.throtling   = properties.throtling || { usages: -1, duration: -1 };
    }

    validate () {
        throw new Error("This method has not been implemented!");
    }

    execute () {
        throw new Error("This method has not been implemented!");
    }

    /*
        {
            key: 'text',
            prompt: 'What text would you like the bot to say?',
            type: 'string'
        }
    */
    validateMessageArguments (message) {
        let messageArgs = message.args;
        let command     = message.command;

        let problemFound     = false;
        let messageArgsIndex = 0;

        for (let metadata of command.args) { // not iterable
            let messageArg = messageArgs[messageArgsIndex];

            if (typeof messagaArg ==! metadata.type){
                problemFound = true;
                break;
            }
        }

        return problemFound;
    }
}

module.exports = Command;