const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');
const logger        = xrequire('./managers/LogManager').getInstance();

/*
?   Channel Information (Vulcan Event)
*   Happens when vulcan tries to inform a channel of something.
*/

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
