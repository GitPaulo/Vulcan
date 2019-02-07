const assert = require("assert");

function rassert (exp, msg) {
    assert(exp, msg)
    return exp;
}

class Command {
    constructor (properties) {
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
    validateMessageArguments(message_args) {
        /*for (let metaArgData of message_args) { // not iterable
            // finish this
        }*/
        return true;
    }
}

module.exports = Command;