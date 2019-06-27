const HashTable = xrequire('./structures/classes/external/HashTable');

class Command {
    constructor (
        id,
        aliases     = [],
        throttling  = 500
    ) {
        if (typeof id !== 'string')
            throw new TypeError(`Command must have valid String id.`);

        if (!Array.isArray(aliases))
            throw new TypeError(`Command ${id} must have an array type for aliases.`);

        if (typeof throttling !== 'number')
            throw new TypeError(`Command ${id} must have an number type for throttling.`);

        this.id         = id;
        this.aliases    = aliases;
        this.throttling = throttling;
        this.callMap    = new HashTable();
        this.lastCall   = null;
    }

    validate () {
        throw Error('This method has not been implemented!');
    }

    execute () {
        throw Error('This method has not been implemented!');
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
