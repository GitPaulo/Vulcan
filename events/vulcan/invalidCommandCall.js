/*
 * Happens when validation inside the command.execute() fails
    ? This could be for many reasons:
       - Invalid #arguments
       - Authenticity
       - Validity
       - etc...
    ! DO NOT mistaken this for 'preventedCommandCall' which acts
    ! at a higher level (before command.execute())
 */

const messageEmbeds = xrequire('./utility/modules/messageEmbeds');
const logger        = xrequire('./managers/LogManager').getInstance();

module.exports = (
    message,
    description = 'Invalid command call!'
) => {
    console.log(message.command);
    message.channel.send(messageEmbeds.warning(
        {
            title : `Invalid Command Call (${message.command.id})`,
            description,
            fields: [
                {
                    name : 'Help Description',
                    value: message.command.description
                },
                {
                    name : 'Examples',
                    value: `\`\`\`\n${message.command.examples.join('\n')}\n\`\`\``
                }
            ]
        }
    )).catch((err) => {
        logger.error(err.message);
    });
};
