const exec    = xrequire('util').promisify(xrequire('child_process').exec);
const command = `git branch`;

module.exports = async () => {
    const { stdout, stderr } = await exec(command);

    if (!stdout || stdout.length <= 0) {
        throw new Error(`Git branch shell command errored!\n\tERROR: ${stderr}`);
    }

    return stdout.substring(stdout.indexOf('*') + 1).trim();
};
