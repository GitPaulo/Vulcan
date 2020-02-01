/*
*   Execution File
    This file is used to test Vulcans capability of streaming music.
*/

const Discord = xrequire('discord.js');
const ytdl    = xrequire('ytdl-core-discord');
const Vulcan  = xrequire('./structures/classes/core/Vulcan');

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
        console.log(`Vulcan method '${identifier}' disabled for testing`);

        return this;
    };
});

const vulcan  = xrequire('./executions/bot');
const servers = vulcan.authorised;

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
