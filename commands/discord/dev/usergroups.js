const usergroups    = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

usergroups.execute = async (message) => {
    const vulcan = this.command.client;
    const scmd   = message.parsed.args[0];

    if (!scmd) {
        return vulcan.emit(
            'invalidCommandUsage',
            message,
            `Usergroups command requires subcommand usage!`
        );
    }

    // Avoid writing it twice :)
    let maybeFirst = message.mentions.users.first();
    let targetID   = (maybeFirst && maybeFirst.id) || message.parsed.args[1];
    let output     = '';

    switch (scmd) {
        case 'set':
        case 'write':
            let newGroupName = message.parsed.args[2] || vulcan.defaultGroupName;

            if (!vulcan.hierarchy.get(newGroupName)) {
                return vulcan.emit(
                    'invalidCommandUsage',
                    message,
                    `Invalid usergroup! Input: ${newGroupName}`
                );
            }

            output = (await this.set(targetID, newGroupName))
                ? `Usergroup '${newGroupName}' set for id: ${targetID}.`
                : `Could not set usergroup for id: ${targetID}`;
            break;
        case 'get':
        case 'read':
            let checkedGroup = await this.get(targetID);

            output = (checkedGroup)
                ? `Usergroup of ${targetID} is '${checkedGroup}'`
                : `Could not find a usergroup linked to id: ${targetID}`;
            break;
        case 'hierarchy':
        case 'list':
        case 'usergroups':
            output = `\`\`\`js\n${JSON.stringify(await this.list())}\`\`\``
                + `\`\`\`js\n${JSON.stringify((await this.hierarchy()).toString())}\`\`\``;
            break;
        default:
            return vulcan.emit(
                'invalidCommandUsage',
                message,
                `Invalid subcommand as first argument!\n\tInput: \`${scmd}`
            );
    }

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                {
                    name : 'Output',
                    value: output
                }
            ]
        }
    ));
};

usergroups.set = async (targetID, newGroupName) => {
    const cachedUser = this.command.client.updateUsergroup(targetID, newGroupName);

    if (cachedUser && !cachedUser.bot) {
        (await cachedUser.createDM()).send(`Your usergroup has changed to: **${newGroupName}**!`);

        return true;
    }

    return false;
};

usergroups.get = async (targetID) => this.command.client.fetchUsergroup(targetID).name;

usergroups.list = async () => Array.from(this.command.client.usergroups.entries());

usergroups.hierarchy = async () => this.command.client.hierarchy;
