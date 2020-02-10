const fgoservant      = module.exports;
const cheerio         = xrequire('cheerio');
const request         = xrequire('request-promise');
const messageEmbeds   = xrequire('./modules/standalone/messageEmbeds');
const stringFunctions = xrequire('./modules/standalone/stringFunctions');

/*
*   This command is reliant on the structure and uptime of 'http://grandorder.wiki'
?   All data is web scrapped.
*/

const wikiTableExtractor = (html, cache, baseURL) => {
    const lbRgx   = /(\r\n|\n|\r)/gm;

    // ? Fetch and sort JP first
    let $_JP         = cheerio.load(html);
    let servantTable = $_JP('table.wikitable.sortable').find('tr');
    let columns      = [];

    servantTable.each((i, rowElement) => {
        rowElement = $_JP(rowElement);

        // Fill in columns first
        if (i === 0) {
            rowElement.find('th').each((_, columnElement) => {
                columnElement = $_JP(columnElement);
                columns.push(columnElement.text().toLowerCase().replace(' ', '_').replace(lbRgx, ''));
            });
        }

        // Now build servants
        let servant = {};

        rowElement.find('td').each((j, columnElement) => {
            columnElement = $_JP(columnElement);

            let textData   = columnElement.text().replace(lbRgx, '');
            let maybeImage = columnElement.find('img').first().prop('src');
            let maybeLabel = columnElement.find('a').first().text();

            if (maybeImage) {
                textData += `${baseURL}${maybeImage}`;
            }

            if (maybeLabel) {
                // Hack for the name :)
                textData = (j === 2) ? maybeLabel : textData + maybeLabel;
            }

            // We can't use images for class
            if (j === 3) {
                let end   = textData.lastIndexOf('_');
                let start = textData.nthOccurrenceOf('_', 5) + 1;

                textData = textData.substring(start, end);
            }

            // We can't use images for np
            if (j === 10) {
                let li = textData.lastIndexOf('_');

                textData = textData.substring(li + 1, textData.length - 4);
            }

            servant[columns[j]] = textData;
        });

        // For now, only link to pages
        servant['card_art'] = [
            `${baseURL}/File:Portrait_Servant_${servant.id}_1.png`,
            `${baseURL}/File:Portrait_Servant_${servant.id}_2.png`,
            `${baseURL}/File:Portrait_Servant_${servant.id}_3.png`,
            `${baseURL}/File:Portrait_Servant_${servant.id}_4.png`,
            `${baseURL}/File:Portrait_Servant_${servant.id}_F.png`
        ];

        servant.sprites = [
            `${baseURL}/File:Sprite_Servant_${servant.id}_1.png`,
            `${baseURL}/File:Sprite_Servant_${servant.id}_2.png`,
            `${baseURL}/File:Sprite_Servant_${servant.id}_3.png`
        ];

        // Add to JP cache by name
        cache.set(servant.name, servant);
    });
};

/* eslint-disable no-unused-vars */
fgoservant.load = async (commandDescriptor) => {
    const baseURL = 'http://grandorder.wiki';
    const htmlJP  = await request(`${baseURL}/Servant_List`);
    const htmlEN  = await request(`${baseURL}/Servant_List/EN`);
    const cache   = new Map();

    // Set cache per region
    cache.set('JP', new Map());
    cache.set('EN', new Map());

    // 'shorten' code - lol
    wikiTableExtractor(htmlJP, cache.get('JP'), baseURL);
    wikiTableExtractor(htmlEN, cache.get('EN'), baseURL);

    this.cache = cache;
};

fgoservant.execute = async (message) => {
    const region = (message.parsed.args[0] || '').toUpperCase();

    if (!(region === 'JP' || region === 'EN')) {
        return message.client.emit(
            'invalidCommandUsage',
            message,
            `The first argument needs to be a valid region.\n\tRegions: JP/EN`
        );
    }

    if (message.parsed.args.length <= 1) {
        return message.client.emit(
            'invalidCommandUsage',
            message,
            `Second argument must be a valid string.`
        );
    }

    const input        = message.parsed.args.slice(1).join(' ');
    const regionCache  = this.cache.get(region);
    const servantNames = regionCache.keys();

    // ? Find servant name that is most similar
    let mostSimilarName  = '';
    let mostSimilarValue = 0;
    let iteratorValue    = servantNames.next();

    while (!iteratorValue.done) {
        let name            = (iteratorValue.value || '');
        let similarityValue = stringFunctions.levenshtein(input.toLowerCase(), name.toLowerCase());

        if (similarityValue > mostSimilarValue) {
            mostSimilarValue = similarityValue;
            mostSimilarName  = name;
        }

        iteratorValue = servantNames.next();
    }

    // Finally, get the servant-kun-chan
    const servant = regionCache.get(mostSimilarName);

    // Output-kun
    const mWrap = messageEmbeds.reply(
        {
            message,
            description: `Your servant: ${servant.name}(${servant.rarity})`,
            thumbnail  : {
                url: servant.icon
            },
            image: {
                url: servant.command_cards
            },
            fields: [
                {
                    name  : `Attack (min)`,
                    value : servant.min_atk,
                    inline: true
                },
                {
                    name  : `Attack (max)`,
                    value : servant.max_atk,
                    inline: true
                },
                {
                    name  : `HP (min)`,
                    value : servant.min_hp,
                    inline: true
                },
                {
                    name  : `HP (max)`,
                    value : servant.min_hp,
                    inline: true
                },
                {
                    name  : `Class`,
                    value : servant.class,
                    inline: true
                },
                {
                    name  : `NP`,
                    value : servant.np,
                    inline: true
                }
            ]
        }
    );

    // Remove default reply icon
    mWrap.files = [];

    await message.channel.send(mWrap);
};
