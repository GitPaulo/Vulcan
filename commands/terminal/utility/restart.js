const restart  = module.exports;
const { exec } = require('child_process');
const logger   = xrequire('./managers/LogManager').getInstance();

// eslint-disable-next-line no-unused-vars
restart.execute = (line) => {
    const command = (global.isLinux ? 'sudo ' : '') + 'npm run production:restart';

    exec(command, (err, stdout, stderr) => {
        if (err) {
            return logger.error(`Could not execute terminal restart using cmd: ${command}.\n\tError: ${err.message}`);
        }

        logger.warning(`Terminal restart command triggered.`);
        logger.debug(`STDOUT: ${stdout}\nSTDERR: ${stderr}`);
    });
};
