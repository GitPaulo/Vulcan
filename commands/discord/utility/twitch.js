const twitch = module.exports;
const httpFetch = xrequire('node-fetch');
const messageEmbeds = xrequire('./modules/messageEmbeds');
const settings = xrequire('./prerequisites/settings');
// const logger     = xrequire('./modules/logger').getInstance();

// TODO - Improve! Add more functionality and prettier embeds :)
/* eslint-disable no-unused-vars */
twitch.load = (descriptor, packages) => {
  this.endpoint = 'http://api.twitch.tv/helix';
  this.id = settings.credentials.OAuth.twitch.id;
  this.secret = settings.credentials.OAuth.twitch.secret;
};

twitch.execute = async message => {
  const scmd = message.parsed.args[0];
  const embedWrap = messageEmbeds.reply({
    message,
    title: `**Twitch** request received: **${scmd}**`,
    fields: [
      {
        name: 'Subcommand',
        value: message.parsed.args.join(', ')
      },
      {
        name: 'Output',
        value: 'Processing...'
      }
    ]
  });

  switch (scmd) {
    case 'tg':
    case 'topgames': {
      const num = message.parsed.args[1];

      if (isNaN(num)) {
        return message.client.emit('commandMisused', message, `Expected number as first argument for this subcommand!`);
      }

      const topList = await this.topGames(num);
      let listString = `=====[ Top ${num} Live Twitch Games ]=====\n`;
      let position = 1;

      // Build list string
      topList.forEach(gameObject => {
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
          'commandMisused',
          message,
          `Expected number as first argument for this subcommand!`
        );
      }

      const topList = await this.topStreams(num);
      let listString = `=====[ Top ${num} Live Twitch Streamers ]=====\n`;
      let position = 1;

      // Build list string
      topList.forEach(streamObject => {
        listString += `\n#${position++} => [${streamObject.user_name}]\n`;
        listString += `Stream Title: ${streamObject.title}\n`;
        listString += `Viewer Count: ${streamObject.viewer_count}\n`;
        listString += `Stream Start: ${streamObject.started_at}\n`;
      });

      embedWrap.embed.fields[1].value = '```' + listString + '```';
      break;
    }
    default: {
      return message.client.emit('commandMisused', message, `Invalid twitch subcommand: ${scmd}`);
    }
  }

  await message.channel.send(embedWrap);
};

twitch.topStreams = async num => {
  if (num > 100 || num < 0) {
    throw new Error(`Number of requested streams is limited from 0-100 by the API. Received: ${num}`);
  }

  const response = await httpFetch(`${this.endpoint}/streams?first=${num}`, {
    headers: {
      'Client-ID': this.id
    }
  });

  return JSON.parse(response).data;
};

twitch.topGames = async num => {
  if (num > 100 || num < 0) {
    throw new Error(`Number of requested games is limited from 0-100 by the API. Received: ${num}`);
  }

  const response = await httpFetch(`${this.endpoint}/games/top?first=${num}`, {
    headers: {
      'Client-ID': this.id
    }
  });

  return JSON.parse(response).data;
};
