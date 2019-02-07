const vulcan        = require("../bot");
const MessageParser = require("../structures/classes/MessageParser");

vulcan.on("message", async message => { 
    // message.client === vulcan
    vulcan.logger.info("[GUILD: " + message.guild.name + "] =>[MESSAGE][" + message.author.username + "][" + message.channel.name + "]: " + message.content);
    
    // Don't respond to self - bad recursion can happen LULW
    if (message.author.bot) return; 

    let found = false;
    for (let prefix of vulcan.configurations.prefixes){
        found = found || Boolean(message.content[0] == prefix);
    }

    if (!found) return; // Before we parse, we must check that it's worth parsing!

    let mparser = new MessageParser(vulcan, message); 
    mparser.parse();

    if (message.isCommand){
        let cmd = message.command;
        if(cmd.validate(message)){
           cmd.execute(message);
        }else{
            // Not allowed!
        }
    }else{
        // Not a valid command!
    }
    /*
    const args    = message.content.slice(1).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "say") {
        const sayMessage = args.join(" ");
        message.delete().catch(O_o => {});
        message.channel.send(sayMessage);
    }*/
});