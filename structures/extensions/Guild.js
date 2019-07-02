const MusicController = xrequire('./structures/classes/core/MusicController');

module.exports = class _Guild extends xrequire('discord.js').Guild {
    constructor (...args) {
        super(...args);

        // Each guild has one music controller
        this.musicController = new MusicController(this);
    }

    get botChannel () {
        return this.channels.first();
    }
};
