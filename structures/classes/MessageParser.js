const DISCORD_ARGS_REGULAR_EXPRESSION = /'+([^;]*)'+|{+([^;]*)}+|`+([^;]*)`+|\[([^;]*)\]|\S+/g;

let MessageParserFactory = (function () {
    /**
     *  This is just a stupid attempt at string -> Data Type parsing.
     *  Bot uses two types of parsing this, COMPLEX, and SIMPLE, string spliting. 
     */
    function parseStringToDataTypes(targetText) {
        let matches      = targetText.match(DISCORD_ARGS_REGULAR_EXPRESSION);
        let parsedValues = [];

        if (matches === null)
            return parsedValues;

        for (let i = 0; i < matches.length; i++) {
            let match       = matches[i]
            parsedValues[i] = parseInt(match);

            if (!isNaN(parsedValues[i]))
                continue;

            parsedValues[i] = match === 'false' ? false : match === 'true' ? true : undefined;

            if (parsedValues[i] !== undefined)
                continue;

            try {
                parsedValues[i] = JSON.parse(match);
            } catch (e) {
                parsedValues[i] = null;
            }
            
            parsedValues[i] = match.startsWith('"') && match.endsWith('"') ? match.substring(1, match.length-1) : match
            parsedValues[i] = parsedValues[i].replaceAll('%"', '"');
        }

        return parsedValues;
    }

    function MessageParser() {
        this.parse = function (vulcan, message) {
            let raw       = message.content;
            let matches   = raw.match(DISCORD_ARGS_REGULAR_EXPRESSION);
            let firstword = matches[0].slice(1);

            let command = vulcan.commands[firstword];

            if (!command)
                return {
                    error: false,
                    message: null
                };

            let args      = matches; args.shift();
            let argString = args.join(' ').trim();
            
            if (vulcan.configuration.parsingType == global.ParsingTypes.COMPLEX) {
                args = parseStringToDataTypes(argString);
            }

            print(args, '<<< parsed values');
            print(`[MESSAGE PARSER DEBUG] => Matches: [${matches}]`, 
                `Arguments Array: [${args}](wrong types check above spew)`, 
                `Argument String: ${argString}`, `Parsed Name: ${firstword}`
            );

            message.initCommand(command, argString, args, raw, firstword);

            return {
                error: false,
                message: null
            };
        }
    }

    let instance;

    return {
        getInstance: function () {
            if (instance == null) {
                instance = new MessageParser();
                // Hide the constructor so the returned object can't be new'd...
                instance.constructor = null;
            }
            return instance;
        }
    };
})();

module.exports = MessageParserFactory;