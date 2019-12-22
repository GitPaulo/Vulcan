const lolroulette   = module.exports;
const request       = xrequire('request-promise');
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

lolroulette.loadChampionData = async () => {
    const result = await request(
        'https://ddragon.leagueoflegends.com/cdn/9.24.2/data/en_GB/champion.json',
        {
            headers: // Header required or else 403
            {
                'user-agent': 'node.js'
            }
        }
    );

    this.cache = JSON.parse(result).data;
};

/* eslint-disable no-unused-vars */
lolroulette.load = (commandDescriptor) => {
    this.loadChampionData();
};

lolroulette.execute = async (message) => {
    if (!this.cache) {
        return message.client.emit(
            'channelWarning',
            message.channel,
            `Please wait. Smite god cache is still loading!`
        );
    }

    const champions = Object.keys(this.cache);
    const champion  = this.cache[champions.random()];

    const mWrap = messageEmbeds.reply(
        {
            message,
            description: `<@${message.author.id}>'s champion hero will be: **${champion.id}**`,
            image      : {
                url: `http://ddragon.leagueoflegends.com/cdn/9.24.2/img/champion/${champion.image.full}`
            }
        }
    );

    await message.channel.send(mWrap);
};
