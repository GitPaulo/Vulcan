const skip = module.exports;
const Discord = xrequire('discord.js');
const messageEmbeds = xrequire('./modules/messageEmbeds');

skip.execute = async message => {
  const musicManager = message.guild.musicManager;

  if (!musicManager.connected) {
    return message.client.emit(
      'commandMisused',
      message.channel,
      'Bot mus be in a voice channel.\n' + 'Use the `music` command.'
    );
  }

  let force = Boolean(message.parsed.args[0]);

  if (musicManager.queueEmpty && !musicManager.playing) {
    return message.client.emit('channelInformation', message.channel, 'There is nothing to skip!');
  }

  let lsName = Discord.Util.escapeMarkdown(musicManager.currentTask.song.name);

  // Skip current song
  musicManager.skip(force);

  await message.channel.send(
    messageEmbeds.reply({
      message,
      title: ':fast_forward:  - Skipped Song',
      fields: [
        {
          name: 'Skipped Song',
          value: lsName
        }
      ]
    })
  );
};
