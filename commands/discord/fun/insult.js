const insult      = module.exports;
const httpFetch   = xrequire('node-fetch');
const apiEndpoint = `http://insult.mattbas.org/api/insult`;

insult.execute = async (message) => {
    const target   = message.parsed.argsString || `<@${message.author.id}>`;
    const response = await httpFetch(`${apiEndpoint}?who=`);
    const text     = await response.text();
    const insult   = `${target}${text}!`;

    await message.channel.send(insult);
};
