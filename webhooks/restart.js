const { exec } = require('child_process');
const logger   = xrequire('./managers/LogManager').getInstance();

const command = (global.isLinux ? 'sudo ' : '') + 'npm run production:restart';

module.exports = (vulcan, request, response) =>
    exec(command, (err, stdout, stderr) =>
        logger.error(`Could not execute webhook command: ${command}\n\tError: ${err.message}\n\tstdout: ${stdout}\n\tstdin: ${stderr}`));
