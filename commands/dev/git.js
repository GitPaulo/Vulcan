const Command       = xrequire('./structures/classes/Command');
const GithubAPI     = xrequire('github-api');
const messageEmbeds = xrequire('./modules/utility/messageEmbeds');

class Git extends Command {
    constructor (type) {
        super(type, {
            name: 'git',
            aliases: ['updatefiles', 'pullgit'],
            group: 1,
            description: 'Automatically updates files from github',
            examples: ['gitpull'],
            throttling: 2000,
            args: [],
            embed: {
                color: 0x761CFF,
                title: `Git API`,
                image: './assets/media/images/commands/GitPull.gif'
            }
        });
    }

    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    /* TODO: IMPROVE ALL CODE HERE - THIS WAS JUST A TEST */
    // eslint-disable-next-line no-unused-vars
    async execute (message) {
        let cmd            = message.args[0];
        let channel        = message.channel;
        let replyEmbedData = {
            replyeeMessage: message,
            title: `**Git** request received: **${cmd}**`,
            fields: [
                {
                    name: 'Arguments',
                    value: message.args.join(', ')
                },
                {
                    name: 'Output',
                    value: 'Processing...'
                }
            ]
        };

        let firstReply = await channel.send(messageEmbeds.reply(replyEmbedData));
        // let numArgs    = message.args.length;

        // kinda scuffed but
        if (!this.git)
            this.git = new GithubAPI({
                token: message.client.privatedata.githubOAuth
            });

        // Currently only commands about vulcan repo
        let vulcanRepo = this.git.getRepo('GitPaulo', 'Vulcan');

        switch (cmd) {
            case 'collaborators':
                var response1 = await vulcanRepo.getCollaborators();
                var list1     = response1.data;
                var carray1   = [];
                list1.forEach(collaboratorData => {
                    carray1.push(collaboratorData.login);
                });
                replyEmbedData.fields[1].value = carray1.join(', ');
                firstReply.edit(messageEmbeds.reply(replyEmbedData));
                break;
            case 'commits':
                const maxcs  = 4;
                let response2 = await vulcanRepo.listCommits();
                let list2     = response2.data;
                let carray2   = [];
                list2.forEach(commitData => {
                    console.log(commitData);
                    carray2.push(`url: ${commitData.url}\nauthor: ${commitData.commit.author.name}\nmessage: ${commitData.commit.message}\n`);
                });
                carray2 = carray2.slice(-maxcs);
                replyEmbedData.fields[1].value = `\`${carray2.join('\n')}\``;
                firstReply.edit(messageEmbeds.reply(replyEmbedData));
                break;
            default:
                return message.client.emit('invalidCommandCall', `The command **${cmd}** was not found in the list of sub-commands for this operation.`, message);
        }
    }
}

module.exports = Git;
