const logger = xrequire('./managers/LogManager').getInstance();

module.exports = (error, description, channel) => {
    if (channel) {
        channel.send(
            {
                title: `WebSocket Error`,
                description
            }
        ).catch((err) => {
            channel.client.log.error(err);
        });
    }

    logger.error(error);
};
