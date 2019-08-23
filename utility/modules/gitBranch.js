const exec    = xrequire('util').promisify(xrequire('child_process').exec);
const command = `git branch`;

module.exports = async () => {
    const { stdout, stderr } = await exec(command);

    if (!stdout || stdout.length <= 0) {
        throw new Error(`Git branch shell command errored!\n\tERROR: ${stderr}`);
    }

    let cut1 = stdout.substring(stdout.indexOf('*') + 1);

    return cut1.substring(0, cut1.indexOf('\n')).trim();
};
