const { exec } = require('child_process');

const Command       = require('../../structures/classes/Command');
const messageEmbeds = require('../../modules/utility/messageEmbeds');

class Git extends Command {
    constructor(type) {
        super(type, {
            name: 'git',
            aliases: ['updatefiles', 'pullgit'],
            group: 'group2',
            description: 'Automatically updates files from github',
            examples: ['gitpull'],
            throttling: 2000,
            args: [],
            embed: {
                color: 0x761CFF,
                title: `Git - Pull Operation`,
                image: './assets/media/images/commands/GitPull.gif',
            }
        });
    }

    async validate(message) {
        return true; // if true execute() will run
    }

    async execute(message) {
        exec('git pull origin master', async (err, pull) => {
            let vulcan = message.client;

            let reply;

            if (err) {
                let errStr = err.shortMessage();
                vulcan.logger.error(errStr);
                reply = messageEmbeds.error(errStr);
            } else {
                let pullText = pull.toString();
                vulcan.logger.debug(pullText);
    
                reply = messageEmbeds.cmdreply(
                    `Pulling from branch \`master\``, 
                    message, 
                    [ 
                        { name: 'Output', value:  `${pullText}` }
                    ]
                );
            }

            await message.channel.send(reply);
        })
    }
}

module.exports = Git;