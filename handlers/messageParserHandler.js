module.exports = async (message) => {
    let raw  = message.content;
    let args = raw.match(/'+([^;]*)'+|{+([^;]*)}+|`+([^;]*)`+|\[([^;]*)\]|\S+/g);
    let tags = raw.match(/<((@!?\d+)|(:.+?:\d+))>/g);
    let head = args[0];
    let tail = raw.substring(head.length);

    let vulcan  = message.client;
    let cmdName = head.slice(1);
    let command = vulcan.commands.get(cmdName);
    let argsString = null;

    args.shift();
    argsString = args.join(' ').trim();

    return {
        command,
        raw,
        args,
        tags,
        head,
        tail,
        cmdName,
        argsString
    };
};
