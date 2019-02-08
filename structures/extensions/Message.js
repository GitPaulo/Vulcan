const Discord = require("discord.js");

class Message extends Discord.Message {
    constructor (...args) {
        super(...args);

        this.isCommand  = false;
        this.command    = null;
        this.argString  = null;
        this.args       = null;
        this.raw        = null;
        this.parsedName = null;
    }

    initCommand(command, argString, args, raw, parsedName) {
        this.isCommand  = true;
        this.command    = command;
        this.argString  = argString;
        this.args       = args;
        this.raw        = raw;
        this.parsedName = parsedName;

        return this;
    }
}
console.log(Discord.TextChannel);
Discord.Structures.extend('Message', m => Message);