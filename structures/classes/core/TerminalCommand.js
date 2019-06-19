const Command = xrequire('./structures/classes/core/Command');

class TerminalCommand extends Command {
    constructor (commandDefinition) {
        super(
            commandDefinition.id,
            commandDefinition.aliases,
            commandDefinition.throttling
        );
    }
}

module.exports = TerminalCommand;
