const weather       = module.exports;
const yahooWeather  = xrequire('./modules/yahooWeather');
const messageEmbeds = xrequire('./modules/messageEmbeds');
const settings      = xrequire('./prerequisites/settings');

// eslint-disable-next-line no-unused-vars
weather.load = (descriptor, packages) => {
    let options = settings.credentials.OAuth.yahooWeather;

    this.api = new yahooWeather(
        options.appid,
        options.id,
        options.secret
    );
};

weather.execute = async (message) => {
    const regionCode = message.parsed.args[0];

    if (!regionCode) {
        return message.client.emit(
            'commandMisused',
            message,
            `You are required to specify a \`regionCode\` for the weather query.\n\tExample: \`london,uk\`!`
        );
    }

    let displayedDates = null;
    const timePeriod   = message.parsed.args[1] || 'today';
    const {
        location,
        // eslint-disable-next-line camelcase
        current_observation,
        forecasts
    } = await this.api.forecast({ location: regionCode });

    // eslint-disable-next-line camelcase
    const observation = current_observation;

    if (timePeriod === 'today') {
        displayedDates = forecasts[0];
    } else if (timePeriod === 'tomorrow') {
        displayedDates = forecasts[1];
    } else if (timePeriod === 'week') {
        displayedDates = forecasts;
    } else {
        return message.client.emit(
            'commandMisused',
            message,
            `Invalid date specifier.\n\tExample: \`tomorrow\`!`
        );
    }

    const mWrap = messageEmbeds.reply(
        {
            message,
            title : `Weather Forecast`,
            fields: [
                {
                    name  : 'Country/Region/City',
                    value : `${location.country}/${location.region}/${location.city}`,
                    inline: true
                },
                {
                    name  : 'Unit System',
                    value : `${this.api.getUnitSystemName()}`,
                    inline: true
                },
                {
                    name : 'Wind',
                    value: `Speed of ${observation.wind.speed} and direction of ${observation.wind.direction}.`
                },
                {
                    name : 'Atmosphere',
                    value: `Humidity of ${observation.atmosphere.humidity} and visibility of ${observation.atmosphere.visibility} with pressure ${observation.atmosphere.pressure}.`
                },
                {
                    name : 'Astronomy',
                    value: `Sun rise is at ${observation.astronomy.sunrise} and sunset ${observation.astronomy.sunset}.`
                },
                {
                    name : 'Condition',
                    value: `Temperature of ${observation.condition.temperature}. The condition is ${observation.condition.text}.`
                },
                {
                    name : `Forecast (${timePeriod})`,
                    value: `\`\`\`js\n${JSON.stringify(displayedDates)}\`\`\``
                }
            ]
        }
    );

    await message.channel.send(mWrap);
};
