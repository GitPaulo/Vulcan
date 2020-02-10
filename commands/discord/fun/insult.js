const insult        = module.exports;
const request       = xrequire('request-promise');
const apiEndpoint   = `http://insult.mattbas.org/api/insult`;
// const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');

insult.execute = async (message) => {
    const target = message.parsed.argsString || `<@${message.author.id}>`;
    const insult = `${target}${await request(`${apiEndpoint}?who=`)}!`;

    await message.channel.send(insult);
};
