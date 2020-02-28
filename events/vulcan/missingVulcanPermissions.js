/**
 * ? Missing Vulcan Permissions (Vulcan Event)
 * Happens when the bot itself does not have enough permissions to do something.
 */

const messageEmbeds = xrequire('./modules/messageEmbeds');
const logger        = xrequire('./modules/logger').getInstance();

module.exports = (
    message,
    description = 'Missing permissions!'
) => {
    message.channel.send(messageEmbeds.warning(
        {
            title: `Missing Permissions`,
            description
        }
    )).catch((err) => {
        logger.error(err.message);
    });
};
