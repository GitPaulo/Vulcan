const { exec } = require('child_process');
const logger   = xrequire('./managers/LogManager').getInstance();

const command = 'npm run restart';

module.exports = (request, response) =>
    exec(command, (err, stdout, stderr) =>
        logger.error(`Could execute command: ${command}\n\tError: ${err.message}`));
