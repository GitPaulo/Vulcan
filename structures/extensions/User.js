const Discord = require('discord.js');

class User extends Discord.User {

}

Discord.Structures.extend('User', u => User);