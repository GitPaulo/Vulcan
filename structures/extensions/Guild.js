const Discord = require("discord.js");

class Guild extends Discord.Guild {

}

Discord.Structures.extend('Guild', g => Guild);