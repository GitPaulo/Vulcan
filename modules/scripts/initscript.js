const logger = xrequire('./managers/logManager').getInstance();

process.on('unhandledRejection', (err) => {
    logger.error(err.shortMessage());
    throw err;
});
