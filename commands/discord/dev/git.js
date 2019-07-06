const git           = module.exports;
const GithubAPI     = xrequire('github-api');
const messageEmbeds = xrequire('./plugins/libs/messageEmbeds');

// eslint-disable-next-line no-unused-vars
git.load = (vulcan, commandDescriptor) => {
    this.git = new GithubAPI({
        token: vulcan.credentials.githubOAuth
    });
};

git.execute = async (message) => {
    const cmd       = message.parsed.args[0];
    const channel   = message.channel;
    const embedWrap = messageEmbeds.reply({
        message,
        title: `**Git** request received: **${cmd}**`,
        fields: [
            {
                name: 'Subcommand',
                value: message.parsed.args.join(', ')
            },
            {
                name: 'Output',
                value: 'Processing...'
            }
        ]
    });

    const reply = await channel.send(embedWrap);

    // Currently only commands about vulcan repo
    let vulcanRepo = this.git.getRepo('GitPaulo', 'Vulcan');

    switch (cmd) {
        case 'collaborators':
            const collabsArray = await this.fetchCollaborators(vulcanRepo);
            embedWrap.embed.fields[1].value = collabsArray.join(', ');
            break;
        case 'commits':
            const numCommits   = message.parsed.args[1];
            const commitsArray = await this.fetchCommits(vulcanRepo, numCommits);
            embedWrap.embed.fields[1].value = commitsArray.join('\n');
            break;
        default:
            return message.client.emit('invalidCommandCall', `The command **${cmd}** was not found in the list of sub-commands for this operation.`, message);
    }

    await reply.edit(embedWrap);
};

/*******************
 *  Extra Methods  *
*******************/

this.fetchCollaborators = async (repo) => {
    let response = await repo.getCollaborators();
    let list     = response.data;
    let carray   = [];

    list.forEach((collaboratorData) => {
        carray.push(collaboratorData.login);
    });

    return carray;
};

this.fetchCommits = async (repo, number = 4) => {
    let response  = await repo.listCommits();
    let list      = response.data.slice(0, number);
    let carray    = [];

    list.forEach((commitData) => {
        const dataStr = `Date: "${commitData.commit.author.date}"\nAuthor: "${commitData.commit.author.name}"\nMessage: "${commitData.commit.message}"\n`;
        carray.push(`\`\`\`yml\n${dataStr}\n\`\`\``);
    });

    carray.push(`[https://github.com/GitPaulo/Vulcan/commits/master]`);

    return carray;
};
