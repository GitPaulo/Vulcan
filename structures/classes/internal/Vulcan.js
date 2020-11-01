const os = xrequire('os');
const pem = xrequire('pem');
const publicIP = xrequire('public-ip');
const Discord = xrequire('discord.js');
const settings = xrequire('./prerequisites/settings');
const logger = xrequire('./modules/logger').getInstance();
const elHandler = xrequire('./handlers/eventsLoadHandler');
const clHandler = xrequire('./handlers/commandsLoadHandler');
const cdHandler = xrequire('./handlers/constantsDataHandler');
const bdHandler = xrequire('./handlers/blacklistDataHandler');
const hdHandler = xrequire('./handlers/hierarchyDataHandler');
const adHandler = xrequire('./handlers/authorisedDataHandler');
const DatabaseManager = xrequire('./structures/classes/managers/DatabaseManager');
const TerminalManager = xrequire('./structures/classes/managers/TerminalManager');
const PresenceManager = xrequire('./structures/classes/managers/PresenceManager');

class Vulcan extends Discord.Client {
  constructor(
    options = {} // http://discord.js.org/#/docs/main/stable/typedef/ClientOptions
  ) {
    super(options);

    // ? Load essentials: Events
    elHandler(this);

    // ? Default (major) properties
    // To allow disabling of features, load chain commands are used
    this.blacklist = null;
    this.hierarchy = null;
    this.authorised = null;
    this.webFiles = null;
    this.webHooks = null;
    this.webClient = null;
    this.commands = null;
    this.terminalManager = null;
    this.databaseManager = null;
    this.presenceManager = null;

    // ? Load essentials: Data
    // Load them
    this.constants = cdHandler.load();
    this.blacklist = bdHandler.load();
    this.hierarchy = hdHandler.load();
    this.authorised = adHandler.load();
    this.commands = clHandler(this, 'discord');

    // ? Load essentials: Managers
    this.databaseManager = new DatabaseManager(this);
    this.presenceManager = new PresenceManager(this);
    this.terminalManager = new TerminalManager(this);

    // ? Load essentials: Web Servers
    this.wfPort = 442;
    this.whPort = 443;
    this.wcPort = 80;

    // Generate SSL cert & keys, load servers.
    pem.createCertificate({ days: 31, selfSigned: true }, (err, keys) => {
      if (err) {
        throw err;
      }

      // Log
      logger.debug('Generated SSL key/cert via pem module.');

      this.webFiles = xrequire('./webfiles')(this);
      this.webHooks = xrequire('./webhooks')(this, keys);
      this.webClient = xrequire('./webclient')(this, keys);

      // Attach ports
      this.webFiles.port = this.wfPort;
      this.webHooks.port = this.whPort;
      this.webClient.port = this.wcPort;

      // Emit ready event!
      this.emit('webServersReady', this);
    });

    // Vulcan is here!
    logger.plain(global.couldnt_have_forged_it_better_myself, logger.colors.random());
  }

  /**
   * Verifies token and connects to discord servers.
   *
   * @returns {Promise<string>}
   */
  connect() {
    logger.log('Attempting to connect to discord servers...');

    const token = settings.credentials.token;

    if (!token || typeof token !== 'string') {
      throw new Error(`Invalid discord token format.`);
    }

    return this.login(token);
  }

  /**
   * Helper method to update data.
   *
   * @param {*} descriptors String array identifying which data file to update.
   */
  _update(descriptors) {
    logger.logTimeStart('Update');

    // Allows update selection
    // ? Maps are turned into arrays for yaml dump
    for (let descriptor of descriptors) {
      const shouldBreak = descriptor !== 'all';

      switch (descriptor) {
        case 'all':
        case 'blacklist':
          bdHandler.store([...this.blacklist]);

          if (shouldBreak) {
            break;
          }
        case 'authorised':
          adHandler.store([...this.authorised]);

          if (shouldBreak) {
            break;
          }
        case 'hierarchy':
          hdHandler.store([...this.hierarchy]);

          if (shouldBreak) {
            break;
          }
        default:
          throw new Error(`Invalid update descriptor: ${descriptor}`);
      }
    }

    // Log time taken
    logger.logTimeEnd(`Update`, `Vulcan data has been updatde for: '${descriptors.toString()}'.`);
  }

  /**
   * Validates and adds a guild to the authorised list.
   *
   * @param {GuildResolvable} guild The guild to authorise.
   * @returns {Guild}
   */
  authoriseGuild(guild) {
    guild = this.guilds.resolve(guild);

    if (!guild) {
      throw new Error(`Could not resolve a guild.`);
    }

    // Add to auth list as entry: (id => date_added)
    this.authorised.set(guild.id, Date.now());
    this._update(['authorised']);

    // Log
    logger.log(`Authorised guild with id: ${guild.id}.`);

    return guild;
  }

  /**
   * Validates and removes a guild from the authorised list.
   *
   * @param {GuildResolvable} guild The guild to authorise.
   * @returns {Guild}
   */
  unauthoriseGuild(guild) {
    guild = this.guilds.resolve(guild);

    if (!guild) {
      throw new Error(`Could not resolve a guild.`);
    }

    if (!this.authorised.has(guild.id)) {
      throw new Error(`Guild (${guild.id}) is not in the authorisation list!`);
    }

    // Remove entry from the auth list
    this.authorised.delete(guild.id);
    this._update(['authorised']);

    // Log
    logger.log(`Unauthorised guild with id: ${guild.id}`);

    return guild;
  }

  /**
   * Validates and adds a user to the blacklist.
   *
   * @param {UserResolvable} user The to-be blacklisted user.
   * @returns {User}
   */
  blacklistUser(user) {
    user = this.users.cache.resolve(user);

    if (!user) {
      throw new Error(`Could not resolve a user.`);
    }

    // Add user to blacklist as entry: (id => date_added)
    this.blacklist.set(user.id, Date.now());
    this._update(['blacklist']);

    // Log
    logger.log(`Added user id (${user.id}) to the Vulcan blacklist.`);

    return user;
  }

  /**
   * Validates and removes a user from the blacklist.
   *
   * @param {UserResolvable} user The to-be unblacklisted user.
   * @returns {User}
   */
  unblacklistUser(user) {
    user = this.users.resolve(user);

    if (!user) {
      throw new Error(`Could not resolve a user.`);
    }

    if (!this.blacklist.has(user.id)) {
      throw new Error(`User (${user.id}) is not in the blacklist!`);
    }

    // Remove user from blacklist
    this.blacklist.delete(user.id);
    this._update(['blacklist']);

    // Log
    logger.log(`Removed user id (${user.id}) from the Vulcan blacklist.`);

    return user;
  }

  /**
   * Updates a usergroup.
   *
   * @param {UserResolvable} user The user to be updated.
   * @param {string} newGroupName The group name.
   * @returns {User} User that has been updated.
   */
  updateUsergroup(user, newGroupName) {
    user = this.users.resolve(user);

    if (user) {
      throw new Error(`Could not resolve a user.`);
    }

    const userID = user.id;
    const newGroupLevel = this.hierarchy.groups.get(newGroupName);

    if (typeof newGroupLevel === 'undefined') {
      throw new Error(`Invalid group id passed: ${newGroupName}`);
    }

    if (newGroupLevel < 1 || newGroupLevel > this.hierarchy.size) {
      throw new Error(`Invalid permission level. HIGHEST: ${1} LOWEST: ${this.hierarchy.size} GIVEN: ${newGroupLevel}`);
    }

    if (newGroupLevel === 1) {
      throw new Error(`Root users cannot be modified during runtime!`);
    }

    const currentGroup = this.fetchUsergroup(userID);

    if (currentGroup.name === newGroupName) {
      throw new Error(`Tried to assign a user a group which he already has! (${newGroupName})`);
    }

    const cachedUser = this.users.cache.get(userID);

    // Update usergroups
    this.hierarchy.rank.set(userID, newGroupName);
    this._update(['hierarchy']);

    if (!cachedUser) {
      logger.warning(`Updated usergroup of uncached user: ${userID}`);
    }

    logger.log(`User group of ${cachedUser.tag}(userID) updated from ${currentGroup.name} => ${newGroupName}.`);

    return cachedUser;
  }

  /**
   * Fetches a usergroup.
   *
   * @param {UserResolvable} user A user resolvable to fetch the usergroup from.
   * @returns {UserData} An object with information about the usergroup of a user.
   */
  fetchUsergroup(user) {
    user = this.users.resolve(user);

    if (!user) {
      throw new Error(`Could not resolve a user.`);
    }

    // Resolve data
    // ! Defaults are assigned here
    const name = this.hierarchy.rank.get(user.id) || this.hierarchy.defaultGroup[0];
    const level = this.hierarchy.groups.get(name) || this.hierarchy.defaultGroup[1];

    // User data
    return {
      name,
      level
    };
  }

  /**
   * Typically called when vulcan is about to exit.
   * Can also be called to safely clean vulcan elements.
   */
  end() {
    // Stop Vulcan CLI
    if (this.terminalManager) {
      this.terminalManager.stop();
    }

    logger.log('Terminal manager closed.');

    // Leave any voice channels
    this.guilds.cache.forEach(g => g.musicManager.destroy());

    logger.log('Destroyed all voice connections.');

    // Close Webserver
    if (this.webHooks) {
      this.webHooks.close();
    }

    // Close Fileserver
    if (this.webFiles) {
      this.webFiles.close();
    }

    logger.log('Closed all web servers.');

    // Call discordjs client to destroy
    super.destroy();

    logger.log(`Vulcan client has successfully been destroyed.`);
  }

  /**
   * Resolves external IP data.
   *
   * @returns {IpData}
   */
  async resolveIp() {
    let v4 = 'Unknown';
    let v6 = 'Unknown';
    let er = false;

    try {
      v4 = await publicIP.v4();
    } catch (e) {
      er = true;
    }

    try {
      v6 = 'Unknown'; // await publicIP.v6();
    } catch (e) {
      er = true;
    }

    if (er) {
      logger.error('Unable to fetch external IP through: `vulcan.resolveIp()`');
    }

    return {
      v4,
      v6
    };
  }

  /************************
   * Accessors & Mutators *
   ***********************/

  get statistics() {
    return {
      emojisAccessedCount: this.emojis.size,
      broadcastCount: this.voice.broadcasts.length,
      shardCount: this.shard,
      guildCount: this.guilds.cache.size,
      authGuildCount: this.authorised.size,
      blacklistCount: this.blacklist.size,
      channelCount: this.channels.cache.size,
      userCount: this.users.cache.size
    };
  }

  get performance() {
    return {
      cpuUsage: os.loadavg()[1],
      memUsage: process.memoryUsage().rss / 1024 / 1024
    };
  }
}

module.exports = Vulcan;
