const fs      = xrequire('fs');
const Command = xrequire('./structures/classes/core/Command');

class DiscordCommand extends Command {
    constructor (commandDefinition) {
        super(
            commandDefinition.id,
            commandDefinition.description,
            commandDefinition.examples,
            commandDefinition.aliases,
            commandDefinition.throttling
        );

        if (typeof commandDefinition.type !== 'string') {
            throw new TypeError(`Essential command 'type' property is undefined.`);
        }

        if (!commandDefinition.group) {
            throw new TypeError(`Essential command 'group' property is undefined!`);
        }

        if (typeof commandDefinition.embed !== 'object') {
            throw new TypeError(`Essential command 'embed' property is undefined!`);
        }

        this.type  = commandDefinition.type;
        this.group = commandDefinition.group;
        this.embed = commandDefinition.embed || {};

        // Default embed color
        this.embed.color = this.embed.color || 0x00000;

        // Default embed color
        this.embed.title = `Command: ${this.id}`;

        // Default embed Image
        if (!this.embed.image || !fs.existsSync(this.embed.image)) {
            this.embed.image = './assets/media/images/embeds/Default.gif';
        }
    }

    addCall (author) {
        super.addCall(author.id);
    }

    isSpamming (author) {
        return this.underThrottling(author.id);
    }

    validatePermissions (message) {
        const permissionManager = message.client.permissionManager;

        return (permissionManager.getUserPermissions(message.author.id) <= this.group);
    }
}

module.exports = DiscordCommand;
