const resume = module.exports;
const Discord = xrequire('discord.js');
const messageEmbeds = xrequire('./modules/messageEmbeds');

resume.execute = async message => {
  const musicManager = message.guild.musicManager;

  // If already in voice channel, we are performing a move.
  if (!musicManager.connected) {
    return message.client.emit(
      'commandMisused',
      message.channel,
      'Bot must be in a voice channel.\n' + 'Use the `music` command.'
    );
  }

  if (musicManager.playing) {
    return message.client.emit('commandMisused', message.channel, 'Music is already playing. Therefore cannot resume.');
  }

  musicManager.resume();

  await message.channel.send(
    messageEmbeds.reply({
      message,
      title: ':play_pause:  - Resume',
      fields: [
        {
          name: 'Resumed Song',
          value: Discord.Util.escapeMarkdown(musicManager.currentTask.song.name)
        }
      ]
    })
  );
};
