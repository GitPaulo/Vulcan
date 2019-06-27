const Command = xrequire('./structures/classes/core/Command');

class CommandMap extends Map {
    addCommand (command) {
        if (!(command instanceof Command))
            throw new TypeError('CommandMap only accepts instances of Command');

        // set for id
        let allAlias = [command.id, ...command.aliases];

        for (let alias of allAlias) {
            if (this.get(alias))
                throw Error(`Command alias '${alias}' of command '${command.id}' has already been declared in the command map!`);
            this.set(alias, command);
        }
    }

    retrieveCommand (idOrAlias) {
        return this.get(idOrAlias);
    }
}

module.exports = CommandMap;
