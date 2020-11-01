/**
 * ? Handler file
 * Handles the checks for specific comamnd categories.
 * * IF return false, command doesnt run.
 * ! This probably should be in the message.js event
 */

module.exports = async message => {
  // ? Music commands
  // Can only use music commands if in a voice channel.
  if (message.command.category === 'music' && !message.member.voice.channel) {
    return (
      message.client.emit(
        'commandBlocked',
        message,
        `Commands of type \`music\` require the requester to be in a voice channel.`,
        [
          {
            name: 'Tip',
            value: `Join a voice channel!`
          }
        ]
      ),
      false
    );
  }

  // Bot must have a connection for music control commands to operate.
  if (message.command.category === 'music' && message.command.id !== 'music' && !message.guild.musicManager.connected) {
    return (
      message.client.emit('commandBlocked', message, `Vulcan must be in a voice channel.`, [
        {
          name: 'Tip',
          value: `Use the command \`music\` first.`
        }
      ]),
      false
    );
  }

  // ? NSFW commands
  // Require caller to be in the same voice channel as bot
  if (message.command.category === 'nsfw' && !message.channel.nsfw) {
    return (
      message.client.emit(
        'commandBlocked',
        message,
        `Commands from the category \`nsfw\` require the requester to be in a NSFW enabled channel.\n\n`
      ),
      false
    );
  }

  return true;
};
