const { exec } = xrequire('child_process');
const logger   = xrequire('./managers/LogManager').getInstance();

// TODO Check for git branches?
/* eslint-disable no-unused-vars */
module.exports = (vulcan, request, response) => {
    const command = (global.isLinux ? 'sudo ' : '') + 'npm run production:restart';

    exec(command, (err, stdout, stderr) =>
        logger.error(`Could not execute webhook command: ${command}\n\tError: ${err.message}\n\tstdout: ${stdout}\n\tstdin: ${stderr}`));
};
