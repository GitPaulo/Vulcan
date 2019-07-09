const { performance } = xrequire('perf_hooks');
const logger          = xrequire('./managers/LogManager').getInstance();
const Vulcan          = xrequire('./structures/classes/core/Vulcan');

const t0 = performance.now();

// Disable connect
Vulcan.prototype.connect = () => logger.debug('[DISCORD CONNECT REMOVED DURING LOAD TESTING]');

logger.plain(
    `=======================================\n`
  + `  Vulcan Loading Process Test [START]  \n`
  + `=======================================\n`
);

// Now we can load bot
xrequire('./bot');

logger.plain(
    `=======================================\n`
  + `   Vulcan Loading Process Test [END]   \n`
  + `   Time: ${performance.now() - t0}ms   \n`
  + `=======================================\n`
);

process.exit(0);
