/**
 * ? Command Restriction (Vulcan Event)
 * Happens when a user calls a command and:
 *   - Is a blacklisted user.
 *   - Is a unauthorised user.
 */

module.exports = (
    message,
    reason,
    extraFields = []
) => {
    message.channel.send(
        {
            embed: {
                title      : `Restricted Access`,
                description: `You cannot **access** this command.`,
                color      : 0xE5F2AA, // Red
                thumbnail  : {
                    url: `attachment://commandRestricted.gif`
                },
                timestamp: new Date(),
                footer   : {
                    text: `Request by ${message.author.tag}`
                },
                fields: [
                    {
                        name : 'Reason',
                        value: reason
                    },
                    ...extraFields
                ],
                url: ''
            },
            files: [
                {
                    attachment: './assets/media/embeds/events/commandRestricted.gif',
                    name      : 'commandRestricted.gif'
                }
            ]
        }
    );
};
