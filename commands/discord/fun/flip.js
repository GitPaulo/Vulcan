const filp            = module.exports;
const messageEmbeds   = xrequire('./utility/modules/messageEmbeds');
const MersenneTwister = xrequire('./structures/classes/external/MersenneTwister');

const generator = new MersenneTwister();

filp.execute = async (message) => {
    const randomNumber         = generator.random();
    const resultantProbability = randomNumber;

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: `Flipped a coin and landed on: **${resultantProbability >= 0.5 ? 'HEADS' : 'TAILS'}**`
        }
    ));
};
