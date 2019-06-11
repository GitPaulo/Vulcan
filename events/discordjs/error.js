const logger = xrequire('./managers/logManager').getInstance();

module.exports = (error, description, channel) => {
    if (channel) {
        channel.send(
            {
                title: `WebSocket Error`,
                description: description
            }
        ).catch(err => {
            channel.client.log.error(err);
        });
    }

    logger.error(error);
};
