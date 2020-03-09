const { configuration } = xrequire('./prerequisites/settings');

module.exports = class _User extends xrequire('discord.js').User {
    get developer () {
        return configuration.developers.contains(this.id);
    }

    get owner () {
        return configuration.hosts.contains(this.id);
    }

    get blacklisted () {
        return this.client.blacklist.get(this.id);
    }
};
