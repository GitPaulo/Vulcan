/**
 * ? Handler file
 * Handles logging for messages sent from for all channels belonging to the union of all joined guilds:
 * For now, keep this simple.
 * TODO: Figure out a more elegant way to log.
 */

const logger = xrequire('./modules/logger').getInstance();

module.exports = async (message) => {
    // Log every message
    logger.log(
        // Server status
        `[${message.direct
            ? `DM:${message.author.tag}`
            : `${((!message.guild.authorised && 'Unauthorised' || 'Authorised') + `]`
        + ` => `
        // Source of message
        + `[${message.guild.name}`)}@${message.channel.name}`}@${message.system ? 'System (Discord)' : `${message.author.tag}`}]`
        + ` => `
        // Content of message
        + `"${message.cleanContent || (message.embeds.length ? `[Embeds: ${message.embeds.length}]` : `[Files Attached: ${message.attachments.size}]`)}"`
    );

    // Log any attachments
    if (message.attachments.size > 0) {
        logger.plain(message.attachments);
    }
};
