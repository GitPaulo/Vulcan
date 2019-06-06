const Command       = require('../../structures/classes/Command');
const messageEmbeds = require('../../modules/utility/messageEmbeds');
const githubAPI     = require('github-api');

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

        this.client = new githubAPI({
            username: 'FOO',
            password: 'NotFoo'
        }); 
    }

    async validate(message) {
        return true; // if true execute() will run
    }

    async execute(message) {
        
    }
}

module.exports = Git;