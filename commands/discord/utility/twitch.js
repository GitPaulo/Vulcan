const twitch        = module.exports;
const request       = xrequire('request-promise');
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');
// const logger     = xrequire('./managers/LogManager').getInstance();

// TODO - Improve! Add more functionality and prettier embeds :)
/* eslint-disable no-unused-vars */
twitch.load = (commandDescriptor) => {
    this.endpoint = 'https://api.twitch.tv/helix';
    this.id       = this.command.client.credentials.OAuth.twitch.id;
    this.secret   = this.command.client.credentials.OAuth.twitch.secret;
};

twitch.execute = async (message) => {
    const scmd      = message.parsed.args[0];
    const embedWrap = messageEmbeds.reply({
        message,
        title : `**Twitch** request received: **${scmd}**`,
        fields: [
            {
                name : 'Subcommand',
                value: message.parsed.args.join(', ')
            },
            {
                name : 'Output',
                value: 'Processing...'
            }
        ]
    });

    switch (scmd) {
        case 'tg':
        case 'topgames': {
            const num = message.parsed.args[1];

            if (isNaN(num)) {
                return message.client.emit(
                    'invalidCommandUsage',
                    message,
                    `Expected number as first argument for this subcommand!`
                );
            }

            const topList  = await this.topGames(num);
            let listString = `=====[ Top ${num} Live Twitch Games ]=====\n`;
            let position   = 0;

            // Build list string
            topList.forEach((gameObject) => {
                listString += `\n#${position++} => [${gameObject.name}]\n`;
                listString += `Game ID: ${gameObject.id}\n`;
            });

            embedWrap.embed.fields[1].value = '```' + listString + '```';
            break;
        }
        case 'ts':
        case 'topstreams': {
            const num = message.parsed.args[1];

            if (isNaN(num)) {
                return this.command.client.emit(
                    'invalidCommandUsage',
                    message,
                    `Expected number as first argument for this subcommand!`
                );
            }

            const topList  = await this.topStreams(num);
            let listString = `=====[ Top ${num} Live Twitch Streamers ]=====\n`;
            let position   = 0;

            // Build list string
            topList.forEach((streamObject) => {
                listString += `\n#${position++} => [${streamObject.user_name}]\n`;
                listString += `Stream Title: ${streamObject.title}\n`;
                listString += `Viewer Count: ${streamObject.viewer_count}\n`;
                listString += `Stream Start: ${streamObject.started_at}\n`;
            });

            embedWrap.embed.fields[1].value = '```' + listString + '```';
            break;
        }
        default: {
            return message.client.emit(
                'invalidCommandUsage',
                message,
                `Invalid twitch subcommand: ${scmd}`
            );
        }
    }

    await message.channel.send(embedWrap);
};

twitch.topStreams = async (num) => {
    if (num > 100 || num < 0) {
        throw new Error(`Number of requested streams is limited from 0-100 by the API. Received: ${num}`);
    }

    const requestData = {
        uri    : `${this.endpoint}/streams?first=${num}`,
        headers: {
            'Client-ID': this.id
        }
    };

    const response = await request(requestData);

    return JSON.parse(response).data;
};

twitch.topGames = async (num) => {
    if (num > 100 || num < 0) {
        throw new Error(`Number of requested games is limited from 0-100 by the API. Received: ${num}`);
    }

    const requestData = {
        uri    : `${this.endpoint}/games/top?first=${num}`,
        headers: {
            'Client-ID': this.id
        }
    };

    const response = await request(requestData);

    return JSON.parse(response).data;
};
