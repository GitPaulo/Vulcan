/**
 * ? Channel Error (Vulcan Event)
 * Happens when an internal error surfaces in a controlled space due to some action requested in a text channel.
 */
/**
 * ? Channel Error (Vulcan Event)
 * Happens when an exception is thrown originating from a channel request.
 */

const messageEmbeds = xrequire('./modules/messageEmbeds');
const logger        = xrequire('./modules/logger').getInstance();

module.exports = (
    channel,
    err,
    description = 'Internal error has occured due to an action originating from this channel.'
) => {
    logger.error(`[${channel.name}] => ${description}\n\tError message: ${err.message}\n\tStack: ${err.stack}`);
    channel.send(messageEmbeds.error(
        {
            title : 'Vulcan Internal Error',
            description,
            fields: [
                {
                    name : 'Error Message',
                    value: err.message
                },
                {
                    name : 'Stack String',
                    value: `\`\`\`${err.stack.toString()}\`\`\``
                }
            ]
        }
    )).catch((err) => {
        logger.error(err.message);
    });
};
