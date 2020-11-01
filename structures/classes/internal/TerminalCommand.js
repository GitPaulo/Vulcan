const Command = xrequire('./structures/classes/internal/Command');

/**
 * Subclass of Command specific for Terminal requests.
 *
 * @class TerminalCommand
 * @augments {Command}
 */
class TerminalCommand extends Command {
  constructor(vulcan, commandDefinition) {
    super(
      vulcan,
      commandDefinition.id,
      commandDefinition.category,
      commandDefinition.description,
      commandDefinition.examples,
      commandDefinition.aliases,
      commandDefinition.throttling
    );
  }
}

module.exports = TerminalCommand;
