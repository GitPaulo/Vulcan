const TerminalCommand = xrequire('./structures/classes/core/TerminalCommand');

class Uptime extends TerminalCommand {
    // eslint-disable-next-line no-unused-vars
    async validate (vulcan) {
        return true; // if true execute() will run
    }

    async execute (vulcan) {
        console.log('Uptime: ', vulcan.uptime());
    }
}

module.exports = Uptime;
