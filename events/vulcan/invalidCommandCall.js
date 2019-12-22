/*
 * Happens when validation inside the message event fails.
    ? This could be for many reasons:
       - Spam filtering
       - Blacklisting
       - Permissions
       - etc...
    ! message.command is not guaranteed to be defined
 */

// ? Rate limit this event? (Could be abused)
module.exports = (
    message,
    description,
    extraFields = []
) => {
    message.channel.send(
        {
            embed: {
                title      : `Invalid Command Call`,
                description: `The command parsed by vulcan was found to either not exist or have problems with said parsing.\n\n*Nothing was executed.*`,
                color      : 0xFF0000, // Red
                thumbnail  : {
                    url: `attachment://invalidCommandCall.gif`
                },
                timestamp: new Date(),
                footer   : {
                    text: 'You should really look up the commands before typing anything :)'
                },
                fields: [
                    {
                        name : 'Message',
                        value: description
                    },
                    {
                        name  : 'Caller',
                        value : `<@${message.author.id}>`,
                        inline: true
                    },
                    {
                        name  : 'Input',
                        value : `\`${message.content}\``,
                        inline: true
                    },
                    ...extraFields
                ],
                url: ''
            },
            files: [
                {
                    attachment: './assets/media/images/embeds/invalidCommandCall.gif',
                    name      : 'invalidCommandCall.gif'
                }
            ]
        }
    );
};
