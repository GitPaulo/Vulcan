/**
 * ? Guild Delete (Discord Event)
 * Emitted whenever the client leaves a guild.
 * (https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildDelete)
 */

const logger =  xrequire('./modules/logger').getInstance();

module.exports = (guild) => {
    // Clear any guild data?

    logger.log(`Vulcan has left guild '${guild.name}(${guild.id})' owned by ${guild.owner ? guild.owner.user.tag : 'Unknown'}.`);
};
