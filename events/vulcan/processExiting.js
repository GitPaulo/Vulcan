/**
 * ? Process Exiting (Vulcan Event)
 * Called when vulcan process is exiting and vulcan client is valid.
 */

module.exports = (
    vulcan,
    code,
    reason
) => {
    let promises = [];

    vulcan.guilds.cache.forEach((guild) => {
        const botChannel = guild.botChannel;

        if (botChannel) {
            promises.push(botChannel.send(
                {
                    embed: {
                        title      : 'Vulcan Shutdown',
                        timestamp  : new Date(),
                        color      : 0x000000,
                        description: `Exit sequence initiated.`,
                        fields     : [
                            {
                                name  : 'Message',
                                value : `\`\`\`\n${reason}\`\`\``,
                                inline: false
                            },
                            {
                                name  : 'Exit Code',
                                value : `${process.codes[code]} | ${code}`,
                                inline: true
                            },
                            {
                                name  : 'Vulcan Uptime',
                                value : String(vulcan.uptime / 1000).toHHMMSS(),
                                inline: true
                            }
                        ],
                        thumbnail: {
                            url: `attachment://critical.png`
                        },
                        footer: {
                            text: '[Process Exit]'
                        }
                    },
                    files: [
                        {
                            attachment: './assets/media/embeds/general/critical.png',
                            name      : 'critical.png'
                        }
                    ]
                }
            ));
        }
    });

    // Relay back
    Promise.all(promises).then(() => process.emit('beforeExit', code, reason));
};
