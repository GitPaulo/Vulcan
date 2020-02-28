/**
 * ? Command Misused (Vulcan Event)
 * Can be command specific.
 * Generally when the command rules are not followed.
 * These rules are defined in the command descriptor.
 */

module.exports = (
    message,
    description = 'Command was used in an unexpected or incorrect way!'
) => {
    message.channel.send(
        {
            embed: {
                title      : `Bad Command Usage`,
                description: `Vulcan has caught an **improper** or **unexpected** usage of the command: \`${message.command.id}\``,
                color      : 0xD8B1FF,
                thumbnail  : {
                    url: `attachment://commandMisused.gif`
                },
                timestamp: new Date(),
                footer   : {
                    text: `Request by ${message.author.tag}`
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
                        name : 'Usage Examples',
                        value: `\`\`\`\n${message.command.examples.join('\n')}\n\`\`\``
                    }
                ],
                url: ''
            },
            files: [
                {
                    attachment: './assets/media/embeds/events/commandMisused.gif',
                    name      : 'commandMisused.gif'
                }
            ]
        }
    );
};
