const argumentsRegex = /'+([^;]*)'+|{+([^;]*)}+|`+([^;]*)`+|\[([^;]*)\]|\S+/g;
const tagsRegex      = /<((@!?\d+)|(:.+?:\d+))>/g;

module.exports = async (message) => {
    const raw  = message.content;
    const args = raw.match(argumentsRegex);
    const tags = raw.match(tagsRegex);
    const head = args[0];
    const tail = raw.substring(head.length);

    const vulcan  = message.client;
    const cmdName = head.slice(1);
    const command = vulcan.commands.get(cmdName);

    args.shift();
    const argsString = args.join(' ').trim();

    return {
        command,
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
