/*
 * Happens when a response is given to a authorisation request
 */

const messageEmbeds = xrequire('./utility/modules/messageEmbeds');
const logger        = xrequire('./managers/LogManager').getInstance();

module.exports = (
    guild,
    respondant,
    requestee,
    response
) => {
    const authStr1 = response ? 'APPROVED' : 'REJECTED';
    const authStr2 = response
        ? 'This guild now has access to all vulcan features.\n\nGet started by using the `docs` command!'
        : 'Vulcan features will remained locked.\n\nYou may resubmit request with the \'authorise\' command.';

    guild.botChannel.send(messageEmbeds.info(
        {
            title      : `Guild Authorisation`,
            description: `This guild has been **${authStr1}** authorisation.\n${authStr2}`,
            fields     : [
                {
                    name : 'Respondant',
                    value: respondant.tag
                },
                {
                    name : 'Requestee',
                    value: requestee.tag
                }
            ]
        }
    )).catch((err) => {
        logger.error(err.message);
    });
};
