/* eslint-disable no-unused-vars */
const rule34        = module.exports;
const cheerio       = xrequire('cheerio');
const request       = xrequire('request-promise');
const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');
const baseURL       = 'https://rule34.xxx/index.php?page=post&s=list&tags=';

// TODO: FINISH THIS
rule34.execute = async (message) => {
    const query = message.parsed.argsString;
};
