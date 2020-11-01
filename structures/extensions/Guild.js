/**
 * https://github.com/discordjs/discord.js/blob/master/src/structures/Guild.js
 */

const MusicManager = xrequire('./structures/classes/managers/MusicManager');

module.exports = class _Guild extends xrequire('discord.js').Guild {
  constructor(...args) {
    super(...args);

    // Each guild has one music controller
    this.musicManager = new MusicManager(this);
  }

  /**
   * Resolves a 'default' channel for the guild.
   * (on join, typically, the bot channel is created)
   * @readonly
   */
  get botChannel() {
    return (
      this.findChannelsByName(this.client.constants.guild.botChannel).first() ||
      this.channels.cache.filter(channel => channel.type === 'text').first() ||
      this.systemChannel
    );
  }

  /**
   * Returns if the guild has been authorised.
   * @readonly
   */
  get authorised() {
    return this.client.authorised.get(this.id);
  }

  /**
   * Finds all channels with the parameter as name.
   * @param {string} name Channel name.
   * @param {string} type Channel type. (https://github.com/discordjs/discord.js/blob/master/src/structures/Channel.js)
   * @returns {array} Array of channels that matched.
   */
  findChannelsByName(name, type = 'text') {
    if (typeof name !== 'string') {
      throw new Error(`Channel name must be of type string.`);
    }

    if (typeof type !== 'string') {
      throw new Error(`Channel type must be a string.`);
    }

    return this.channels.cache.filter(channel => channel.name === name && type === channel.type);
  }
};
