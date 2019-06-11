const Command   = xrequire('./structures/classes/Command');
const GithubAPI = xrequire('github-api');

class Git extends Command {
    constructor (type) {
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
                image: './assets/media/images/commands/GitPull.gif'
            }
        });

        this.client = new GithubAPI({
            username: 'FOO',
            password: 'NotFoo'
        });
    }

    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    // eslint-disable-next-line no-unused-vars
    async execute (message) {

    }
}

module.exports = Git;
