/*
*   Handles the parsing for every message content.
    The results of the parsing will be stored in the message.parsed property.
!   Performance tests needed.
!   Discord commands only. (terminal manager has its own parser)
*/

const argumentsRegex = /'+([^;]*)'+|{+([^;]*)}+|`+([^;]*)`+|\[([^;]*)\]|\S+/g;
const tagsRegex      = /<((@!?\d+)|(:.+?:\d+))>/g;

module.exports = async (message, raw = message.content) => {
    const args = raw.match(argumentsRegex);
    const tags = raw.match(tagsRegex);
    const head = args[0];
    const tail = raw.substring(head.length);

    const vulcan  = message.client;
    const cmdName = head.replace(vulcan.prefixRegex, '');
    const command = vulcan.commands.get(cmdName);

    args.shift();
    const argsString = args.join(' ').trim();

    // ? Add properties
    message.command = command;
    message.parsed  = {
        raw,
        args,
        tags,
        head,
        tail,
        cmdName,
        argsString,
        mentions: message.mentions // ? For consitensy
    };
};
