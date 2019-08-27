const { exec }   = xrequire('child_process');
const gitBranch  = xrequire('./utility/modules/gitBranch');
const logger     = xrequire('./managers/LogManager').getInstance();
const branchName = gitBranch();

// Simple sanitize (although i cant see how gitBranch would be modified)
if (/\s/.test(branchName)) {
    throw new Error(`'gitBranch' module should only return one word!`);
}

let command = (global.isLinux ? 'sudo ' : '') + `git pull origin ${branchName}`;

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
