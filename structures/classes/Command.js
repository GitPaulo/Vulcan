const assert        = require('assert');
const messageEmbeds = require('../../modules/utility/messageEmbeds');

var rassert = (exp, msg) => {
    assert(exp, msg)
    return exp;
}

class Command {
    constructor(type, properties) {
        this.type  = rassert(typeof type == 'string' && type, 'Command type property is invalid! Please check file structure & CommandLoader.') // && statement to return last true value
        this.name  = rassert(properties.name, 'Essential command name property is undefined!');
        this.group = rassert(properties.group, 'Essential command group property is undefined!');
        this.args  = rassert(properties.args, 'Essential command args property is undefined!');
        
        this.aliases       = properties.aliases || [];
        this.description   = properties.description || '[No description for this command]';
        this.examples      = properties.examples || [];
        this.throttling    = properties.throttling || 1;
        this.embed         = properties.embed;
        this.lastUserCalls = {};
    }

    validate() {
        throw new Error('This method has not been implemented!');
    }

    execute() {
        throw new Error('This method has not been implemented!');
    }

    checkTimeout(author) {
        if (!(author.id in this.lastUserCalls)) {
            this.lastUserCalls[author.id] = new Date();
            return false;
        } else {
            let currentDate = new Date();
            let timeDiff = currentDate.getTime() - this.lastUserCalls[author.id].getTime();
            if(timeDiff > this.throttling) {
                this.lastUserCalls[author.id] = currentDate;
                return false;
            }
        }
        return true;
    }

    /*
        {
            key: 'text',
            prompt: 'What text would you like the bot to say?',
            type: 'string'
        }
    */
    validateMessageArguments(message) {
        let messageArgs = message.args;
        let command     = message.command;

        let hasValidArguments    = true;
        let messageArgsIndex     = 0;
        let invalidArgsPositions = [];

        for (let metadata of command.args) { // not iterable
            let messageArg = messageArgs[messageArgsIndex];
            print(messageArg, typeof messageArg, metadata.type, typeof messageArg !== typeof metadata.type);
            if (typeof messageArg !== typeof metadata.type) {
                invalidArgsPositions.push(messageArgsIndex);
                hasValidArguments = false;
            }
        }

        return {
            isValid: hasValidArguments,
            list: invalidArgsPositions
        }
    }
}

module.exports = Command;