const overwatchroulette = module.exports;
const cheerio = xrequire('cheerio');
const httpFetch = xrequire('node-fetch');
const messageEmbeds = xrequire('./modules/messageEmbeds');

/*
*   This command is reliant on the structure and uptime of 'http://www.overbuff.com/heroes'
?   All data is web scrapped.
*/

/* eslint-disable no-unused-vars */
overwatchroulette.load = async (descriptor, packages) => {
  const response = await httpFetch('http://www.overbuff.com/heroes');
  const html = await response.text();
  const $ = cheerio.load(html);
  const heroTable = $('.table-data tbody tr');
  const cache = new Map();

  cache.set('ALL', []);

  heroTable.each((i, element) => {
    const el1 = $(element).find('.cell-medium span');
    let heroName = el1.find('a').text();
    let typeName = el1.find('small').text().toLowerCase();

    const el2 = $(element).find('.cell-icon-small a div img');
    let imgURL = `http://www.overbuff.com/${el2.attr('src')}`;

    const hero = { name: heroName, type: typeName, icon: imgURL };
    const heroArray = cache.get(typeName);

    // Categories
    if (heroArray) {
      heroArray.push(hero);
    } else {
      cache.set(typeName, [hero]);
    }

    // ALL
    cache.get('ALL').push(hero);
  });

  this.cache = cache;
};

overwatchroulette.execute = async message => {
  let role = message.parsed.args[0] || 'ALL';

  // Pls overbuff...
  if (role.toLowerCase() === 'dps') {
    role = 'offense';
  }

  const heroArray = this.cache.get(role);

  if (!heroArray) {
    return message.client.emit('channelWarning', message.channel, `Invalid hero type!`);
  }

  const hero = heroArray.random();
  const mWrap = messageEmbeds.reply({
    message,
    description: `<@${message.author.id}>'s overwatch hero will be: **${hero.name}**`,
    image: {
      url: hero.icon
    }
  });

  await message.channel.send(mWrap);
};
