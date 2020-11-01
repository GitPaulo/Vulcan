const cat = module.exports;
const httpFetch = xrequire('node-fetch');
const messageEmbeds = xrequire('./modules/messageEmbeds');

cat.execute = async message => {
  const response = await httpFetch('http://aws.random.cat/meow');
  const object = await response.json();

  if (!object.file) {
    return message.channel.send(
      messageEmbeds.reply({
        description: 'The "aws.random.cat" API endpoint seems to be down!\nTry again later!'
      })
    );
  }

  await message.channel.send({ files: [object.file] });
};
