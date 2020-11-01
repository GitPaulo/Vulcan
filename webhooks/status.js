/* eslint-disable no-unused-vars */
module.exports = async (vulcan, request, response) =>
  JSON.stringify({
    performance: vulcan.performance,
    statistics: vulcan.statistics
  });
