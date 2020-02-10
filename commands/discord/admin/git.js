const git           = module.exports;
const GithubAPI     = xrequire('github-api');
const messageEmbeds = xrequire('./modules/standalone/messageEmbeds');

// eslint-disable-next-line no-unused-vars
git.load = (commandDescriptor) => {
    this.git = new GithubAPI({
        token: this.command.client.credentials.apiKeys.github
    });
};

git.execute = async (message) => {
    // Always target Vulcan repo. (do this in load?)
    const scmd       = message.parsed.args[0];
    const vulcanRepo = this.git.getRepo('GitPaulo', 'Vulcan');
    const embedWrap  = messageEmbeds.reply(
        {
            message,
            title : `**Git** request received: **${scmd}**`,
            fields: [
                {
                    name : 'Request',
                    value: message.parsed.args.join(', ')
                },
                {
                    name : 'Output',
                    value: '`Processing...`'
                }
            ]
        }
    );

    // For cleaner code
    let action     = null;
    let parameters = [];

    switch (scmd) {
        case 'collaborators': {
            action = this.fetchCollaborators;
            parameters.push(vulcanRepo);
            break;
        }
        case 'commits': {
            const _this = this;

            action = async (...args) => (await _this.fetchCommits(...args)).map((commit) => '```yml\n' + commit + '```');
            parameters.push(vulcanRepo);
            parameters.push(message.parsed.args[1]);
            break;
        }
        default: {
            return message.client.emit(
                'invalidCommandUsage',
                message,
                `The command **${scmd}** was not found in the list of sub-commands for this operation.`
            );
        }
    }

    // First reply
    let reply = await message.channel.send(embedWrap);

    // Edit reply based on action response
    embedWrap.embed.fields[1].value = (await action(...parameters)).join('');
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
    let response = await repo.listCommits();
    let list     = response.data.slice(0, number);
    let carray   = [];

    list.forEach((commitData) => {
        const dataStr = `Date: "${commitData.commit.author.date}"\nAuthor: "${commitData.commit.author.name}"\nMessage: "${commitData.commit.message}"\n`;

        carray.push(dataStr);
    });

    carray.push(`[http://github.com/GitPaulo/Vulcan/commits/master]`);

    return carray;
};
