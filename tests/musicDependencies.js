const Discord = xrequire('discord.js');
const pjson   = xrequire('./package.json');
const ytdl    = xrequire('ytdl-core-discord');
const Vulcan  = xrequire('./structures/classes/core/Vulcan');
const logger  = xrequire('./managers/LogManager').getInstance();

// Disable unwanted load options
[
    'loadDatabase',
    'loadCommands',
    'loadEvents',
    'loadPermissions',
    'loadMusicManager',
    'loadCLI'
].forEach((identifier) => {
    Vulcan.prototype[identifier] = function () {
        logger.debug(`Vulcan method '${identifier}' disabled for testing`);

        return this;
    };
});

const vulcan  = xrequire('./bot');
const servers = vulcan.servers;

logger.plain(
    `====================================\n`
  + `   Vulcan Music Dependencies Test   \n`
  + `   Server Count: ${servers.length}  \n`
  + `====================================\n`
  + `########### Dependencies ###########\n`
  + `${JSON.stringify(pjson.dependencies)}\n`
  + `#####################################`
);

vulcan.on('ready', () => {
    for (const guildID of servers.keys()) {
        const vcs = vulcan.guilds.get(guildID).channels.filter((channel) => channel instanceof Discord.VoiceChannel);

        vcs.forEach((vc) => {
            vc.join().then((connection) => {
                ytdl('http://www.youtube.com/watch?v=KQ0_0bBARq8').then((r) => {
                    connection.play(r, { type: 'opus' });
                    connection.dispatcher.on('finish', () => process.exit(0));
                });
            });
        });
    }
});
