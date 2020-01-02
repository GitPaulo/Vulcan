const logger =  xrequire('./managers/LogManager').getInstance();

module.exports = (guild) => {
    // Clear any guild data?

    logger.log(`Vulcan has left guild '${guild.name}(${guild.id})' owned by ${guild.owner ? guild.owner.user.tag : 'Unknown'}.`);
};
