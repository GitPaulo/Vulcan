/**
 * ? Execution File
 * This file is used to test Vulcans capability of streaming music.
 */

const ytdl   = xrequire('ytdl-core-discord');
const vulcan = xrequire('./executions/bot.js');
const logger = xrequire('./modules/logger').getInstance();
const guilds = vulcan.guilds.cache;

vulcan.on('ready', () => {
    // Wait for other ready functions
    setTimeout(() => {
        guilds.forEach((guild) => {
            const vcs = guild.channels.cache.filter((channel) => channel.type === 'voice');
            const vc  = vcs.first();

            if (!vc) {
                return logger.warn(
                    `Couldn't find a voice channel to join in: ${guild.name}(${guild.id})`
                );
            }

            vc.join().then((connection) => {
                ytdl(
                    'http://youtu.be/PynIGY0b6HM',
                    {
                        filter       : () => ['251'],
                        highWaterMark: 1 << 20
                    }
                ).then((r) => {
                    connection.play(r, { type: 'opus' });
                    connection.dispatcher.on('debug', logger.warn);
                    connection.dispatcher.on('error', logger.error);
                    connection.dispatcher.on('speaking', logger.debug);
                    connection.dispatcher.on('start', logger.debug);
                    connection.dispatcher.on('volumeChange', logger.debug);
                    connection.dispatcher.on('finish', () => process.exit(0));
                });
            });
        });
    }, 2000);
});

module.exports = vulcan;
