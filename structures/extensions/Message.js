const mfHandler = xrequire('./handlers/messageFormatHandler');

module.exports = class _Message extends xrequire('discord.js').Message {
    constructor (...args) {
        super(...args);

        this._edit = super.edit;
        // https://github.com/discordjs/discord.js/blob/master/src/structures/Message.js#L414
        this.edit  = async (content, options) => this._edit(await mfHandler(this.channel, content), options);
    }

    get direct () {
        return !this.guild;
    }

    safeReact (reaction) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.react(reaction).then(resolve).catch(reject);
            }, this.client.constants.api.rate);
        });
    }
};
