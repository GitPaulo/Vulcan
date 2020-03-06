/**
 * ? Web Servers Ready (Vulcan Event)
 * Happens when both webservers are ready to start listening.
 */

const logger = xrequire('./modules/logger').getInstance();
const hname  = 'localhost';

module.exports = (vulcan) => {
    const {
        webHooks,
        webFiles,
        webClient
    } = vulcan;

    webHooks.listen(webHooks.port, hname,   () => logger.log(`Webhooks server is now listening on port ${webHooks.port}.`));
    webFiles.listen(webFiles.port, hname,   () => logger.log(`Webfiles server is now listening on port ${webFiles.port}.`));
    webClient.listen(webClient.port, hname, () => logger.log(`Webclient server is now listening on port ${webClient.port}.`));
};
