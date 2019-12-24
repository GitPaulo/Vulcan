const exec    = xrequire('util').promisify(xrequire('child_process').exec);
const command = `git status`;

// ! Dependent on consistensty of output of command
module.exports = async () => {
    const { stdout, stderr } = await exec(command);

    if (!stdout || stdout.length <= 0) {
        throw new Error(`Git command errored!\n\tERROR: ${stderr}`);
    }

    let output = stdout.split('\n');

    return {
        branch: output[0].split(' ')[2],
        status: output[1]
    };
};
