const pjson  = xrequire('./package.json');
const ytdl   = xrequire('ytdl-core-discord');
const Vulcan = xrequire('./structures/classes/core/Vulcan');
const logger = xrequire('./managers/LogManager').getInstance();

// Disable unwanted load options
[
    'loadDatabase',
    'loadCommands',
    'loadEvents',
    'loadPermissions',
    'loadMusicManager',
    'loadCLI'
].forEach((identifier) => {
    Vulcan.prototype[identifier] = () => {
        logger.debug(`Vulcan method '${identifier}' disabled for testing`);

        return this;
    };
});

const vulcan    = xrequire('./bot');

// [DEVELOPERS GUILD ID AND CHANNEL ID]
const guildID   = '208029113682886660';
const channelID = '516326465386577923';

logger.plain(
    `====================================\n`
  + `   Vulcan Music Dependencies Test   \n`
  + `   Guild ID: ${guildID}             \n`
  + `   Channel ID: ${channelID}         \n`
  + `====================================\n`
  + `########### Dependencies ###########\n`
  + `${JSON.stringify(pjson.dependencies)}\n`
  + `#####################################`
);

vulcan.on('ready', () => {
    const vc = vulcan.guilds.get(guildID).channels.get(channelID);

    vc.join().then((connection) => {
        ytdl('https://www.youtube.com/watch?v=KQ0_0bBARq8').then((r) => {
            connection.play(r, { type: 'opus' });
            connection.dispatcher.on('finish', () => process.exit(0));
        });
    });
});
