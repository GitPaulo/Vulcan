vulcan.on("ready", () => {
    vulcan.logger.info(`Bot has started, with ${vulcan.users.size} users, in ${vulcan.channels.size} channels of ${vulcan.guilds.size} guilds.`);
    vulcan.user.setActivity(`Under development!`);
    
    vulcan.guilds.forEach(function(v, k, m){
        const LUL = v.emojis.find(emoji => emoji.name === "LUL");
        //v.systemChannel.send(`I am alive. Chan is gay ${LUL}`);
    })
});