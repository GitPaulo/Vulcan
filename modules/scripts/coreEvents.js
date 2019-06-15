const logger = xrequire('./managers/LogManager').getInstance();

/**
 * Node Event
 * Emitted whenever a Promise is rejected and no error handler is attached to the promise within a turn of the event loop.
 */
process.on('unhandledRejection', (err, promise) => {
    logger.error(
        `Unhandeled Rejection => ${err}\n` +
        `Stack: ${err.stack}\n` +
        `Promise: ${promise}`
    );
});

/**
 * Node Event
 * Emitted when an uncaught JavaScript exception bubbles all the way back to the event loop.
 */
process.on('uncaughtException', (err, origin) => {
    logger.error(
        `Uncaught exception => ${err}\n` +
        `Stack: ${err.stack}\n` +
        `File Descriptor: ${process.stderr.fd}\n` +
        `Exception origin: ${origin}`
    );
    process.exit(1);
});

/**
 * Node Event
 * The 'exit' event is emitted when the Node.js process is about to exit as a result of either process.exit or event loop exit.
 * Synchronous code only.
 */
process.on('exit', (code) => {
    logger.log(`Node application exiting with code: ${code}`);
});

/**
 * Node Event
 * The 'multipleResolves' event is emitted whenever a Promise has been either:
 * Resolved/Rejected more than once. Rejected after resolve. Resolved after reject.
 */
process.on('multipleResolves', (type, promise, reason) => {
    logger.error(`Multiple Resolved Detected: ${type}, ${promise}, ${reason}`);
    setImmediate(() => process.exit(1));
});
