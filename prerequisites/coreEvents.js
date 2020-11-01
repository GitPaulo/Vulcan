/**
 * ? Prerequisite File
 * Contains all core event functions.
 */

const logger = xrequire('./modules/logger').getInstance();

/* Code Map */
process.codes = [
  'Controlled Exit', // 0
  'Uncontrolled Exit', // 1
  'Bad Code', // 2
  'Program Aborted' // 3
];

/**
 * Node Event
 * Emitted whenever a Promise is rejected and no error handler is attached to the promise within a turn of the event loop.
 */
process.on('unhandledRejection', (err, promise) => {
  logger.error(`[Unhandeled Rejection]\n` + `Stack: ${err.stack}\n` + `Promise: ${promise}`);

  process.exit(2, err.stack);
});

/**
 * Node Event
 * Emitted when an uncaught JavaScript exception bubbles all the way back to the event loop.
 */
process.on('uncaughtException', (err, origin) => {
  logger.error(
    `[Uncaught exception]\n` +
      `Stack: ${err.stack}\n` +
      `File Descriptor: ${process.stderr.fd}\n` +
      `Exception origin: ${origin}`
  );

  process.exit(2, err.stack);
});

/**
 * Node Event
 * The 'multipleResolves' event is emitted whenever a Promise has been either:
 * Resolved/Rejected more than once. Rejected after resolve. Resolved after reject.
 */
process.on('multipleResolves', (type, promise, reason) => {
  logger.error(`[Multiple Resolved Detected] => ${type}, ${promise}, ${reason}`);

  // * Control
  logger.warn('Vulcan may be in an non-deterministic state.');
  logger.error(`Shutting down because of non deterministic state.`);

  process._exit(1);
});

/**
 * Node Event
 * The 'beforeExit' event is emitted when Node.js empties its event loop and has no additional work to schedule.
 * Listeners can make async calls.
 * This is NOT thrown on explicit process termination.
 * ! We routed every explicit process termination to call beforeExit.
 * ! This function calls the native process.exit.
 * ? A bit dodgy but works.
 */
process.on('beforeExit', async (code, reason = 'Cause of shutdown is unknown.') => {
  logger.log(`[Before exit] => Code: ${code} => Reason: ${reason}`);

  // Always call this because of custom codes.
  // ? process.exit is overriden to call this event. (old = _exit)
  process._exit(code);
});

/**
 * Node Event
 * The 'exit' event is emitted when the Node.js process is about to exit as a result of either process.exit or event loop exit.
 * Synchronous code only.
 */
process.on('exit', code => {
  const vulcan = sxrequire('./index.js');

  // Attempt at cleanup
  if (vulcan) {
    vulcan.end();
  } else {
    logger.debug(`Vulcan was invalid right before exit.`);
  }

  // Final log :'(
  logger.log(`Node application exited (${code}).`);
});

/**
 * Node Signal Event
 * Emitted when the Node.js process receives a signal. (CTRL + C)
 */
process.on('SIGINT', () => {
  logger.log(`Node application received SIGINT (CTRL + C).`);

  const vulcan = sxrequire('./index.js');

  if (vulcan) {
    process.exit(3, 'Vulcan process was terminated.\nSignal: SIGINT (CTRL + C)');
  }
});

/**
 * Node Event
 * The 'warning' event is emitted whenever Node.js emits a process warning.
 * A process warning is similar to an error in that it describes exceptional conditions that are being brought to the user's attention.
 */
process.on('warning', warning => {
  logger.warning(`[Node Warning] => ${warning}`);
});

/**
 * Overwrite: process.exit
 * ? Likely to give trouble in future.
 * beforeExit will call process._exit.
 */
process._exit = process.exit;
process.exit = function (code, reason = "Explicit process exit via 'process.exit'.", shouldNotify = true) {
  const vulcan = sxrequire('./index.js');

  if (shouldNotify) {
    if (vulcan) {
      vulcan.emit('processExiting', vulcan, code, reason);
    } else {
      logger.warn(`Vulcan found invalid on 'process.exit'.`);
      process.emit('beforeExit', code, reason);
    }
  } else {
    process.emit('beforeExit', code, reason);
  }
};
