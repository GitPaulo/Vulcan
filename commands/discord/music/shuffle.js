const shuffle = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

shuffle.execute = async message => {
  const musicManager = message.guild.musicManager;

  let input = message.parsed.args[0];
  let bool = input ? Boolean(input) : !musicManager.shuffle;

  musicManager.shuffle = bool;

  await message.channel.send(
    messageEmbeds.reply({
      message,
      title: ':stop_button: :notes:  - Shuffled Queue',
      fields: [
        {
          name: 'Shuffle Status',
          value: bool.toString()
        }
      ]
    })
  );
};
