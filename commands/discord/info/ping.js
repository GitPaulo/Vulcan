const ping          = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

// eslint-disable-next-line no-unused-vars
ping.load = (commandDefinition) => {
    this.phrases = [
        `Imagine pinging vulcan...`,
        `Give me a second lad...`,
        `Attempting to communicate with discord, ANYONE THERE??`,
        `Pinging...`,
        `This wont take long...`,
        `Ping request received...`,
        `Ping, pong!`,
        `I have awaken from my slumber! D:<`,
        `Hello world!`,
        `Hi there!`,
        `Hello!`,
        `Please have a low latency T__T`
    ];
};

ping.execute = async (message) => {
    const phrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
    const m      = await message.channel.send(phrase);

    const mWrap = messageEmbeds.reply(
        {
            message,
            title : 'Pong!',
            fields: [
                {
                    name : 'API Latency',
                    value: `${m.createdTimestamp - message.createdTimestamp}ms`
                }
            ]
        }
    );

    await message.channel.send(mWrap);
};
