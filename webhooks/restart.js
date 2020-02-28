const { exec, spawn } = xrequire('child_process');
const pexec           = xrequire('util').promisify(exec);
const logger          = xrequire('./modules/logger').getInstance();

// Commands
const pm2Check   = 'npm run production:exists';
const pm2Restart = 'npm run production:restart';
const regularRS  = 'npm run start';

// TODO: Improve this:
//      - Test on all platforms, test without pm2
/* eslint-disable no-unused-vars */
module.exports = async (vulcan, request, response) => {
    const sudoPre = (global.isLinux ? 'sudo ' : '');
    let isPM2     = true;

    // Catch for PM2 check
    try {
        await pexec(sudoPre + pm2Check);
    } catch (err) {
        isPM2 = false;
    }

    // Catch for retart commands
    try {
        // ! Depends on pm2's output
        if (isPM2) {
            let { stdout, sterr } = await pexec(sudoPre + pm2Restart);

            logger.plain(stdout);
            logger.plain(sterr);
        } else { // ? no PM2 running
            logger.debug('PM2 process not found, spwaning a new process and shuting down current one.');

            console.log(process.argv[1], process.argv.slice(2));

            const subprocess = spawn(
                regularRS,
                process.argv.slice(2),
                {
                    detached: true
                }
            );

            subprocess.unref();
        }
    } catch (err) {
        return err.message;
    }

    // Wait a bit
    setTimeout(() => {
        process.exit(0, 'Vulcan process restarting.');
    }, 1000);

    return 'Restarted vulcan process!';
};
