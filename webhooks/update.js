const { exec }  = xrequire('child_process');
const gitBranch = xrequire('./utility/modules/gitBranch');
const logger    = xrequire('./managers/LogManager').getInstance();

/* eslint-disable no-unused-vars */
module.exports = (vulcan, request, response) => {
    gitBranch().then((output) => {
        const branchName = output.branch;

        // Simple sanitize (although i can't see how gitBranch would be modified)
        if (/\s/.test(branchName)) {
            throw new Error(`'gitBranch' module should only return one word for the branch name!`);
        }

        const command = (global.isLinux ? 'sudo ' : '') + `git pull origin ${branchName}`;

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
    });
};
