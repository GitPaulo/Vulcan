const cat           = module.exports;
const request       = xrequire('request-promise');
const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');

cat.execute = async (message) => {
    const response = JSON.parse(await request('http://aws.random.cat/meow'));

    if (!response.file) {
        return message.channel.send(messageEmbeds.reply(
            {
                description: 'The "aws.random.cat" API endpoint seems to be down!\nTry again later!'
            }
        ));
    }

    await message.channel.send({ files: [response.file] });
};
