const buckets         = require('buckets-js');
const Command         = xrequire('./structures/classes/core/Command');
const stringFunctions = xrequire('./utility/modules/stringFunctions');

class CommandMap extends Map {
    constructor (...args) {
        super(...args);

        this.identifiers = [];
    }

    similar (cmdName) {
        let similarityHeap = buckets.Heap((a, b) => a.similarity < b.similarity);

        for (let identifier of this.identifiers) {
            similarityHeap.add({
                identifier,
                similarity: stringFunctions.levenshtein(identifier, cmdName),
            });
        }

        return similarityHeap.toArray();
    }

    addCommand (command) {
        if (!(command instanceof Command)) {
            throw new TypeError('CommandMap only accepts instances of Command');
        }

        // Set for id
        const allAlias = [command.id, ...command.aliases];

        for (let alias of allAlias) {
            if (this.get(alias)) {
                throw new Error(`Command alias '${alias}' of command '${command.id}' has already been declared in the command map!`);
            }

            this.set(alias, command);
        }

        this.identifiers.push(command.id);
    }

    retrieveCommand (idOrAlias) {
        return this.get(idOrAlias);
    }
}

module.exports = CommandMap;
