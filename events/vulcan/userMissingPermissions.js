/*
?   Invalid Command Usage (Vulcan Event)
*   Happens when a user does not have enough permissions to do something.
*/

const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');
const logger        = xrequire('./managers/LogManager').getInstance();

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
