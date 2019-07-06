const HashTable = xrequire('./structures/classes/external/HashTable');

class Command {
    constructor (
        id,
        description = 'A vulcan command.',
        examples    = [`<prefix>${id} <...args>`],
        aliases     = [],
        throttling  = 500
    ) {
        if (typeof id !== 'string') {
            throw TypeError(`Command must have valid string id.`);
        }

        if (typeof description !== 'string') {
            throw TypeError(`Command ${id} must have valid string description.`);
        }

        if (!Array.isArray(examples)) {
            throw TypeError(`Command ${id} must have valid array of examples.`);
        }

        if (!Array.isArray(aliases)) {
            throw TypeError(`Command ${id} must have an array type for aliases.`);
        }

        if (typeof throttling !== 'number') {
            throw TypeError(`Command ${id} must have an number type for throttling.`);
        }

        this.id          = id;
        this.description = description;
        this.examples    = examples;
        this.aliases     = aliases;
        this.throttling  = throttling;
        this.callMap     = new HashTable();
        this.lastCall    = null;
    }

    execute () {
        throw Error(`Essential 'execute' method for ${this.id} has not been implemented!`);
    }

    addCall (id) {
        this.lastCall = {
            id,
            date: Date.now()
        };
        this.callMap.set(
            this.lastCall.id,
            this.lastCall.date
        );
    }

    resolveCall (id) {
        return this.callMap.get(id);
    }

    hasCalled (id) {
        return Boolean(this.getRecentCall());
    }

    underThrottling (id) {
        return (Date.now() - (this.resolveCall(id) || 0)) < this.throttling;
    }
}

module.exports = Command;
