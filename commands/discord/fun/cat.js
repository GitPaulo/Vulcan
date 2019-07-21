const cat     = module.exports;
const request = require('request-promise');

cat.execute = async (message) => {
    const URL = JSON.parse(await request('http://aws.random.cat/meow')).file;

    await message.channel.send({ files: [URL] });
};
