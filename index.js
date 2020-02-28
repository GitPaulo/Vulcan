/**
 *  ██╗   ██╗██╗   ██╗██╗      ██████╗ █████╗ ███╗   ██╗
 *  ██║   ██║██║   ██║██║     ██╔════╝██╔══██╗████╗  ██║
 *  ██║   ██║██║   ██║██║     ██║     ███████║██╔██╗ ██║
 *  ╚██╗ ██╔╝██║   ██║██║     ██║     ██╔══██║██║╚██╗██║
 *   ╚████╔╝ ╚██████╔╝███████╗╚██████╗██║  ██║██║ ╚████║
 *    ╚═══╝   ╚═════╝ ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝
 *
 * ? Multi Purpose Discord Bot (https://github.com/GitPaulo/Vulcan)
 * * Happy coding! :)
 */

module.exports = (
    require('./prerequisites/globals'),
    // Order is significant
    xrequire('./prerequisites/console'),
    xrequire('./prerequisites/prototypes'),
    xrequire('./prerequisites/extensions'),
    xrequire('./prerequisites/settings'),
    xrequire('./prerequisites/data'),
    xrequire('./prerequisites/coreEvents'),
    xrequire(process.argv[2] || './executions/bot.js')
);

// TODO:
// Where necessary error catch & have error templates or format similar. (use logger.error???)
// API commands must not die if their depedencies are down.
// Make sure prototypes and extensions are being used appropriately.
