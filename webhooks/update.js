const gitBranch = xrequire('./modules/gitBranch');
const logger = xrequire('./modules/logger').getInstance();
const exec = xrequire('util').promisify(xrequire('child_process').exec);

// Update Command Sequence
const updateCommands = ['git pull origin', 'rm -f package-lock.json', 'rm -f -rf node_modules', 'npm install'];

/* eslint-disable no-unused-vars */
// TODO: Make sure bot is useable while update or npm install?
module.exports = async (vulcan, request, response) => {
  const output = await gitBranch();
  const branchName = output.branch;

  // Return
  let exitString = 'Updated sequence was succesfull.';

  // Simple sanitize (although i can't see how gitBranch would be modified)
  if (/\s/.test(branchName)) {
    throw new Error(`'gitBranch' module should only return one word for the branch name!`);
  }

  // Log start
  logger.log('Vulcan remote update sequence started.');

  // Update presence :)
  vulcan.presenceManager.useUpdating();

  try {
    for (let command of updateCommands) {
      logger.log(`Update command executing: ${command}`);

      // ? Dynamically add branch name to git command
      if (command === updateCommands[0]) {
        command = command + ' ' + branchName;
      }

      let { stdout, stderr } = await exec(command);

      logger.plain(`stdout: ${stdout || '(empty)'}`);
      logger.plain(`stderr: ${stderr || '(empty)'}`);
    }
  } catch (err) {
    exitString = `Update failed: ${err.message}`;
  }

  // Swap back to old presence
  vulcan.presenceManager.switchToPrevious();

  return exitString;
};
