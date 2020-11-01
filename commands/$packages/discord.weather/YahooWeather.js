const OAuth = xrequire('./modules/oauth-promise');

const yahooWeather = (module.exports = function (id, key, secret) {
  if (typeof id !== 'string') {
    return new Error(`Invalid client id. Must be a string.`);
  }

  if (typeof key !== 'string') {
    return new Error(`Invalid client key. Must be a string.`);
  }

  if (typeof secret !== 'string') {
    return new Error(`Invalid client secret. Must be a string.`);
  }

  // Properties
  this.appID = id;
  this.key = key;
  this.secret = secret;
  this.unitType = 'u=c';
  this.format = 'format=json';
  this.baseURL = 'http://weather-ydn-yql.media.yahoo.com/forecastrss?';
  this.request = new OAuth.OAuth(null, null, key, secret, '1.0', null, 'HMAC-SHA1', null, {
    'X-Yahoo-App-Id': id
  });
});

yahooWeather.prototype.useImperialSystem = function () {
  this.unitType = 'u=f';
};

yahooWeather.prototype.useMetricSystem = function () {
  this.unitType = 'u=c';
};

yahooWeather.prototype.getUnitSystemName = function () {
  return (this.unitType === 'u=f' && 'Imperial') || 'Metric';
};

yahooWeather.prototype.forecast = async function ({ location, coordinates, id }, date) {
  let baseURL = this.baseURL;

  if (location) {
    baseURL += `location=${location}&`;
  }

  if (coordinates) {
    baseURL += `lat=${coordinates.lat}&lon=${coordinates.lon}&`;
  }

  if (id) {
    baseURL += `woeid=${id}&`;
  }

  // Extras
  baseURL += `&${this.unitType}&${this.format}`;

  const response = await this.request.get(baseURL, null, null);

  let responseObject = JSON.parse(response[0]);

  if (date) {
    responseObject = Object.filter(responseObject, value => value === date);
  }

  return responseObject;
};
