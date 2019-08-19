const { exec } = require('child_process');
const logger   = xrequire('./managers/LogManager').getInstance();

const command = (global.isLinux ? 'sudo ' : '') + 'git pull origin master';

/* eslint-disable no-unused-vars */
module.exports = (request, response) => exec(command, (err, stdout, stderr) => {
    if (err) {
        return logger.error(`Could execute command: ${command}\n\tError: ${err.message}`);
    }

    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);

    logger.log(`Successfully fetched updates from git repository!`);
});
