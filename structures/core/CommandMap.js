const buckets = require('buckets-js');
const Command = xrequire('./structures/core/Command');

/**
 * A map abstraction that holds any type of command.
 * Used to quickly look up commands.
 *
 * @class CommandMap
 * @augments {Map}
 */
class CommandMap extends Map {
  constructor(...args) {
    super(...args);

    // Cached (maybe transfer to getter?)
    this.identifiers = []; // Primary cmd names
    this.references = []; // All cmd names
  }

  /**
   * Returns and order of the command map keys by how similar they are to a keyword.
   *
   * @param {string} keyword The keyword for comparison.
   * @returns {Array} The ordering.
   */
  similar(keyword) {
    let similarityHeap = buckets.Heap((a, b) => a.similarity < b.similarity);

    for (let reference of this.references) {
      similarityHeap.add({
        reference,
        similarity: String.levenshtein(reference, keyword)
      });
    }

    return similarityHeap.toArray();
  }

  /**
   * Adds a command to the map.
   *
   * @param {Command} command An instance of the command class.
   */
  addCommand(command) {
    if (!(command instanceof Command)) {
      throw new TypeError('CommandMap only accepts instances of Command');
    }

    for (let alias of [command.id, ...command.aliases]) {
      if (this.get(alias)) {
        throw new Error(
          `Command alias '${alias}' of command '${command.id}' has already been declared in the command map!`
        );
      }

      this.set(alias, command);
      this.references.push(alias);
    }

    this.identifiers.push(command.id);
  }

  /**
   * Quickly retrives the command by id or alias.
   *
   * @param {string} idOrAlias String representing an id or alias of the command.
   * @returns {Command} The command, if any.
   */
  retrieveCommand(idOrAlias) {
    return this.get(idOrAlias);
  }
}

module.exports = CommandMap;
