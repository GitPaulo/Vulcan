const vulcan    = xrequire('./bot');
const pjson     = xrequire('./package.json');
const gitBranch = xrequire('./utility/modules/gitBranch');
const logger    = xrequire('./managers/LogManager').getInstance();

module.exports = async () => {
    // Set statistical presence
    vulcan.presenceManager.useInformational();

    // Make things cleaner
    const { branch } = await gitBranch();
    const { v4, v6 } = await vulcan.externalIP();
    const header     = `=========================== [ Vulcan Is Ready (branch:${branch}) ] ===========================\n`;
    const footer     = `=`.repeat(header.length);

    logger.plain(
        header
      + `    Vulcan has connected to discord servers sucessfuly and is now ready!            \n`
      + `       (${v4})(${v6})[WSP:${vulcan.webServer.port}][FSP:${vulcan.fileServer.port}]  \n`
      + `       => Commands: ${vulcan.commands.identifiers.length}                           \n`
      + `       => Networked users: ${vulcan.users.size}                                     \n`
      + `       => Networked channels: ${vulcan.channels.size}                               \n`
      + `       => Blacklisted users: ${vulcan.blacklist.size}                               \n`
      + `       => Authenticated guilds: ${vulcan.servers.size}                              \n`
      + `       => Networked guilds: ${vulcan.guilds.size}                                   \n`
      + `       => Usergroup map: ${vulcan.hierarchy}                                        \n`
      + `       => Dependencies: ${Object.keys(pjson.dependencies).length}                   \n`
      + `       => Dev-Dependencies: ${Object.keys(pjson.devDependencies).length}            \n`
      + footer
    );
};
