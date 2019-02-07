const DISCORD_ARGS_REGULAR_EXPRESSION = /"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|```((.|\s)*?)```|\S+/g;

class MessageParser {
    constructor (vulcan, message) {
        this.vulcan  = vulcan;
        this.message = message;
    }

    stringToDataType (str) {

    }

    parse () {
        let raw       = this.message.content;
        let matches   = raw.match(DISCORD_ARGS_REGULAR_EXPRESSION);
        let firstword = matches[0].slice(1);

        let command = this.vulcan.commands[firstword];

        if (!command)
            return { error = false, message = null };

        let args = matches;
        args.shift();
      
        let argString = args.join(' ');
        
        console.log(`[MESSAGE PARSER DEBUG] => Matches: [${matches}]`, `Arguments Array: [${args}]`, `Argument String: ${argString}`, `Parsed Name: ${firstword}`);

        this.message.initCommand(command, argString, args, raw, firstword);

        return { error = false, message = null }; 
    }
}

module.exports = MessageParser;