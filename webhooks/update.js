const { exec } = require('child_process');
const logger   = xrequire('./managers/LogManager').getInstance();

// ? Make sure we pull from production branch!
const command = (global.isLinux ? 'sudo ' : '') + 'git pull origin production';

/* eslint-disable no-unused-vars */
module.exports = (vulcan, request, response) => vulcan.presenceManager.useUpdating(), exec(command, (err, stdout, stderr) => {
    if (err) {
        return logger.error(`Could not execute command: ${command}\n\tError: ${err.message}`);
    }

    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);

    logger.log(`Successfully fetched updates from git repository!`);
});
