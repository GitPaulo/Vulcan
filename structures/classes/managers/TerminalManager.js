/**
 * ? Manager File
 * Controls the terminal input and parses commands.
 */

const readline = xrequire('readline');
const clHandler = xrequire('./handlers/commandsLoadHandler');
const logger = xrequire('./modules/logger').getInstance();

class TerminalManager {
  constructor(vulcan) {
    this.vulcan = vulcan;
    this.client = vulcan;
    this.history = [];
    this.historyL = 1000;
    this.commands = clHandler(vulcan, 'terminal');
    this.cli = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '>'
    });

    // Log
    logger.log(`[Managers] => Instance of Terminal Manager initialised.`);
  }

  /**
   * Wrapper for the logger instance.
   * (Used throughout the class)
   * @param {*} message
   * @param {string} [type='terminal']
   */
  log(message, type = 'terminal') {
    logger[type](message);
  }

  /**
   * Event method.
   * Called when CTRL + Z is detected.
   */
  _CTRLZ() {
    this.log('CTRL + Z detected!');
  }

  /**
   * Event method.
   * Called when CTRL + Z is detected and stream moved to background.
   */
  _CTRLZ2() {
    this.log('CTRL + Z detected, and background move.');
  }

  /**
   * Event method.
   * Called when:
   *  - The input stream is paused.
   *  - The input stream is not paused and receives the 'SIGCONT' event. (See events 'SIGTSTP' and 'SIGCONT'.)
   */
  _CTRLC() {
    this.log('CTRL + C detected!');

    this.cli.question('Are you sure you want to exit the CLI? [yes/no] ', answer => {
      if (answer.match(/^y(es)?$/i)) {
        this.stop();
      }
    });
  }

  /**
   * Event method.
   * Called when:
   *  - The input stream is paused.
   *  - The input stream is not paused and receives the 'SIGCONT' event. (See events 'SIGTSTP' and 'SIGCONT'.)
   */
  _StreamPause() {
    this.log(`Stream has paused.`);

    // Not good
    this.log(`Input stream paused or received SIGCONT.`, 'warning');
  }

  /**
   * Event method.
   * Called when:
   *  - The 'resume' event is emitted whenever the input stream is resumed
   */
  _StreamResume() {
    this.log(`Stream has resumed.`);
  }

  /**
   * Event method.
   * Called when:
   *  - The rl.close() method is called and the readline.Interface instance has relinquished control over the input and output streams;
   *  - The input stream receives its 'end' event;
   *  - The input stream receives <ctrl>-D to signal end-of-transmission (EOT);
   *  - The input stream receives <ctrl>-C to signal SIGINT and there is no 'SIGINT' event listener registered on the readline.Interface instance
   */
  _StreamClose() {
    this.log(`Stream has closed.`);
  }

  /**
   * Event method.
   * Executed when the input stream receives an end-of-line input (\n, \r, or \r\n) [<enter>/<return> keys].
   * Parses 'line' into a 'terminal' command and trys to execute it.
   * @param {*} line
   */
  _CommandReceived(line) {
    let args = line.split(' ');
    let cmd = args[0];

    args = args.slice(1);

    let command = this.commands.get(cmd);

    // Validate cmd
    if (!command) {
      this.log(`Command '${cmd}' does not exist!\nInput: ${line}`, 'warning');

      return;
    }

    // Sandbox execute
    try {
      command.execute(line);
    } catch (err) {
      this.log(`Terminal Command Error: ${err.message}\nStack: ${err.stack}`, 'error');
    }

    // Store cmd call in history
    if (this.history.length > this.historyL) {
      this.history = [];

      this.log(`History limit reached. Cleared data.`);
    }

    this.history.push({
      command,
      parse: { line, args, cmd },
      timestamp: new Date()
    });
  }

  /**
   * Starts the CLI.
   * Sets up all readline events.
   */
  start() {
    // Readline Events
    this.cli.on('line', line => this._CommandReceived(line));
    this.cli.on('pause', () => this._StreamPause());
    this.cli.on('resume', () => this._StreamResume());
    this.cli.on('close', () => this._StreamClose());
    this.cli.on('SIGINT', () => this._CTRLC());
    this.cli.on('SIGTSTP', () => this._CTRLZ());
    this.cli.on('SIGCONT', () => this._CTRLZ2());

    // Log
    this.log(`Vulcan CLI has started succesfully!`);
  }

  /**
   * Starts the CLI.
   * Sets up all readline events.
   */
  stop() {
    // Pause readline
    this.cli.pause();

    // Remove listeners
    this.cli.removeAllListeners('line');
    this.cli.removeAllListeners('pause');
    this.cli.removeAllListeners('resume');
    this.cli.removeAllListeners('SIGNINT');
    this.cli.removeAllListeners('SIGTSTP');
    this.cli.removeAllListeners('SIGCONT');

    // Close and relinquesh control of streams
    this.cli.close();

    // Log
    this.log(`Vulcan CLI has stopped succesfully!`);
  }
}

module.exports = TerminalManager;
