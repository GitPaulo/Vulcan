const { performance } = xrequire('perf_hooks');
const Command         = xrequire('./structures/classes/Command.js');
const messageEmbeds   = xrequire('./modules/utility/messageEmbeds');
const logger          = xrequire('./managers/LogManager').getInstance();

class Eval extends Command {
    constructor (type) {
        super(type, {
            name: 'eval',
            aliases: ['js', 'runjs', 'jsrun'],
            group: 'GROUP_SYSTEM_SOON_TM',
            description: 'Evaluates JavaScript code using the internal environment.',
            examples: ['eval 1+1', 'eval console.log(\'hello world!\');'],
            throttling: 2000,
            args: [
                {
                    key: 'text',
                    prompt: 'Code to be evaluated.',
                    type: 'string'
                }
            ],
            embed: {
                color: 0xFFCE6D,
                title: `(JavaScript) Code Evaluation`,
                image: './assets/media/images/commands/Eval.gif'
            }
        });

        this.historyMax = 100;
        this.history    = [];
    }

    historySave (data) {
        if (this.history.length > this.historyMax)
            this.history.shift();
        this.history.push(data);
    }

    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        let returnValue = '[NULL]';
        let t           = performance.now();
        let code        = message.argsString;

        const marker = '%EMPTY%';
        global.printHistory.push(marker);

        try {
            returnValue = await eval(code);
        } catch (err) {
            returnValue = err.message;
        }

        t = Math.round(performance.now() - t, 2);

        let output      = [];
        let foundMarker = -1;

        for (let i = 0; i < global.printHistory.length; i++) {
            let printData = global.printHistory[i];
            if (printData === marker) {
                foundMarker = i;
                break;
            }
        }

        if (!foundMarker) {
            logger.warn('Marker was not found for eval command. Possible spam of output stream in eval code?');
            output = global.printHistory;
        } else {
            for (let i = 0; i < global.printHistory.length - foundMarker; i++)
                output.push(global.printHistory.pop());
        }

        this.historySave({
            authorid: message.author.id,
            authorname: message.author.username,
            code: code,
            execTime: t,
            return: returnValue,
            output: output
        });

        await message.channel.send(messageEmbeds.reply(
            {
                replyeeMessage: message,
                fields: [
                    { name: 'Code',                  value: `\`${code}\`` },
                    { name: 'Performance Benchmark', value: `${t}ms` },
                    { name: 'Expression Return',     value: `\`${returnValue}\`` },
                    { name: 'Stream Output',         value: `\`${output.join('\n')}\`` }
                ]
            }
        ));
    }
}

module.exports = Eval;
