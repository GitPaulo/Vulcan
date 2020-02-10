/*
?   Invalid Command Usage (Vulcan Event)
*   Happens when validation inside the command.execute() fails.
*   This could be for many reasons:
        - Invalid #arguments
        - Authenticity
        - Validity
        - etc...
!   Note: Do not mistaken this for 'invalidCommandCall' which acts at a higher level (before command.execute()).
*/

module.exports = (
    message,
    description = 'Command was used in an unexpected or incorrect way!'
) => {
    message.channel.send(
        {
            embed: {
                title      : `Invalid Command Usage`,
                description: `Vulcan has caught an improper or unexpected usage of the command: \`${message.command.id}\``,
                color      : 0xD8B1FF,
                thumbnail  : {
                    url: `attachment://invalidCommandUsage.gif`
                },
                timestamp: new Date(),
                footer   : {
                    text: 'Read the documentation please D:<'
                },
                fields: [
                    {
                        name : 'Message',
                        value: description
                    },
                    {
                        name : 'Help Description',
                        value: message.command.description
                    },
                    {
                        name : 'Command Usage Examples',
                        value: `\`\`\`\n${message.command.examples.join('\n')}\n\`\`\``
                    }
                ],
                url: ''
            },
            files: [
                {
                    attachment: './assets/media/images/embeds/invalidCommandUsage.gif',
                    name      : 'invalidCommandUsage.gif'
                }
            ]
        }
    );
};
