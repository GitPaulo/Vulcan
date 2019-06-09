const pjson  = xrequire('./package.json');
const logger = xrequire('./managers/logManager').getInstance();

module.exports = () => {
    logger.info(`Bot has started, with ${vulcan.users.size} users, in ${vulcan.channels.size} channels of ${vulcan.guilds.size} guilds.`);

    let version = pjson.version; 
    vulcan.user.setActivity(`Version (${version})`);
};