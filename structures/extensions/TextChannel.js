const mfHandler = xrequire('./handlers/messageFormatHandler');

module.exports = class _TextChannel extends xrequire('discord.js').TextChannel {
    constructor (...args) {
        super(...args);

        this._send = super.send;
        // https://github.com/discordjs/discord.js/blob/master/src/structures/interfaces/TextBasedChannel.js#L14
        this.send  = async (content, options) => this._send(await mfHandler(this, content), options);
    }
};
