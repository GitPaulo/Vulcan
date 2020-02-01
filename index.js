/*
   ██╗   ██╗██╗   ██╗██╗      ██████╗ █████╗ ███╗   ██╗
   ██║   ██║██║   ██║██║     ██╔════╝██╔══██╗████╗  ██║
   ██║   ██║██║   ██║██║     ██║     ███████║██╔██╗ ██║
   ╚██╗ ██╔╝██║   ██║██║     ██║     ██╔══██║██║╚██╗██║
    ╚████╔╝ ╚██████╔╝███████╗╚██████╗██║  ██║██║ ╚████║
     ╚═══╝   ╚═════╝ ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝

?   Multi Purpose Discord Bot (https://github.com/GitPaulo/Vulcan)
*   Happy coding! :)
*/

module.exports = (require('./utility/scripts/globals'), // Universal dependency
xrequire(process.argv[2] || './executions/bot.js'));    // Parameter: Any of the files in ./executions
