const Command = require("../../structures/classes/Command");
const RUtil = require("../../scripts/randomutils");
const gifModel = require("../../structures/database/models/gif")

class Gif extends Command {
    constructor(type) { // type = root folder name (passed on by command loader)
        super(type, {
            name: 'gif',
            aliases: ['GIF'],
            group: 'group2',
            description: 'Retrieves a Gif from the database',
            examples: ['gif cat'],
            throttling: 2000,
            args: []
        });
    }

    async validate(message) {
        return true; // if true execute() will run
    }

    async execute(message) {
        const m = await message.channel.send("Fetching...");
        gifModel.findOne({name: message.args[0]}, 'link', (err, meme) => {
            if (err) m.edit('Not Found');
            else m.edit(meme.link);
        });
    }
}

module.exports = Gif;