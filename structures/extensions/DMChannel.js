/**
 * https://github.com/discordjs/discord.js/blob/master/src/structures/DMChannel.js#
 */

const mfHandler = xrequire('./handlers/messageFormatHandler');

module.exports = class _DMChannel extends xrequire('discord.js').DMChannel {
  constructor(...args) {
    super(...args);

    // ! Detour message.send
    this._send = super.send;
    // https://github.com/discordjs/discord.js/blob/master/src/structures/interfaces/TextBasedChannel.js#L14
    this.send = async (content, options) => this._send(await mfHandler(this, content), options);
  }
};
