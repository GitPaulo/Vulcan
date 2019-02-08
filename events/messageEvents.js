const vulcan        = require("../bot");
const MessageParser = require("../structures/classes/MessageParser");
const MessageEmbeds = require("../scripts/messageEmbeds");

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

    let messageParser = MessageParser.getInstance();
    let parseError    = messageParser.parse(vulcan, message); // changes the message objet! (if command: attaches extra properties)

    if (parseError.hasError)
        message.channel.send(MessageEmbeds.error(message.author.username, "Command Validation", `Command Parse error: ${parseError.message}`));

    if (message.isCommand) {
        let cmd = message.command;
        let va = cmd.validateMessageArguments(message); // Returns boolean wethere - if arguments of message match expected meta-data of arguments of command.
        let hasTimedOut = cmd.checkTimeout(message.author);
        let canExecute = !hasTimedOut && await cmd.validate(message, va);
        if (canExecute) {
            await cmd.execute(message);
        } else {
            // maybe change to handle this as exceptions
            userMessage = hasTimedOut ? "Command Timeout triggered => WOA, WAIT YOU FUCKER!" : "Command validation failed :(!";
            userMessage = MessageEmbeds.warning(message.author.username, "Command Validation", userMessage);

            message.channel.send(userMessage); // changed to custom embed - is this async?
        }
    } else {
        message.channel.send(MessageEmbeds.warning(message.author.username, "Command Existance Check", "The command you have entered does not exist!"));
    }
    });