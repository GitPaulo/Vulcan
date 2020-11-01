/* eslint-disable no-unused-vars */
/* eslint-disable key-spacing */

/*
* Implemented as a 'Singleton'.
    There is no particular reason for the 'why?' besides the whim of the developer.
    TODO: Could use a lot of improvement.
*/

const { performance } = xrequire('perf_hooks');
const fs = xrequire('fs');
const path = xrequire('path');
const chalk = xrequire('chalk');

module.exports = (function () {
  // Reference to the Singleton
  let instance;

  // ? Constructor
  // Nested functions & vars are the 'private' properties
  function logger() {
    let folderName = 'logs';
    let rootPath = global.basedir;
    let maxFileSize = 1 * 1024 * 1024; // 1Mb
    let nFolderPath = path.join(rootPath, folderName);
    let oFolderPath = path.join(nFolderPath, 'past_logs');

    // eslint-disable-next-line no-unused-vars
    let modifiers = [];

    // Time logs
    let clocks = new Map();

    // Useful last output
    let lastWarning = null;
    let lastError = null;

    // Type color lookup
    let logTypes = new Map([
      ['debug', chalk.blue],
      ['log', chalk.green],
      ['warning', chalk.yellowBright],
      ['error', chalk.redBright],
      ['terminal', chalk.magenta]
    ]);

    // File -> log type
    let blueprint = [
      {
        fileName: 'logs.txt',
        logTypes: ['debug', 'log', 'warning', 'error', 'terminal']
      },
      {
        fileName: 'dump.txt',
        logTypes: ['warning', 'error']
      }
    ];

    let leftPadNumber = function (num, length) {
      let r = String(num);

      while (r.length < length) {
        r = '0' + r;
      }

      return r;
    };

    let initFile = function (fileBlueprint) {
      fs.writeFileSync(
        path.join(nFolderPath, fileBlueprint.fileName),
        `[LOG '${fileBlueprint.fileName}' FILE CREATED (${Date.now()})]\n`
      );
    };

    let applyModifiers = function (text) {
      for (let modifier of modifiers) {
        if (!chalk[modifier]) {
          instance.warn(`Invalid chalk modifier: ${modifier}`);
          continue;
        }

        text = chalk[modifier](text);
      }

      return text;
    };

    let blueprintsFromLogType = function (logType) {
      let blueprints = [];

      for (let fileBlueprint of blueprint) {
        if (fileBlueprint.logTypes.includes(logType)) {
          blueprints.push(fileBlueprint);
        }
      }

      return blueprints;
    };

    let shouldLog = function () {
      return true; // Currently not used (but could be in future!)
    };

    let store = function (logType, str) {
      if (!logTypes.get(logType)) {
        throw new Error(`Log type '${logType}' not valid for 'write' function!`);
      }

      const blueprints = blueprintsFromLogType(logType);

      for (let fileBlueprint of blueprints) {
        let logFilePath = path.join(nFolderPath, fileBlueprint.fileName);
        let stats = fs.statSync(logFilePath);

        // File too big! Copy file to old logs and then overwrite it!
        if (stats.size >= maxFileSize) {
          let fstr = new Date().toJSON().slice(0, 10) + '_' + fileBlueprint.fileName;
          let numberOfRepeats = 0;

          let files = fs.readdirSync(oFolderPath);

          for (let file of files) {
            if (file.includes(fstr)) {
              numberOfRepeats++;
            }
          }

          // Hack was added here for the old log file name extension - TODO: FIX!
          let oldLogFileName = fstr.substring(0, fstr.length - 4) + (numberOfRepeats + 1) + '.txt';
          let oldLogFilePath = path.join(oFolderPath, oldLogFileName);

          fs.copyFileSync(logFilePath, oldLogFilePath);
          initFile(fileBlueprint);
        }

        fs.appendFileSync(logFilePath, str + '\n');
      }
    };

    let write = function (logType, ...args) {
      if (!shouldLog(...args)) {
        return;
      }

      let colorFunc = logTypes.get(logType);

      if (!colorFunc) {
        throw new Error(`Log type '${logType}' not valid for 'write' function!`);
      }

      // Convert all arguments to proper strings
      let buffer = [];

      for (let arg of args) {
        buffer.push(typeof arg === 'object' ? JSON.stringify(arg) : arg.toString());
      }

      let content = buffer.join(' ');
      let text = applyModifiers(colorFunc(`(${new Date().toLocaleString()})` + `[${logType}] => ` + content));

      // Keep track of last warning
      if (logType === 'warning') {
        lastWarning = content;
      }

      // Keep track of last error
      if (logType === 'error') {
        lastError = content;
      }

      // ? Output & Store
      console.log(text);
      store(logType, text);
    };

    // ? Public properties
    return {
      colors: [
        'black',
        'red',
        'green',
        'yellow',
        'blue',
        'magenta',
        'cyan',
        'white',
        'grey',
        'redBright',
        'greenBright',
        'yellowBright',
        'blueBright',
        'magentaBright',
        'cyanBright',
        'whiteBright'
      ],
      generateFiles(force = false) {
        if (force || !fs.existsSync(nFolderPath)) {
          fs.mkdirSync(nFolderPath);
        }

        if (force || !fs.existsSync(oFolderPath)) {
          fs.mkdirSync(oFolderPath);
        }

        for (let fileBlueprint of blueprint) {
          let filePath = path.join(nFolderPath, fileBlueprint.fileName);

          if (force || !fs.existsSync(filePath)) {
            initFile(fileBlueprint);
          }
        }

        this.log(`Completed check of log directories and files. (force_generate=${force})`);
      },
      removeModifier(modID) {
        let index = modifiers.indexOf(modID);

        if (index < -1) {
          throw new Error(`Modifier '${modID}' not found in exisiting modifiers!`);
        }

        modifiers.splice(index, 1);
      },
      addModifier(modID) {
        modifiers.push(modID);
        this.log(`Modifier added to logger: ${modID}`);
      },
      setModifiers(mods) {
        if (!Array.isArray(mods)) {
          throw new Error(`Expected log modifiers in array format!`);
        }

        modifiers = mods;
      },
      clearModifiers() {
        modifiers = [];
      },
      // ! To allow 'caller' to be used
      // eslint-disable-next-line object-shorthand
      plain(text, color = 'white') {
        if (!this.colors.includes(color)) {
          throw new Error(`Invalid color '${color}' for 'logger.plain'!`);
        }

        // ? Plain print
        console.log(applyModifiers(chalk[color](text)));
      },
      logTimeStart(id, msg) {
        if (clocks.has(id)) {
          throw new Error(`This log clock (${id}) already exits.`);
        }

        if (msg) {
          this.log(msg);
        }

        clocks.set(id, performance.now());
      },
      logTimeEnd(id, msg) {
        const clock = clocks.get(id);

        if (!clock) {
          throw new Error(`Non existant lock clock (${id}).`);
        }

        this.log(
          `[Clock: ${leftPadNumber(Math.round(performance.now() - clock, 2), 4)}ms] ${(msg && `=> ${msg}`) || ``}`
        );

        clocks.delete(id);
      },
      // ? Main access points
      debug: (...args) => write('debug', ...args),
      log: (...args) => write('log', ...args),
      warning: (...args) => write('warning', ...args),
      warn: (...args) => write('warning', ...args),
      error: (...args) => write('error', ...args),
      err: (...args) => write('error', ...args),
      terminal: (...args) => write('terminal', ...args)
    };
  }

  // Every export must call getInstance()
  return {
    getInstance() {
      if (!instance) {
        // Freeze all properties & prototype chain
        instance = Object.freeze(logger());
        instance.generateFiles();
      }

      return instance;
    }
  };
})();
