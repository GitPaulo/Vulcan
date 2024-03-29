const fs = xrequire('fs');
const Command = xrequire('./structures/core/Command');

/**
 * Subclass of Command specific for discord requests.
 *
 * @class DiscordCommand
 * @augments {Command}
 */
class DiscordCommand extends Command {
  constructor(vulcan, commandDefinition) {
    super(
      vulcan,
      commandDefinition.id,
      commandDefinition.category,
      commandDefinition.description,
      commandDefinition.examples,
      commandDefinition.aliases,
      commandDefinition.throttling
    );

    // * Dealing with integers. 0 => falsey
    if (typeof vulcan.hierarchy.groups.get(commandDefinition.group) === 'undefined') {
      throw new TypeError(`Invalid group given to command '${commandDefinition.id}'!`);
    }

    if (typeof commandDefinition.embed !== 'object') {
      throw new TypeError(`Essential command 'embed' property is undefined for command '${commandDefinition.id}'!`);
    }

    //  ? Discord Command Specific Properties
    // No defaults
    this.group = commandDefinition.group;

    // Defaults
    this.embed = commandDefinition.embed || {};
    this.embed.color = this.embed.color || 0x0;
    this.embed.title = this.embed.title || `Command: ${this.id}`;
    this.userPermissions = commandDefinition.userPermissions || [];
    this.vulcanPermissions = commandDefinition.vulcanPermissions || [];
    this.embed.image = `./assets/media/embeds/commands/discord/${commandDefinition.id}.gif`;

    // Delete if not found
    if (!fs.existsSync(this.embed.image)) {
      this.embed.image = `./assets/media/icons/icon.png`;
    }

    // By default no command is disabled
    this.disabled = commandDefinition.disabled || false;

    // If unauthenticated guilds can use this command
    this.safe = commandDefinition.safe || false;
  }

  /**
   * Register a command call by an author.
   *
   * @param {UserResolvable} author The user that provoked the command call.
   */
  registerCall(author) {
    author = this.client.users.resolve(author);

    if (!author) {
      throw new Error(`Could not resolve author of call.`);
    }

    // Save last call
    this.lastCall = {
      author,
      date: Date.now()
    };

    // Save in call map
    this.callMap.set(author.id, this.lastCall.date);
  }

  /**
   * Resolves the last call made by a user.
   *
   * @param {UserResolvable} author The user that provoked the command call.
   * @returns {number} Date of the last call by author.
   */
  resolveCall(author) {
    author = this.client.users.resolve(author);

    if (!author) {
      throw new Error(`Could not resolve author.`);
    }

    return this.callMap.get(author.id);
  }

  /**
   * Wrap around resolveCall()
   *
   * @param author
   */
  hasCalled(author) {
    return Boolean(this.resolveCall(author));
  }

  /**
   * Checks if user is under throttling.
   *
   * @param {UserResolvable} author The user that provoked the command call.
   * @returns {boolean} If command is under throttling rules.
   */
  underThrottling(author) {
    return Date.now() - (this.resolveCall(author) || 0) < this.throttling;
  }

  /**
   * Wrap around underThrottling.
   *
   * @param author
   */
  isSpamming(author) {
    return this.underThrottling(author.id);
  }

  /**
   * Returns if a user has permission to run the command.
   *
   * @param {UserResolvable} author The user that provoked the command call.
   * @returns {boolean} If the user can call the command.
   */
  allowsUser(author) {
    author = this.client.users.resolve(author);

    if (!author) {
      throw new Error(`Could not resolve author.`);
    }

    const commandLevel = this.client.hierarchy.groups.get(this.group);

    // Integer 0 is falsey
    if (typeof commandLevel === 'undefined') {
      throw new Error(`Command '${this.id}' has invalid group: ${this.group}`);
    }

    const authorGroup = this.client.fetchUsergroup(author);

    if (typeof authorGroup.level === 'undefined') {
      throw new Error(`Author usergroup has no level?`);
    }

    // Authenticate: if author level >= group level
    return authorGroup.level >= commandLevel;
  }

  /**
   * Builds and returns a string representation of the command's key properties.
   *
   * @returns {string} String representaiton.
   */
  toString() {
    return super.toString() + `Access Usergroup: ${this.group}\n` + `Has embed: ${Boolean(this.embed)}\n`;
  }
}

module.exports = DiscordCommand;
