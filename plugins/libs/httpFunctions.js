// const http        = xrequire('http');
// const requestSync = xrequire('request');
const request = xrequire('request-promise');

const httpFunctions = module.exports = {};

httpFunctions.requestYoutubeData = async (id) => {
    const youtubePrefix = 'www.youtube.com/watch?v=';

    if (!id.includes(youtubePrefix))
      id = youtubePrefix + id;

    const fetchUrl = `http://www.youtube.com/oembed?url=${id}&format=json`;
    const response = await request(fetchUrl);

    return response;
};
