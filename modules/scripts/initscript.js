const logger = xrequire('./managers/LogManager').getInstance();

process.on('unhandledRejection', (err) => {
    logger.error(err.shortMessage());
    throw err;
});
