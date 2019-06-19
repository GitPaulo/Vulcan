/**
 * Happens whenever a call for a Vulcan commands is invalid.
 * This could be for many reasons:
 *      - Invalid #arguments
 *      - Authenticity
 *      - Validity
 *      - etc...
 */

const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');
const logger        = xrequire('./managers/LogManager').getInstance();

module.exports = (description, message) => {
    message.channel.send(messageEmbeds.warning(
        {
            title: '[Invalid Command Call] ' + message.command.id,
            description,
            fields: [
                {
                  name: '[Command Help] Description',
                  value: message.command.description
                },
                {
                    name: '[Command Help] Examples',
                    value: message.command.examples.join('\n')
                }
            ]
        }
    )).catch((err) => {
        logger.error(err.message);
    });
};
