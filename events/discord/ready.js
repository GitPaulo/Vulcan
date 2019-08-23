const vulcan  = xrequire('./bot');
const pjson   = xrequire('./package.json');
const logger  = xrequire('./managers/LogManager').getInstance();

module.exports = () => {
    // Set Presence
    vulcan.presenceManager.useInformational();

    // Prevent ml string de-format
    const p = pjson.version;
    const u = vulcan.users.size;
    const c = vulcan.channels.size;
    const g = vulcan.guilds.size;

    logger.plain(
        `=========================== [ Vulcan Is Ready (v${p}) ] ===========================\n`
      + `    Vulcan has connected with (${u}) users, (${c}) channels and (${g}) guilds.     \n`
      + `       => Blacklisted users: ${vulcan.blacklist.size}                              \n`
      + `       => Authenticated guilds: ${vulcan.servers.size}                             \n`
      + `====================================================================================`
    );
};
