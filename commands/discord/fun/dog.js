const dog           = module.exports;
const httpFetch     = xrequire('node-fetch');
const messageEmbeds = xrequire('./modules/messageEmbeds');

dog.execute = async (message) => {
    const response = await httpFetch('http://dog.ceo/api/breeds/image/random');
    const object   = await response.json();

    if (object.status !== 'success') {
        return message.channel.send(messageEmbeds.reply(
            {
                description: 'The "dog.ceo/api/" API endpoint seems to be down!\nTry again later!'
            }
        ));
    }

    await message.channel.send({ files: [object.message] });
};
