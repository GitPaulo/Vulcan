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
        let code        = message.parsed.argsString;

        const marker = '%EMPTY%';
        global.PrintHistory.push(marker);

        try {
            returnValue = await eval(code);
        } catch (err) {
            returnValue = err.message;
        }

        t = Math.round(performance.now() - t, 2);

        let output      = [];
        let foundMarker = -1;

        for (let i = 0; i < global.PrintHistory.length; i++) {
            let printData = global.PrintHistory[i];
            if (printData === marker) {
                foundMarker = i;
                break;
            }
        }

        if (!foundMarker) {
            logger.warning('Marker was not found for eval command. Possible spam of output stream in eval code?');
            output = global.PrintHistory;
        } else {
            for (let i = 0; i < global.PrintHistory.length - foundMarker; i++)
                output.push(global.PrintHistory.pop());
        }

        this.historySave({
            authorid: message.author.id,
            authorname: message.author.tag,
            code: code,
            execTime: t,
            return: returnValue,
            output: output
        });

        await message.channel.send(messageEmbeds.reply(
            {
                replyeeMessage: message,
                fields: [
                    { name: 'Code',                  value: `\`\`\`js\n${code}\`\`\`` },
                    { name: 'Performance Benchmark', value: `${t}ms` },
                    { name: 'Expression Return',     value: `\`${returnValue}\`` },
                    { name: 'Stream Output',         value: `\`${output.join('\n')}\`` }
                ]
            }
        ));
    }
}

module.exports = Eval;
