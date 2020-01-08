const smiteroulette = module.exports;
const request       = xrequire('request-promise');
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

/**
 * Note: This command is dependent on endpoint: 'http://cms.smitegame.com/wp-json/smite-api/all-gods/1'
 */
smiteroulette.loadGodCache = async () => {
    const result = await request('http://cms.smitegame.com/wp-json/smite-api/all-gods/1');
    const gods   = JSON.parse(result);
    const cache  = new Map();

    const dynamicInsert = (god, key) => {
        god[key]        = god[key].toLowerCase().trim(); // ok hirez!
        const dataArray = cache.get(god[key]);

        if (dataArray) {
            dataArray.push(god);
        } else {
            cache.set(god[key], [god]);
        }
    };

    cache.set('ALL', gods);

    for (let god of gods) {
        // Make map entry with pantheon
        dynamicInsert(god, 'pantheon');

        // Make map entry with role
        dynamicInsert(god, 'role');

        // Make map entry with types (Ranged, magical, ...)
        // They come in a string cuz why not hirez
        const types = god.type.split(',');

        for (let i = 0; i < types.length; i++) {
            const newKey   = 'type' + i;

            god[newKey] = types[i].trim();
            dynamicInsert(god, newKey);
        }
    }

    this.cache = cache;
};

/* eslint-disable no-unused-vars */
smiteroulette.load = (commandDescriptor) => {
    smiteroulette.loadGodCache();
};

smiteroulette.execute = async (message) => {
    if (!this.cache) {
        return message.client.emit(
            'channelWarning',
            message.channel,
            `Please wait. Smite god cache is still loading!`
        );
    }

    const input    = message.parsed.args;
    let   selector = null;
    let   sarray   = null;

    if (input.length <= 0) {
        selector = 'ALL';
        sarray   = this.cache.get(selector);
    } else { // Get intersection of selectors
        const selectors = input;

        sarray = [];

        for (let subselector of selectors) {
            const ssarray = this.cache.get(subselector);

            sarray  = sarray.length <= 0 ? ssarray : sarray.intersection(ssarray);
        }

        selector = message.parsed.argsString;
    }

    if (!sarray) {
        return message.client.emit(
            'channelWarning',
            message.channel,
            `Invalid smite roulette selector! (Must be valid pantheon/class)`
        );
    }

    if (sarray.length <= 0) {
        return message.client.emit(
            'channelWarning',
            message.channel,
            `Could not find any gods with selector: **'${selector}'**`
        );
    }

    const god   = sarray.random();
    const mWrap = messageEmbeds.reply(
        {
            message,
            description: `<@${message.author.id}>'s smite god will be: **${god.name} (${god.title})**\n\t Selector: **${selector}**`,
            image      : {
                url: god.card
            }
        }
    );

    await message.channel.send(mWrap);
};
