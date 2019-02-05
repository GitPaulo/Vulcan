const Discord = require("discord.js");

class Message extends Discord.Message {

}

Discord.Structures.extend('Message', m => Message);