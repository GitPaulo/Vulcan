const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');
const logger        = xrequire('./managers/LogManager').getInstance();

/*
*  Happens when an internal error surfaces in a controlled space
*  due to some action requested in a text channel.
*/
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
