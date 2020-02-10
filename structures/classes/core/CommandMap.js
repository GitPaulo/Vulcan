const buckets         = require('buckets-js');
const Command         = xrequire('./structures/classes/core/Command');
const stringFunctions = xrequire('./modules/standalone/stringFunctions');

class CommandMap extends Map {
    constructor (...args) {
        super(...args);

        // Cached (maybe transfer to getter?)
        this.identifiers = []; // primary cmd names
        this.references  = []; // all cmd names
    }

    similar (keyword) {
        let similarityHeap = buckets.Heap((a, b) => a.similarity < b.similarity);

        for (let reference of this.references) {
            similarityHeap.add({
                reference,
                similarity: stringFunctions.levenshtein(reference, keyword)
            });
        }

        return similarityHeap.toArray();
    }

    addCommand (command) {
        if (!(command instanceof Command)) {
            throw new TypeError('CommandMap only accepts instances of Command');
        }

        for (let alias of [command.id, ...command.aliases]) {
            if (this.get(alias)) {
                throw new Error(`Command alias '${alias}' of command '${command.id}' has already been declared in the command map!`);
            }

            this.set(alias, command);
            this.references.push(alias);
        }

        this.identifiers.push(command.id);
    }

    retrieveCommand (idOrAlias) {
        return this.get(idOrAlias);
    }
}

module.exports = CommandMap;
