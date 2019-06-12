const { performance } = xrequire('perf_hooks');
const Command         = xrequire('./structures/classes/Command.js');
const mathematics     = xrequire('./modules/utility/mathematics');
const messageEmbeds   = xrequire('./modules/utility/messageEmbeds');

class Eval extends Command {
    constructor (type) {
        super(type, {
            name: 'eval',
            aliases: ['js', 'runjs', 'jsrun'],
            group: 3,
            description: 'Evaluates javascript code using an internal environment.',
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
    }

    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        let returnValue;
        let t = performance.now();

        try {
            returnValue = await eval(message.args[0]);
        } catch (err) {
            returnValue = err.toString();
        }

        t = mathematics.round(performance.now() - t, 2);

        let embed = messageEmbeds.reply(
            {
                replyeeMessage: message,
                title: `\`${message.args[0]}\``,
                fields: [
                    { name: 'Performance Benchmark', value: `${t}ms` },
                    { name: 'Expression Return',                value: `${returnValue}` },
                    { name: 'Stream Output',                value: `${global.printHistory[global.printHistory.length - 1]}` }
                ]
            }
        );

        await message.channel.send(embed);
    }
}

module.exports = Eval;
