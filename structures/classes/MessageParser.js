const DISCORD_ARGS_REGULAR_EXPRESSION = /"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|```((.|\s)*?)```|\S+/g;

class MessageParser {
    constructor (vulcan, message) {
        this.vulcan  = vulcan;
        this.message = message;
    }

    parse () {
        let raw       = this.message.content;
        let matches   = raw.match(DISCORD_ARGS_REGULAR_EXPRESSION);
        let firstword = matches[0].slice(1);

        let command = this.vulcan.commands[firstword];

        if (!command)
            return; // no need to return bool message.isCommand is false by default
        
        let args      = matches.shift();
        let argString = matches.join(' ');
        
        this.message.initCommand(command, argString, args, raw, firstword);
    }
}

module.exports = MessageParser;