const logger = xrequire('./managers/LogManager').getInstance();

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
    logger.error(
        `Unhandeled Rejection\n`
        + `Stack: ${err.stack}\n`
        + `Promise: ${promise}`
    );

    process.emit('beforeExit', 2, err.stack);
});

/**
 * Node Event
 * Emitted when an uncaught JavaScript exception bubbles all the way back to the event loop.
 */
process.on('uncaughtException', (err, origin) => {
    logger.error(
        `Uncaught exception\n`
        + `Stack: ${err.stack}\n`
        + `File Descriptor: ${process.stderr.fd}\n`
        + `Exception origin: ${origin}`
    );

    process.emit('beforeExit', 2, err.stack);
});

/**
 * Node Event
 * The 'multipleResolves' event is emitted whenever a Promise has been either:
 * Resolved/Rejected more than once. Rejected after resolve. Resolved after reject.
 */
process.on('multipleResolves', (type, promise, reason) => {
    logger.error(
        `Multiple Resolved Detected: ${type}, ${promise}, ${reason}`
    );

    // ! For now, don't shut down.
    logger.warn('Vulcan may be in an non-deterministic state.');
});

/**
 * Node Event
 * The 'beforeExit' event is emitted when Node.js empties its event loop and has no additional work to schedule.
 * Listeners can make async calls.
 * This is NOT thrown on explicit process termination.
 * ! Make sure logic here is not too scuffed or RIP.
 */
process.on('beforeExit', async (
    code,
    reason = 'Cause of shutdown is unknown.',
    shouldNotify = true
) => {
    const vulcan = xrequire('./index.js');

    if (vulcan && shouldNotify) {
        await vulcan.guilds.array().asyncForEach(async (guild) => {
            const botChannel = guild.botChannel;

            if (botChannel) {
                await botChannel.send(
                    {
                        embed: {
                            title      : 'Vulcan Shutdown',
                            timestamp  : new Date(),
                            color      : 0x000000,
                            description: `Exit sequence initiated.`,
                            fields     : [
                                {
                                    name  : 'Message',
                                    value : `\`\`\`\n${reason}\`\`\``,
                                    inline: false
                                },
                                {
                                    name  : 'Exit Code',
                                    value : `${process.codes[code]} | ${code}`,
                                    inline: true
                                },
                                {
                                    name  : 'Vulcan Uptime',
                                    value : String(vulcan.uptime / 1000).toHHMMSS(),
                                    inline: true
                                }
                            ],
                            thumbnail: {
                                url: `attachment://critical.png`
                            },
                            footer: {
                                text: '[Emmited before process exit]'
                            }
                        },
                        files: [
                            {
                                attachment: './assets/media/images/embeds/critical.png',
                                name      : 'critical.png'
                            }
                        ]
                    }
                );
            }
        });
    }

    // ! Always call this because of custom codes.
    // ? process.exit is overriden to call this event. (old = _exit)
    process._exit(code);
});

/**
 * Node Event
 * The 'exit' event is emitted when the Node.js process is about to exit as a result of either process.exit or event loop exit.
 * Synchronous code only.
 */
process.on('exit', (code) => {
    // Don't use comma or infinite loop!
    const vulcan = xrequire('./index.js');

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

    process.emit('beforeExit', 3, 'Vulcan process was terminated.\nSignal: SIGINT (CTRL + C)');
});

/**
 * Node Event
 * The 'warning' event is emitted whenever Node.js emits a process warning.
 * A process warning is similar to an error in that it describes exceptional conditions that are being brought to the user's attention.
 */
process.on('warning', (warning) => {
    logger.warning(`[Node Warning] => ${warning}`);
});

/*
* Overwrite: process.exit
? Likely to give trouble in future.
! beforeExit will call process._exit.
*/
process._exit = process.exit;
process.exit  = function (
    code,
    reason = 'Explicit process exit via \'process.exit\'.',
    shouldNotify = true
) {
    process.emit('beforeExit', code, reason, shouldNotify);
};
