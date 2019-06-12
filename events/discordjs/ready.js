const pjson  = xrequire('./package.json');
const logger = xrequire('./managers/LogManager').getInstance();
const vulcan = xrequire('./bot.js');

module.exports = () => {
    logger.info(`Bot has started, with ${vulcan.users.size} users, in ${vulcan.channels.size} channels of ${vulcan.guilds.size} guilds.`);

    let version = pjson.version;
    vulcan.user.setActivity(`Version (${version})`);
};
