/*
?   Error (Discord Event)
*   Emitted whenever the client's WebSocket encounters a connection error.
    https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-error
*/

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
