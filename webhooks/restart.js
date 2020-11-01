const { exec } = xrequire('child_process');
const pexec = xrequire('util').promisify(exec);
const logger = xrequire('./modules/logger').getInstance();

// Commands
const pm2Check = 'npm run production:exists';
const pm2Restart = 'npm run production:restart';
const regularRS = 'npm run start';

// TODO: Improve this:
//      - Test on all platforms, test without pm2
/* eslint-disable no-unused-vars */
module.exports = async (vulcan, request, response) => {
  const sudoPre = global.isLinux ? 'sudo ' : '';
  let isPM2 = true;

  try {
    await pexec(sudoPre + pm2Check);
  } catch (err) {
    isPM2 = false;
  }

  let output;

  try {
    // ! Depends on pm2's output
    if (isPM2) {
      output = await pexec(sudoPre + pm2Restart);
    } else {
      // ? no PM2 running
      logger.debug(`
                PM2 process not found, spwaning a new process and shuting down current one.
            `);

      // Kill process if successfull
      output = await pexec(regularRS);
    }
  } catch (err) {
    return err.message;
  }

  // Print output
  const { stdout, sterr } = output;

  logger.plain(stdout);
  logger.plain(sterr);

  // Wait a bit, then kill
  setTimeout(() => {
    process.exit(0, 'Vulcan process restarting.');
  }, 500);

  return 'Restarted vulcan process!';
};
