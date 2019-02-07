const Command  = require("../../structures/classes/Command");
const { exec } = require("child_process");

class GitPull extends Command {
    constructor () {
        super({
            name: 'gitpull',
            aliases: ['updatefiles', 'pullgit'],
            group: 'group2',
            description: 'Automatically updates files from github',
            examples: ['gitpull'],
            throttling: {
                usages: 2,
                duration: 10
            },
            args: {}
        });
    }

    async validate (message, hasValidArguments) {
        return hasValidArguments; // if true execute() will run
    }

    async execute (message) {
        exec("git pull", async (err, pull) => {
            let vulcan = message.client;
            if (err) return vulcan.logger.error(err);
            vulcan.logger.debug(pull.toString());
            
            const m = await message.channel.send("Bot files have been updated!");
        })
    }
}

module.exports = GitPull;