/**
 * ? Channel Information (Vulcan Event)
 * Happens when vulcan tries to inform a channel of something.
 */

const messageEmbeds = xrequire('./modules/messageEmbeds');
const logger        = xrequire('./modules/logger').getInstance();

module.exports = (
    channel,
    description = 'Vulcan attempted to communicate information but nothing was passed.'
) => {
    logger.log(`[${channel.name}] => ${description}`);
    channel.send(messageEmbeds.info(
        {
            title: 'Vulcan Information',
            description
        }
    )).catch((err) => {
        logger.error(err.message);
    });
};
