const request = xrequire('request-promise');

module.exports.post = async (optionsOrPayload) => {
    const data = typeof options === 'object'
        ? optionsOrPayload
        : {
            method: 'POST',
            uri   : 'https://www.hastebin.com/documents',
            body  : optionsOrPayload
        };

    return `http://www.hastebin.com/${JSON.parse(await request(data)).key}`;
};
