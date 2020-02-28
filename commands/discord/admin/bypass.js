const bypass = module.exports;
const parser = xrequire('./handlers/messageParserHandler');
const logger = xrequire('./modules/logger').getInstance();

// TODO: IMPROVE THIS?
bypass.execute = async (message) => {
    const cmd = message.parsed.args[0];

    if (!cmd) {
        return message.client.emit(
            'commandMisused',
            message,
            `The first argument needs to be a string.`
        );
    }

    const cmdObject = message.client.commands.get(cmd);

    if (!cmdObject) {
        return message.client.emit(
            'commandMisused',
            message,
            `The first argument needs to be a valid command string identifier.`
        );
    }

    // New args
    const newArgs = message.parsed.argsString;

    // Re parse
    await parser(
        message,
        newArgs
    );

    // Check if valid command (again)
    if (!message.command) {
        throw new Error('Bypass command failed.\nProblems with parsing target bypass command.');
    }

    // Force call
    message.command.execute(message);

    // Log a bypass
    logger.warn(`Bypass was called by ${message.author.tag} on command ${cmd} with args: '${newArgs}'`);
};
