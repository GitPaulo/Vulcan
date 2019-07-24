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

        // Discord Command Specific Properties
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

        // By default no command is disabled
        this.disabled = commandDefinition.disabled || false;

        // If unauthenticated guilds can use this command
        this.safe = commandDefinition.safe || false;
    }

    addCall (author) {
        super.addCall(author.id);
    }

    isSpamming (author) {
        return this.underThrottling(author.id);
    }

    authenticate (message) {
        const commandGroupLevel = message.client.hierarchy.get(this.group);
        const authorGroup       = message.client.fetchUsergroup(message.author.id);

        if (!commandGroupLevel) {
            throw new Error(`Command '${this.id}' has invalid group: ${this.group}`);
        }

        // (smaller means more important!)
        return commandGroupLevel >= authorGroup.level;
    }

    toString () {
        return super.toString()
            + `Type: ${this.type}\n`
            + `Access Usergroup: ${this.group}\n`
            + `Has embed: ${Boolean(this.embed)}\n`;
    }
}

module.exports = DiscordCommand;
