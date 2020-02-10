/*
?   Invalid Authorisation Request (Vulcan Event)
*   Happens when an invalid guild authorisation request happens.
*   This is usually because of an invalid guild parsed.
*/

const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');
const logger        = xrequire('./managers/LogManager').getInstance();

module.exports = (
    message,
    description = 'Invalid guild authorisation request!'
) => {
    message.channel.send(messageEmbeds.warning(
        {
            title: `Invalid Authorisation Request`,
            description
        }
    )).catch((err) => {
        logger.error(err.message);
    });
};
