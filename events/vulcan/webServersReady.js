/**
 * ? Web Servers Ready (Vulcan Event)
 * Happens when both webservers are ready to start listening.
 */

const logger = xrequire('./modules/logger').getInstance();

module.exports = (webFiles, webHooks) => {
    webHooks.listen(() => logger.log('Webhooks server is now listening.'));
    webFiles.listen(() => logger.log('Webfiles server is now listening.'));
};
