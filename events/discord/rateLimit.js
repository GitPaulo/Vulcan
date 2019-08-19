const logger = xrequire('./managers/LogManager').getInstance();

module.exports = (
    {
        timeout,
        limit,
        method,
        path,
        route
    }
) => {
    logger.warning(
        `Rate limit has been reached.\n`
        + `\tTimeout: ${timeout}\n`
        + `\tLimit: ${limit}\n`
        + `\tMethods: ${method}\n`
        + `\tPath: ${path}\n`
        + `\tRoute: ${route}`
    );
};
