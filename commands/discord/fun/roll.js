const roll          = module.exports;
const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');

roll.execute = async (message) => {
    const upperBound = message.parsed.args[0] || 10;

    if (isNaN(upperBound || upperBound <= 0)) {
        return message.client.emit(
            'invalidCommandUsage',
            message,
            'Upper bound must be a number larger than 0!'
        );
    }

    const roll = Math.ceil(Math.randomRange(0, upperBound));

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: `D${upperBound} dice rolled a **${roll}**!`
        }
    ));
};
