const { Client } = xrequire('discord.js');

class Command {
    constructor (
        vulcan,
        id,
        description = 'A vulcan command.',
        examples    = [`<prefix>${id} <...args>`],
        aliases     = [],
        throttling  = 500
    ) {
        if (!(vulcan instanceof Client)) {
            throw new TypeError(`Vulcan must be a valid discord client!`);
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

        this.client      = vulcan;
        this.id          = id;
        this.description = description;
        this.examples    = examples;
        this.aliases     = aliases;
        this.throttling  = throttling;
        this.callMap     = new Map();
        this.lastCall    = null;
    }

    execute () {
        throw new Error(`Essential 'execute' method for ${this.id} has not been implemented!`);
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
        return Boolean(this.resolveCall(id));
    }

    underThrottling (id) {
        return (Date.now() - (this.resolveCall(id) || 0)) < this.throttling;
    }

    toString () {
        return `=> 💻 [${this.id}]\n`
            +  `Aliases: [${this.aliases.join(', ')}]\n`
            +  `Description: "${this.description}"\n`
            +  `Examples:\n\t${this.examples.join('\n\t')}\n`
            +  `Throttling: ${this.throttling}\n`;
    }
}

module.exports = Command;
