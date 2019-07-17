const usergroups    = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

usergroups.execute = async (message) => {
    const vulcan = this.vulcan;
    const scmd   = message.parsed.args[0];

    if (!scmd) {
        return vulcan.emit(
            'invalidCommandCall',
            message,
            `Usergroups command requires subcommand usage!`
        );
    }

    // Avoid writing it twice :)
    const maybeFirst = message.mentions.users.first();
    const targetID   = (maybeFirst && maybeFirst.id) || message.parsed.args[1];

    let output = '';

    switch (scmd) {
        case 'set':
        case 'write':
            const newGroupName = message.parsed.args[2] || vulcan.defaultGroupName;

            if (!vulcan.hierarchy.get(newGroupName)) {
                return vulcan.emit(
                    'invalidCommandCall',
                    message,
                    `Invalid usergroup! Input: ${newGroupName}`
                );
            }

            output = await this.set(targetID, newGroupName);
            break;
        case 'get':
        case 'read':
            output = await this.get(targetID);
            break;
        case 'list':
        case 'usergroups':
            output = await this.list();
            break;
        default:
            return vulcan.emit(
                'invalidCommandCall',
                message,
                `Invalid subcommand as first argument!\n\tInput: \`${scmd}`
            );
    }

    await message.channel.send(messageEmbeds.reply({
        message,
        fields: [
            {
                name : 'Output',
                value: output
            }
        ]
    }));
};

usergroups.set = async (targetID, newGroupName) => {
    const cachedUser = this.vulcan.updateUsergroup(targetID, newGroupName);

    if (cachedUser && !cachedUser.bot) {
        (await cachedUser.createDM()).send(`Your usergroup has changed to: **${newGroupName}**!`);
    }

    return `Successfully updated usergroup of **(${targetID})** to: **${newGroupName}**!`;
};

usergroups.get = async (targetID) => this.vulcan.fetchUsergroup(targetID).name;

usergroups.list = async () => `\`\`\`js\n${JSON.stringify(Array.from(this.vulcan.usergroups.entries()))}\n\`\`\``;
