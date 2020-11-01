const lolroulette = module.exports;
const httpFetch = xrequire('node-fetch');
const messageEmbeds = xrequire('./modules/messageEmbeds');

/*
*   This command is reliant on the structure and uptime of 'http://ddragon.leagueoflegends.com/'
?   All data is web scrapped.
*/

/* eslint-disable no-unused-vars */
lolroulette.load = async (descriptor, packages) => {
  const response = await httpFetch('https://ddragon.leagueoflegends.com/cdn/9.24.2/data/en_GB/champion.json', {
    // Header required or else 403
    headers: {
      agent: 'node.js'
    }
  });

  this.cache = (await response.json()).data;
};

lolroulette.execute = async message => {
  const champions = Object.keys(this.cache);
  const champion = this.cache[champions.random()];

  const mWrap = messageEmbeds.reply({
    message,
    description: `<@${message.author.id}>'s champion hero will be: **${champion.id}**`,
    image: {
      url: `http://ddragon.leagueoflegends.com/cdn/9.24.2/img/champion/${champion.image.full}`
    }
  });

  await message.channel.send(mWrap);
};
