/**
 * https://github.com/discordjs/discord.js/blob/master/src/structures/DMChannel.js#
 */

const mfHandler = xrequire('./handlers/messageFormatHandler');

module.exports = class _DMChannel extends xrequire('discord.js').DMChannel {
    constructor (...args) {
        super(...args);

        // ! Detour message.send
        this._send = super.send;
        this.send  = (...args) => mfHandler(this, ...args);
    }
};
