const vm              = require('vm');
const util            = require('util');
const { performance } = xrequire('perf_hooks');
const messageEmbeds   = xrequire('./plugins/libs/messageEmbeds');
const logger          = xrequire('./managers/LogManager').getInstance();
const DiscordCommand  = xrequire('./structures/classes/core/DiscordCommand');

class Eval extends DiscordCommand {
    constructor (commandDefinition) {
        super(commandDefinition);

        this.historyMax = 100;
        this.history    = [];
    }

    historySave (data) {
        if (this.history.length > this.historyMax) {
            this.history.shift();
        }
        this.history.push(data);
    }

    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        let returnValue = '';
        let outputValue = '';
        let code        = message.parsed.argsString;
        let t           = performance.now();

        try {
            returnValue = vm.runInContext(
                code,
                vm.createContext(
                    {
                        console:
                            {   // eslint-disable-next-line no-return-assign
                                log: (...args) => outputValue += (util.format(...args) + '\n')
                            },
                        __code: code,
                        __history: this.history,
                        __message: message
                    },
                    {
                        timeout: 5
                    }
                )
            );
        } catch (err) {
            logger.warning(`[EVAL COMMAND ERROR] => {${err.message}}`);
            returnValue = err.message;
        }

        t = Math.round(performance.now() - t, 2);

        if (returnValue === outputValue) {
            returnValue = 'undefined';
        }

        this.historySave({
            authorid: message.author.id,
            authorname: message.author.tag,
            code: code,
            execTime: t,
            return: returnValue,
            output: outputValue
        });

        await message.channel.send(messageEmbeds.reply(
            {
                replyeeMessage: message,
                fields: [
                    { name: 'Code',                  value: '```js\n' + code + '\n```' }, //  new lines so '`' in code does not interfere.
                    { name: 'Performance Benchmark', value: `${t}ms` },
                    { name: 'Expression Return',     value: `\`${returnValue}\`` },
                    { name: 'Stream Output',         value: `\`${outputValue}\`` }
                ]
            }
        ));
    }
}

module.exports = Eval;
