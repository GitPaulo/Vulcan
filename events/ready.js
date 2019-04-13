const vulcan = require('../bot');
const pjson  = require('../package.json');

vulcan.on('ready', () => {
    vulcan.logger.info(`Bot has started, with ${vulcan.users.size} users, in ${vulcan.channels.size} channels of ${vulcan.guilds.size} guilds.`);

    let version = pjson.version; 
    vulcan.user.setActivity(`In-Development (V-${version})`);
    
    vulcan.guilds.forEach(function(v, k, m){
        const LUL = v.emojis.find(emoji => emoji.name === 'LUL');
        //v.systemChannel.send(`I am alive. Chan is gay ${LUL}`);
    })
});