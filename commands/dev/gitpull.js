const Command  = require("../../structures/classes/Command");
const { exec } = require("child_process");

class GitPull extends Command {
    constructor (type) {
        super(type, {
            name: 'gitpull',
            aliases: ['updatefiles', 'pullgit'],
            group: 'group2',
            description: 'Automatically updates files from github',
            examples: ['gitpull'],
            throttling: 2000,
            args: []
        });
    }

    async validate (message, hasValidArguments) {
        return hasValidArguments; // if true execute() will run
    }

    async execute (message) {
        exec("git pull origin master", async (err, pull) => {
            let vulcan = message.client;
            if (err) return vulcan.logger.error(err);

            let pullText = pull.toString();
            vulcan.logger.debug(pullText);
            
            const m = await message.channel.send({
                embed: {
                    color: 3447003,
                    description: pullText,
                }
            });
        })
    }
}

module.exports = GitPull;