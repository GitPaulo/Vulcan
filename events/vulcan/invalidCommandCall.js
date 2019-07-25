/*
 * Happens when validation inside the message event fails.
    ? This could be for many reasons:
       - Spam filtering
       - Blacklisting
       - Permissions
       - etc...
    ! message.command is not guaranteed to be defined
 */

const messageEmbeds = xrequire('./utility/modules/messageEmbeds');
const logger        = xrequire('./managers/LogManager').getInstance();

// ? Rate limit this event? (Could be abused)
module.exports = (
    message,
    description,
    extraFields = []
) => {
    message.channel.send(messageEmbeds.invalidCommandCall(
        {
            description,
            fields: [
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
            ]
        }
    )).catch((err) => {
        logger.error(err.message);
    });
};
