const gitBranch = xrequire('./utility/modules/gitBranch');
const logger    = xrequire('./managers/LogManager').getInstance();

module.exports = async () => {
    // Load every event call.
    // Vulcan client object should be cached and pjson could have changed.
    const pjson  = xrequire('./package.json');
    const vulcan = xrequire('./executions/bot');

    // Set statistical presence
    vulcan.presenceManager.useInformational();

    // Make things cleaner
    const { branch } = await gitBranch();
    const { v4, v6 } = await vulcan.externalIP();
    const header     = `=========================== [ Vulcan Is Ready (branch:${branch}) ] ===========================\n`;
    const footer     = `=`.repeat(header.length);

    // Tell the devs we ready! :)
    logger.plain(
        header
      + `    Vulcan has connected to discord servers sucessfuly and is now ready!            \n`
      + `       (${v4})(${v6})[WSP:${vulcan.webServer.port}][FSP:${vulcan.fileServer.port}]  \n`
      + `       => Commands: ${vulcan.commands.identifiers.length}                           \n`
      + `       => Networked users: ${vulcan.users.size}                                     \n`
      + `       => Networked channels: ${vulcan.channels.size}                               \n`
      + `       => Blacklisted users: ${vulcan.blacklist.size}                               \n`
      + `       => Authenticated guilds: ${vulcan.authorised.size}                           \n`
      + `       => Networked guilds: ${vulcan.guilds.size}                                   \n`
      + `       => Usergroup map: ${vulcan.hierarchy}                                        \n`
      + `       => Dependencies: ${Object.keys(pjson.dependencies).length}                   \n`
      + `       => Dev-Dependencies: ${Object.keys(pjson.devDependencies).length}            \n`
      + footer
    );

    // Leave if connected to voice? (Happens sometimes)
    // ! Move logic elsewhere [its stupid!]
    vulcan.guilds.forEach((guild) => {
        if (guild.voice && guild.voice.channel) {
            guild.voice.channel.join().then(() => guild.voice.channel.leave());
            logger.warn(`Vulcan was connect to voice channel: ${guild.voice.name}(${guild.voice.channel.id}) on start up.`);
        }
    });
};
