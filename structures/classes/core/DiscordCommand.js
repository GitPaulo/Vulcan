const fs      = xrequire('fs');
const Command = xrequire('./structures/classes/core/Command');

class DiscordCommand extends Command {
    constructor (vulcan, commandDefinition) {
        super(
            vulcan,
            commandDefinition.id,
            commandDefinition.category,
            commandDefinition.description,
            commandDefinition.examples,
            commandDefinition.aliases,
            commandDefinition.throttling
        );

        if (!vulcan.hierarchy.get(commandDefinition.group)) {
            throw new TypeError(`Invalid group given to command '${commandDefinition.id}'!`);
        }

        if (typeof commandDefinition.embed !== 'object') {
            throw new TypeError(`Essential command 'embed' property is undefined for command '${commandDefinition.id}'!`);
        }

        // ====== Discord Command Specific Properties
        // = No defaults
        this.group = commandDefinition.group;

        // = Defaults
        this.embed             = commandDefinition.embed || {};
        this.vulcanPermissions = commandDefinition.vulcanPermissions || [];
        this.userPermissions   = commandDefinition.userPermissions || [];
        this.embed.color       = this.embed.color || 0x0;
        this.embed.title       = `Command: ${this.id}`;

        // Default embed Image
        if (!this.embed.image || !fs.existsSync(this.embed.image)) {
            const expectedDefaultPath = `./assets/media/images/embeds/${commandDefinition.id}.gif`;
            const defaultPath         = `./assets/media/images/embeds/default.gif`;

            // Try looking for it, if not found use default.
            this.embed.image = fs.existsSync(expectedDefaultPath) ? expectedDefaultPath : defaultPath;
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
            + `Access Usergroup: ${this.group}\n`
            + `Has embed: ${Boolean(this.embed)}\n`;
    }
}

module.exports = DiscordCommand;
