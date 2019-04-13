const Discord = require('discord.js');

class TextChannel extends Discord.TextChannel {

}

Discord.Structures.extend('TextChannel', t => TextChannel);