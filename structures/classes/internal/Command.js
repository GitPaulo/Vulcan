const { Client } = xrequire('discord.js');

/**
 * The top level abstraction of a 'command' definition.
 * All command classes inherit from this object, including:
 *   - TerminalCommand
 *   - DiscordCommand
 * @class Command
 */
class Command {
  constructor(
    // Essential
    vulcan,
    id,
    category,
    // Optional
    description = 'A vulcan command.',
    examples = [`<prefix>${id} <...args>`],
    aliases = [],
    throttling = 500
  ) {
    if (!(vulcan instanceof Client)) {
      throw new TypeError(`Vulcan must be an instance of a valid discord client!`);
    }

    if (typeof category !== 'string') {
      throw new TypeError(`Command category missing or not a string!`);
    }

    if (typeof id !== 'string') {
      throw new TypeError(`Command must have valid string id.`);
    }

    if (typeof description !== 'string') {
      throw new TypeError(`Command ${id} must have valid string description.`);
    }

    if (!Array.isArray(examples)) {
      throw new TypeError(`Command ${id} must have valid array of examples.`);
    }

    if (!Array.isArray(aliases)) {
      throw new TypeError(`Command ${id} must have an array type for aliases.`);
    }

    if (typeof throttling !== 'number') {
      throw new TypeError(`Command ${id} must have an number type for throttling.`);
    }

    // Alias
    this.client = vulcan;
    this.vulcan = vulcan;
    this.id = id;
    this.category = category;
    this.description = description;
    this.examples = examples;
    this.aliases = aliases;
    this.throttling = throttling;
    this.callMap = new Map();
    this.lastCall = null;
  }

  /**
   * Load can be optional! Check: ./.github/CONTRIBUTING.md
   * load () {}
   */

  /**
   * Error if execute has not been implemented!
   */
  execute() {
    throw new Error(`Essential execute() method for '${this.id}' has not been implemented!`);
  }

  /**
   * Builds and returns a string representation of the command's key properties.
   * @returns {string} String representaiton.
   */
  toString() {
    return (
      `=> 💻 [${this.id}@${this.category}]\n` +
      `Aliases: [${this.aliases.join(', ')}]\n` +
      `Description: "${this.description}"\n` +
      `Examples:\n\t${this.examples.join('\n\t')}\n` +
      `Throttling: ${this.throttling}\n`
    );
  }
}

module.exports = Command;
