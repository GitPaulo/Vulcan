const { exec } = require('child_process');
const logger   = xrequire('./managers/LogManager').getInstance();
const command  = (global.isLinux ? 'sudo ' : '') + 'git pull origin master';

/* eslint-disable no-unused-vars */
module.exports = (vulcan, request, response) => {
    vulcan.presenceManager.useUpdating();

    exec(command, (err, stdout, stderr) => {
        if (err) {
            return logger.error(`Could execute command: ${command}\n\tError: ${err.message}`);
        }

        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        logger.log(`Successfully fetched updates from git repository!`);

        setTimeout(() => {
            vulcan.presenceManager.switchToPrevious();
        }, 5000);

        return stdout;
    });
};
