/**
 * ? Execution File
 * This file is used to test the discord API.
 */

// Import first
const Discord = xrequire('discord.js');
const client = new Discord.Client();
const settings = xrequire('./prerequisites/settings');

// Events
client.on('ready', () => {
  console.log(`Successfully logged in as: ${client.user.tag}(${client.user.id})!`);
  setInterval(() => {
    console.log('Ending discord connection.');
    client.destroy();
    process.exit(0);
  }, 2000);
}),
  client.on('message', msg => {
    if (msg.content === 'ping') {
      msg.reply('Pong!');
    }
  });

// Login
client.login(settings.credentials.token).catch(error => {
  console.error(error);
  process.exit(1);
});

module.exports = client;
