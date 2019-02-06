const DISCORD_ARGS_REGULAR_EXPRESSION = /"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|```((.|\s)*?)```|\S+/g;

class MessageParser {
    constructor (message) {
        this.message = message;
    }

    parse () {
        
        message.initCommand(command, argString, args, raw, parsedName);
    }
}

module.exports = MessageParser;