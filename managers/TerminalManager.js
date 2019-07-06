const readline = xrequire('readline');
const logger   = xrequire('./managers/LogManager').getInstance();

class TerminalManager {
    constructor (
        inputStream  = process.stdin,
        outputStream = process.stdout
    ) {
        this.cli = readline.createInterface(
            {
                input: inputStream,
                output: outputStream
            }
        );
    }

    log (message, type = 'terminal') {
        logger[type](`[CLI] => ${message}`);
    }

    // eslint-disable-next-line no-unused-vars
    onCTRLZ (vulcan) {
        this.log('Terminal: <ctrl>-Z detected!');
    }

    // eslint-disable-next-line no-unused-vars
    onCTRLC (vulcan) {
        this.log('Terminal: <ctrl>-C detected!');
        this.cli.question('Are you sure you want to exit the CLI? [yes/no] ', (answer) => {
            if (answer.match(/^y(es)?$/i)) {
                this.stop();
            }
        });
    }

    // eslint-disable-next-line no-unused-vars
    onStreamPause (vulcan) {
        this.log(`CLI input stream paused. (or received SIGCONT)`, 'warning');
        this.log(`Terminal paused.`);
    }

    onCommandReceived (line, vulcan) {
        let args = line.split(' ');
        let cmd  = args[0];
        args = args.slice(1);

        let command = this.commands.get(cmd);

        if (!command) {
            this.log(`This CLI command '${cmd}' does not exist!\n\tInput: ${line}`, 'warning');
            return;
        }

        try {
            command.execute(vulcan);
        } catch (err) {
            this.log(`CLI Command Error: ${err.message}\nStack: ${err.stack}`);
        }

        this.history.push({
            parse: { line, args, cmd },
            command,
            timestamp: new Date()
        });
    }

    loadCommands (folderPath = './commands/terminal') {
        this.commands = xrequire('./handlers/commandLoadHandler')(this, folderPath);
    }

    start (vulcan) {
        // Command History
        this.history = [];

        // Readline Events
        this.cli.on('line',    (line) => this.onCommandReceived(line, vulcan));
        this.cli.on('pause',   ()     => this.onStreamPause(vulcan));
        this.cli.on('SIGINT',  ()     => this.onCTRLC(vulcan));
        this.cli.on('SIGTSTP', ()     => this.onCTRLZ(vulcan));

        logger.log('Vulcan CLI has started succesfully!');
    }

    stop () {
        // Pause readline
        this.cli.pause();

        // Remove listeners
        this.cli.removeAllListeners('line');
        this.cli.removeAllListeners('pause');
        this.cli.removeAllListeners('SIGNINT');
        this.cli.removeAllListeners('SIGTSTP');

        // Close and relinquesh control of streams
        this.cli.close();

        this.log('Vulcan CLI has stopped uccesfully!');
    }
}

module.exports = TerminalManager;
