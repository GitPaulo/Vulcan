const discordArgsRegularExpression = /'+([^;]*)'+|{+([^;]*)}+|`+([^;]*)`+|\[([^;]*)\]|\S+/g;

let parseStringToDataTypes = (targetText) => {
    let matches      = targetText.match(discordArgsRegularExpression);
    let parsedValues = [];

    if (matches === null)
        return parsedValues;

    for (let i = 0; i < matches.length; i++) {
        let match       = matches[i];
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

        parsedValues[i] = match.startsWith('"') && match.endsWith('"') ? match.substring(1, match.length - 1) : match;
        parsedValues[i] = parsedValues[i].replaceAll('%"', '"');
    }

    return parsedValues;
};

module.exports = (vulcan, message) => {
    let raw       = message.content;
    let matches   = raw.match(discordArgsRegularExpression);
    let firstword = matches[0].slice(1);

    let command = vulcan.commands[firstword];

    if (!command)
        return {
            err: new Error(`Received a command parse request for: ${command}. This command was not found in the list of commands!`),
            value: matches
        };

    let args       = matches; args.shift();
    let argsString = args.join(' ').trim();

    if (vulcan.configuration.parsingType === global.ParsingTypes.COMPLEX) {
        args = parseStringToDataTypes(argsString);
    }

    console.log(args, '<<< parsed values');
    console.log(`[MESSAGE PARSER DEBUG] => Matches: [${matches}]`,
        `Arguments Array: [${args}](wrong types check above spew)`,
        `Argument String: ${argsString}`, `Parsed Name: ${firstword}`
    );

    message.initCommand(command, argsString, args, raw, firstword);

    return {
        error: false,
        value: matches
    };
};
