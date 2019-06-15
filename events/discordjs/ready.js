const vulcan = xrequire('./bot.js');
const pjson  = xrequire('./package.json');
const logger = xrequire('./managers/LogManager').getInstance();

module.exports = () => {
    logger.log(`Bot has started, with ${vulcan.users.size} users, in ${vulcan.channels.size} channels of ${vulcan.guilds.size} guilds.`);

    let version = pjson.version;
    vulcan.user.setActivity(`Version (${version})`);
};
