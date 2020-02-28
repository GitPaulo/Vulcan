/**
 * ? Channel Warning (Vulcan Event)
 * Happens when an internal error surfaces in a controlled space due to some action requested in a text channel.
 */

const messageEmbeds = xrequire('./modules/messageEmbeds');
const logger        = xrequire('./modules/logger').getInstance();

module.exports = (
    channel,
    description = 'Somehing has gone wrong. Likely to not be vulcan\'s fault.'
) => {
    logger.warning(`[${channel.name}] => ${description}`);
    channel.send(messageEmbeds.warning(
        {
            title: 'Vulcan Warning',
            description
        }
    )).catch((err) => {
        logger.error(err.message);
    });
};
