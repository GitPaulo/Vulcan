/**
 * ? Ready (Discord Event)
 * Emitted when the client becomes ready to start working.
 * https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-ready
 */

const gitBranch = xrequire('./modules/gitBranch');
const logger    = xrequire('./modules/logger').getInstance();

module.exports = async () => {
    // Load every event call.
    // Vulcan client object should be cached and pjson could have changed.
    const pjson  = xrequire('./package.json');
    const vulcan = xrequire('./index.js');

    // Destructor client object
    const {
        commands, users, channels, blacklist,
        authorised, guilds, hierarchy
    } = vulcan;

    // Set statistical presence
    vulcan.presenceManager.useInformational();

    // Make things cleaner
    const { branch } = await gitBranch();
    const { v4, v6 } = await vulcan.resolveIp();
    const header     = `=========================== [ Vulcan Is Ready (branch:${branch}) ] ===========================\n`;
    const footer     = `=`.repeat(header.length);

    // Tell the devs we ready! :)
    logger.plain(
        header
      + `    Vulcan has connected to discord servers sucessfully and is now ready!  \n`
      + `       [ipv4:${v4}][ipv6:${v6}][WFP:${vulcan.wfPort}][WHP:${vulcan.whPort}]\n`
      + `       => Commands: ${commands.identifiers.length}                         \n`
      + `       => Networked users: ${users.cache.size}                             \n`
      + `       => Networked channels: ${channels.cache.size}                       \n`
      + `       => Blacklisted users: ${blacklist.size}                             \n`
      + `       => Authenticated guilds: ${authorised.size}                         \n`
      + `       => Networked guilds: ${guilds.cache.size}                           \n`
      + `       => Usergroups: ${Array.from(hierarchy.groups.keys()).join(', ')}    \n`
      + `       => Dependencies: ${Object.keys(pjson.dependencies).length}          \n`
      + `       => Dev-Dependencies: ${Object.keys(pjson.devDependencies).length}   \n`
      + footer
    );

    // Leave if connected to voice? (Happens sometimes)
    guilds.cache.forEach((guild) => {
        if (guild.voice && guild.voice.channel) {
            guild.voice.channel.join().then(() => guild.voice.channel.leave()).catch(logger.warn);
            logger.warn(
                `Vulcan was connect to voice channel: '${guild.voice.channel.name}' (${guild.voice.channel.id}) on start up.`
            );
        }
    });

    // Start terminal manager
    vulcan.terminalManager.start();

    // Load time
    vulcan.loadTime = process.uptime();
};
