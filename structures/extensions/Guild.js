const MusicController = xrequire('./structures/classes/core/MusicController');

module.exports = class _Guild extends xrequire('discord.js').Guild {
    constructor (...args) {
        super(...args);
        this.musicController = new MusicController(this);
    }
};
