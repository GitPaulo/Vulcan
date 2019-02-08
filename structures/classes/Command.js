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
        this.throtling   = properties.throtling || 1;
        this.lastUserCalls = {}
    }

    validate () {
        throw new Error("This method has not been implemented!");
    }

    checkTimeout(author) {
        if(!author in this.lastUserCalls) {
            this.lastUserCalls[author] = new Date();
            return true;
        } else {
            currentDate = new Date();
            timeDiff = currentDate.getTime() - this.lastUserCalls[author].getTime()
            if(timeDiff < this.throtling) {
                this.lastUserCalls[author] = currentDate;
                return true;
            } else {
                return false;
            }
        }

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

        let hasValidArguments = true;
        let messageArgsIndex  = 0;

        for (let metadata of command.args) { // not iterable
            let messageArg = messageArgs[messageArgsIndex];
            console.log(messageArg, typeof messageArg, metadata.type, typeof messageArg != typeof metadata.type);
            if (typeof messageArg != typeof metadata.type){
                hasValidArguments = false;
                break;
            }
        }

        return hasValidArguments;
    }
}

module.exports = Command;