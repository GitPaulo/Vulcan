const Command = xrequire('./structures/classes/core/Command');

class DiscordCommand extends Command {
    constructor (commandDefinition) {
        super(
            commandDefinition.id,
            commandDefinition.aliases,
            commandDefinition.throttling
        );

        if (typeof commandDefinition.type !== 'string')
            throw new TypeError(`Essential command 'type' property is undefined.`);

        if (!commandDefinition.group)
            throw new TypeError(`Essential command 'group' property is undefined!`);

        if (typeof commandDefinition.embed !== 'object')
            throw new TypeError(`Essential command 'embed' property is undefined!`);

        this.type  = commandDefinition.type;
        this.group = commandDefinition.group;
        this.embed = commandDefinition.embed;
    }

    addCall (author) {
        super.addCall(author.id);
    }

    isSpamming (author) {
        return this.underThrottling(author.id);
    }

    validatePermissions (message) {
        let permissionManager = message.client.permissionManager;
        let authorPermission  = permissionManager.getUserPermissions(message.author.id);
        return (authorPermission <= this.group);
    }
}

module.exports = DiscordCommand;
