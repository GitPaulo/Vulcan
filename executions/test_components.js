/*
*   Execution File
    This files calls the 'bot.js' execution file without connecting to discord.
    Used to test for errors in the Vulcan loading process.
*/

const { performance } = xrequire('perf_hooks');

// Disable connect
xrequire('./structures/classes/core/Vulcan').prototype.connect = function () {
    return this;
};

console.log(
    `=======================================\n`
  + `  Vulcan Loading Process Test [START]  \n`
  + `=======================================\n`
);

let startTime  = performance.now();

{
    module.exports = xrequire('./executions/bot');
}

let finishTime = performance.now();

console.log(
    `=======================================\n`
  + `   Vulcan Loading Process Test [END]   \n`
  + `   Time: ${finishTime - startTime}ms   \n`
  + `=======================================\n`
);

process.exit(0);
