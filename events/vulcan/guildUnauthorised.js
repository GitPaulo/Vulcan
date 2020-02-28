/**
 * ? Guild Unauthorised (Vulcan Event)
 * Happens when a guild is prevented from accessing a vulcan feature.
 */

module.exports = async (
    guild,
    reason
) => {
    await guild.botChannel.send(
        {
            embed: {
                title      : `Guild Unauthorised`,
                description: `Access to a vulcan feature has been **blocked**.`,
                color      : 0xFF7D00,
                thumbnail  : {
                    url: `attachment://guildUnauthorised.gif`
                },
                timestamp: new Date(),
                footer   : {
                    text: `[Authorisation System]`
                },
                fields: [
                    {
                        name : 'Block Reason',
                        value: reason
                    },
                    {
                        name : 'Become Authorised?',
                        value: `To become authorised you must request clearence from the bot administrators. Use the \`authorise\` command.`
                    }
                ],
                url: ''
            },
            files: [
                {
                    attachment: './assets/media/embeds/events/guildUnauthorised.gif',
                    name      : 'guildUnauthorised.gif'
                }
            ]
        }
    );
};

