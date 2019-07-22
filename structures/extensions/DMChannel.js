module.exports = class _DMChannel extends xrequire('discord.js').DMChannel {
    constructor (...args) {
        super(...args);

        this._send = super.send;
        this.send  = (...args) => xrequire('./handlers/messageFormatHandler')(this, ...args);
    }
};
