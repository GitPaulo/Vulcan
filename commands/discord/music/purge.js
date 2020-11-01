const purge = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

purge.execute = async message => {
  const musicManager = message.guild.musicManager;

  // Purge music player
  musicManager.purge();

  await message.channel.send(
    messageEmbeds.reply({
      message,
      title: ':notes:  - Player Purged',
      description: 'Purged music player state.'
    })
  );
};
