const logger = xrequire('./managers/LogManager').getInstance();

module.exports = async (guild) => {
    logger.log(`Vulcan joined a new guild: ${guild.name}(${guild.id})`);

    // New guild? Request auth!
    if (!guild.authorised) {
        guild.requestAuthorisation(); // Requestee === client.user
    }
};
