const messageEmbeds = xrequire('./utility/modules/messageEmbeds');
const logger        = xrequire('./managers/LogManager').getInstance();

/*
    Attempt at controlled exit:
        ! If the following code errors => infinite loop! (Check for everything!)
*/
global._exit = process.exit;
process.exit = async (code = 0, message = 'Unknown') => {
    if (!logger || !messageEmbeds) {
        console.err(`Requirements for controlled process.exit are invalid.`);

        return global._exit(1);
    }

    // Don't use comma or infinite loop!
    const vulcan = global.__loaded && xrequire('./bot.js');

    if (!vulcan) {
        logger.error(`Vulcan client was invalid before process exit!\n\tMessage: ${message}'`);

        return global._exit(1);
    }

    if (code !== 0) {
        await vulcan.guilds.array().asyncForEach(async (guild) => {
            const botChannel = guild.botChannel;

            if (botChannel) {
                await botChannel.send(messageEmbeds.critical(
                    {
                        description: `Vulcan process is exiting.`,
                        fields     : [
                            {
                                name  : 'Message',
                                value : message,
                                inline: false
                            },
                            {
                                name  : 'Exit Code',
                                value : code,
                                inline: true
                            },
                            {
                                name  : 'Vulcan Uptime',
                                value : vulcan.uptime,
                                inline: true
                            }
                        ]
                    }
                ));
            }
        });
    }

    // Clean up before exiting!
    vulcan.destroy();
    logger.log(`Vulcan process is exiting.\n\tMessage: ${message}\n\tExit code: ${code}`);

    global._exit(code);
};

/**
 * Node Event
 * Emitted whenever a Promise is rejected and no error handler is attached to the promise within a turn of the event loop.
 */
process.on('unhandledRejection', (err, promise) => {
    logger.error(
        `Unhandeled Rejection => ${err}\n`
        + `Stack: ${err.stack}\n`
        + `Promise: ${promise}`
    );
    process.exit(1, err.message);
});

/**
 * Node Event
 * Emitted when an uncaught JavaScript exception bubbles all the way back to the event loop.
 */
process.on('uncaughtException', (err, origin) => {
    logger.error(
        `Uncaught exception => ${err}\n`
        + `Stack: ${err.stack}\n`
        + `File Descriptor: ${process.stderr.fd}\n`
        + `Exception origin: ${origin}`
    );
    process.exit(1, err.message);
});

/**
 * Node Event
 * The 'multipleResolves' event is emitted whenever a Promise has been either:
 * Resolved/Rejected more than once. Rejected after resolve. Resolved after reject.
 */
process.on('multipleResolves', (type, promise, reason) => {
    logger.error(`Multiple Resolved Detected: ${type}, ${promise}, ${reason}`);
    setImmediate(() => process.exit(1, reason));
});

/**
 * Node Event
 * The 'exit' event is emitted when the Node.js process is about to exit as a result of either process.exit or event loop exit.
 * Synchronous code only.
 */
process.on('exit', (code) => {
    console.log(`Node application exited. (${code})`);
});

/**
 * Node Signal Event
 * Emitted when the Node.js process receives a signal. (CTRL + C)
 */
process.on('SIGINT', () => {
    logger.log(`Node application received SIGINT (CTRL + C).`);
});

/**
 * Node Event
 * The 'warning' event is emitted whenever Node.js emits a process warning.
 * A process warning is similar to an error in that it describes exceptional conditions that are being brought to the user's attention.
 */
process.on('warning', (warning) => {
    logger.warning(`[Node Warning] => ${warning}`);
});
