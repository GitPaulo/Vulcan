const Command = xrequire('./structures/classes/core/Command');

class TerminalCommand extends Command {
    constructor (vulcan, commandDefinition) {
        super(
            vulcan,
            commandDefinition.id,
            commandDefinition.description,
            commandDefinition.examples,
            commandDefinition.aliases,
            commandDefinition.throttling
        );
    }
}

module.exports = TerminalCommand;
