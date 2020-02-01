module.exports = class _Message extends xrequire('discord.js').Message {
    get direct () {
        return !this.guild;
    }
};
