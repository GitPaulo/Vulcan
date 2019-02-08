const Command            = require("../../structures/classes/Command");
const { _, performance } = require('perf_hooks');
const RUtil              = require('../../scripts/randomutils');

class Eval extends Command {
    constructor (type) {
        super(type, {
            name: 'eval',
            aliases: ['js', 'runjs', 'jsrun'],
            group: 'group2',
            description: 'Evaluates javascript code using an internal environment.',
            examples: ['eval 1+1'],
            throttling: {
                usages: 2,
                duration: 10
            },
            args: [
                {
                    key: 'text',
                    prompt: 'Code to be evaluated.',
                    type: 'string',
                }
            ]
        });
    }

    async validate (message, hasValidArguments) {
        return hasValidArguments; // if true execute() will run
    }

    async execute (message) {
        let t = performance.now();
        let returnValue;

        try {
            returnValue = await eval(message.args[0]);
        } catch (e) {
            returnValue = e.toString();
        }

        t = RUtil.round(performance.now() - t, 2);
        message.channel.send(`Return (time: ${t}ms): \`` + returnValue + "`");
    }
}

module.exports = Eval;