const update  = module.exports;
const command = (global.isLinux ? 'sudo ' : '') + 'git pull origin master';

const { exec } = require('child_process');
const logger   = xrequire('./modules/logger').getInstance();

// eslint-disable-next-line no-unused-vars
update.execute = (line) => {
    const vulcan = this.command.client;

    vulcan.presenceManager.useUpdating();

    exec(command, (err, stdout, stderr) => {
        if (err) {
            return logger.error(`Could not execute terminal restart using cmd: ${command}.\n\tError: ${err.message}`);
        }

        logger.warning(`Terminal restart command triggered.`);
        logger.debug(`STDOUT: ${stdout}\nSTDERR: ${stderr}`);

        setTimeout(() => {
            vulcan.presenceManager.switchToPrevious();
        }, 5000);
    });
};
