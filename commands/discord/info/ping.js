const ping          = module.exports;
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

ping.load = (commandDefinition) => {
    this.phrases = [
        `Imagine pinging vulcan...`,
        `Give me a second lad.`,
        `OI OI m8!!`,
        `Pinging...`,
        `This wont take long...`,
        `Ping request received....`
    ];
};

ping.execute = async (message) => {
    let preMessage = await message.channel.send(this.phrases[Math.floor(Math.random() * this.phrases.length)]);
    let reply      = messageEmbeds.reply({
        replyeeMessage: message,
        title: 'Pong!',
        fields: [
            {
                name: 'API Latency',
                value: `${preMessage.createdTimestamp - message.createdTimestamp}ms`
            }
        ]
    });

    process.exit(1, 'test');

    await message.channel.send(reply);
};
