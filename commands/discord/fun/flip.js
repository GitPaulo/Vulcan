const filp = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

filp.load = (descriptor, packages) => {
  const { MersenneTwister } = packages;

  this.generator = new MersenneTwister();
};

filp.execute = async message => {
  const randomNumber = this.generator.random();
  const resultantProbability = randomNumber;

  await message.channel.send(
    messageEmbeds.reply({
      message,
      description: `Flipped a coin and landed on: **${resultantProbability >= 0.5 ? 'HEADS' : 'TAILS'}**`
    })
  );
};
