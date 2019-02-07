const vulcan        = require("../bot");
const MessageParser = require("../structures/classes/MessageParser");

vulcan.on("message", async message => { 
    // message.client === vulcan
    vulcan.logger.info("[GUILD: " + message.guild.name + "] =>[MESSAGE][" + message.author.username + "][" + message.channel.name + "]: " + message.content);
    
    // Don't respond to self - bad recursion can happen LULW
    if (message.author.bot) return;

    let found = false;
    for (let prefix of vulcan.configurations.prefixes) {
        found = found || Boolean(message.content[0] == prefix);
    }

    if (!found) return; // Before we parse, we must check that it's worth parsing!

    let mparser    = new MessageParser(vulcan, message); 
    let parseError = mparser.parse();

    if (parseError.hasError)
        message.channel.send("Parse error: " + parseError.message);

    if (message.isCommand) {
        let cmd = message.command;
        let va  = cmd.validateMessageArguments(message); // Returns boolean wethere - if arguments of message match expected meta-data of arguments of command.
        if(cmd.validate(message, va)){
           cmd.execute(message);
        }else{
            message.channel.send("Command validation failed :(!"); // changed to custom embed - is this async?
        }
    }else{
        message.channel.send("Invalid command received!");
    }
});