module.exports = (vulcan, request, response) => JSON.stringify(
    {
        performance: vulcan.performance,
        statistics : vulcan.statistics
    }
);
