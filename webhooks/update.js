const { exec } = require('child_process');
const logger   = xrequire('./managers/LogManager').getInstance();

const command = 'git pull origin master';

module.exports = (request, response) => exec(command, (err, stdout, stderr) => {
    if (err) {
        return logger.error(`Could execute command: ${command}\n\tError: ${err.message}`);
    }

    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);

    logger.log(`Successfully fetched updates from git repository!`);
});
