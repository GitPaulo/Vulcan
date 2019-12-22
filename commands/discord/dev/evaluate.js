const evaluate        = module.exports;
const vm              = xrequire('vm');
const util            = xrequire('util');
const { performance } = xrequire('perf_hooks');
const messageEmbeds   = xrequire('./utility/modules/messageEmbeds');
const logger          = xrequire('./managers/LogManager').getInstance();

// eslint-disable-next-line no-unused-vars
evaluate.load = (commandDefinition) => {
    this.historyMax = 100;
    this.history    = [];
};

evaluate.execute = async (message) => {
    let returnValue = '';
    let outputValue = '';

    const code      = message.parsed.argsString;
    const startTime = performance.now();

    try {
        returnValue = vm.runInContext(
            code,
            vm.createContext(
                {
                    console:
                        {   // eslint-disable-next-line no-return-assign
                            log: (...args) => outputValue += (util.format(...args) + '\n')
                        },
                    __code   : code,
                    __history: this.history,
                    __message: message
                },
                {
                    timeout: 5
                }
            )
        );
    } catch (err) {
        logger.warning(`[Evaluate Command][Error] => {${err.message}}`);
        returnValue = err.message;
    }

    const execTime = Math.roundDP(performance.now() - startTime, 2);

    if (returnValue === outputValue) {
        returnValue = 'undefined';
    }

    this.historySave(
        {
            code,
            execTime,
            returnValue,
            outputValue,
            authorID : message.author.id,
            authorTag: message.author.tag
        }
    );

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                { name: 'Code',              value: '```js\n' + code + '\n```'             }, // \n stops .md break
                { name: 'Benchmark',         value: `${execTime}ms`, inline: true          },
                { name: 'Size',              value: `${code.length} (chars)`, inline: true },
                { name: 'Expression Return', value: `\`${returnValue}\``,     inline: true },
                { name: 'Stream Output',     value: `\`${outputValue}\``,     inline: true }
            ]
        }
    ));
};

/*******************
 *  Extra Methods  *
*******************/

evaluate.historySave = (data) => {
    if (this.history.length > this.historyMax) {
        this.history.shift();
    }

    this.history.push(data);
};
