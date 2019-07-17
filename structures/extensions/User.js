module.exports = class _User extends xrequire('discord.js').User {
    get developer () {
        return this.client.configuration.devsID.contains(this.id);
    }

    get owner () {
        return this.client.configuration.ownersID.contains(this.id);
    }

    get blacklisted () {
        return this.client.blacklist.get(this.id);
    }
};
