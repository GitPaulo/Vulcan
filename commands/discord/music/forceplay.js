const forceplay = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

// TODO: Must finish
forceplay.execute = async message => {
  const musicManager = message.guild.musicManager;

  let request = message.parsed.args[0];

  if (!request) {
    return message.client.emit('commandMisused', message, `Expected 1 argument (song source), instead got nothing!`);
  }

  // Join voice if not already in
  if (!musicManager.voiceChannel) {
    await musicManager.joinVoice(message.member.voice.channel);
  }

  // Force Play
  await musicManager.forcePlay(request, message.channel, message.author);

  await message.channel.send(
    messageEmbeds.reply({
      message,
      decription: 'Force played a song.\nWill play on top of queue without affecting queue state.',
      fields: [
        {
          name: 'Forced Song',
          value: request
        },
        {
          name: 'Current Queue Size',
          value: musicManager.queue.length
        }
      ]
    })
  );
};
