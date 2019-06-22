const pjson           = xrequire('./package.json');
const ytdl            = xrequire('ytdl-core-discord');
const Vulcan          = xrequire('./structures/classes/core/Vulcan');
const logger          = xrequire('./managers/LogManager').getInstance();

// Disable unwanted load options
[
    'loadDatabase',
    'loadCommands',
    'loadEvents',
    'loadPermissions',
    'loadMusicManager',
    'loadCLI'
].forEach(identifier => {
    Vulcan.prototype[identifier] = function () {
        logger.debug(`Vulcan method '${identifier}' disabled for testing`);
        return this;
    };
});

const vulcan    = xrequire('./bot');
const guildID   = '208029113682886660';
const channelID = '516326465386577923';

logger.plain(
`====================================
    Vulcan Music Dependencies Test
    Guild ID: ${guildID}
    Channel ID: ${channelID}
====================================\n
#### Dependencies ####
${JSON.stringify(pjson.dependencies)}
######################`
);

vulcan.on('ready', () => {
    let vc = vulcan.guilds.get(guildID).channels.get(channelID);
    vc.join().then((connection) => {
        ytdl('https://www.youtube.com/watch?v=KQ0_0bBARq8').then((r) => {
            connection.play(r, { type: 'opus' });
        });
    });
});
