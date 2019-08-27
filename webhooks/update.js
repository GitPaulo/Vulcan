const { exec }   = xrequire('child_process');
const gitBranch  = xrequire('./utility/modules/gitBranch');
const logger     = xrequire('./managers/LogManager').getInstance();

// Make command dynamic in terms of the machine and branch it is called in.
let command = null;

gitBranch().then((bn) => {
    // Simple sanitize (although i cant see how gitBranch would be modified)
    if (/\s/.test(bn)) {
        throw new Error(`'gitBranch' module should only return one word!`);
    }

    command = (global.isLinux ? 'sudo ' : '') + `git pull origin ${bn}`;
});

/* eslint-disable no-unused-vars */
module.exports = (vulcan, request, response) => {
    if (!command) {
        throw new Error(`The update command was not initialised when a request was received!`);
    }

    // Update presence :)
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
