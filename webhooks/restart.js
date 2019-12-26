const exec = xrequire('util').promisify(xrequire('child_process').exec);
// const logger = xrequire('./managers/LogManager').getInstance();

// TODO Check for git branches?
/* eslint-disable no-unused-vars */
module.exports = async (vulcan, request, response) => {
    const command = (global.isLinux ? 'sudo ' : '') + 'npm run production:restart';

    try {
        // eslint-disable-next-line prefer-const
        let { stdout, sterr } = await exec(command);
    } catch (err) {
        return `Restart failed: ${err.message}\n[PM2 is required for a restart!]`;
    }

    // ? u'll never see this guy
    return 'Restarted vulcam!';
};
