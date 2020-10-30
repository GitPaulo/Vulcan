/**
 * ? Execution File
 * This files calls the 'main.js' execution file without connecting to discord.
 * Used to test for errors in the Vulcan loading process.
 */

const { performance } = xrequire('perf_hooks');

// Disable connect
xrequire('./structures/classes/internal/Vulcan')
    .prototype.connect = () => null;

console.log(
    `=======================================\n`
  + `  Vulcan Loading Process Test [START]  \n`
  + `=======================================\n`
);

let startTime = performance.now();

{
    module.exports = xrequire('./executions/main.js');
}

let finishTime = performance.now();

console.log(
    `=======================================\n`
  + `   Vulcan Loading Process Test [END]   \n`
  + `   Time: ${finishTime - startTime}ms   \n`
  + `=======================================\n`
);

process.exit(0);
