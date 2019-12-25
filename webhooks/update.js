const gitBranch = xrequire('./utility/modules/gitBranch');
const logger    = xrequire('./managers/LogManager').getInstance();
const exec      = xrequire('util').promisify(xrequire('child_process').exec);

/* eslint-disable no-unused-vars */
module.exports = async (vulcan, request, response) => {
    const output     = await gitBranch();
    const branchName = output.branch;

    // Simple sanitize (although i can't see how gitBranch would be modified)
    if (/\s/.test(branchName)) {
        throw new Error(`'gitBranch' module should only return one word for the branch name!`);
    }

    const command = (global.isLinux ? 'sudo ' : '')
        // * We need to make sure we perform a full update! (Packages may change)
        + `git pull origin ${branchName} && rm -f package-lock.json && rm -f -rf node_modules && npm install`;

    // Update presence :)
    vulcan.presenceManager.useUpdating();

    try {
        let { stdout, stderr } = await exec(command);

        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        logger.log(`Successfully fetched updates from git repository!`);
        vulcan.presenceManager.switchToPrevious();
    } catch (err) {
        return `Update failed: ${err.message}`;
    }

    return 'Update completed!';
};
