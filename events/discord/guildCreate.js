const logger = xrequire('./managers/LogManager').getInstance();

module.exports = async (guild) => {
    logger.log(`Vulcan joined a new guild: ${guild.name}(${guild.id})`);

    // Check permissions
    // ! Don't join guild if vulcan has the wrong permissions
    const vulcanMember      = guild.member(guild.client.user);
    const vulcanPermissions = vulcanMember.permissions;

    if (
        !vulcanMember
        || !(vulcanPermissions.has('SEND_MESSAGES') && vulcanPermissions.has('ADD_REACTIONS'))
    ) {
        let ownerChannel = await guild.owner.createDM();

        await ownerChannel.send(
            `Hello!\nI could not join guild your guild (${guild.id}) because of insuficient permissions.`
            + `\nPlease use: https://discordapp.com/oauth2/authorize?client_id=604662534410207233&scope=bot&permissions=1341644225`
        );

        logger.warning(`Could not join guild (${guild.id}) because of insuficient permissions`);

        return guild.leave();
    }

    // Turn into actual names, if valid
    let tagOwners = guild.client.configuration.ownersID.map((ownerID) => {
        let owner = guild.client.users.get(ownerID);

        if (owner) {
            return owner.tag;
        }

        return ownerID;
    });

    // New guild? Request auth!
    if (!guild.authorised) {
        guild.requestAuthorisation(); // Requestee === client.user
    }

    // Bot channel may not exist because guilds may have no text channel
    const responseChannel = guild.botChannel || await guild.owner.createDM();

    // Welcome message
    await responseChannel.send({
        embed: {
            title      : `Hello World!`,
            description: `Thank you for inviting Vulcan to your guild.\n\n`
                        + `This bot is intended for **private** use and is only maintained by one person.\n\n`
                        + `Currently, Vulcan is set to 'safe' mode, this means that most of the bot features are restricted by default. `
                        + `A request has been sent to the authorisation moderators in order grant access for this guild.\n\n`
                        + `You may send another request using the \`authorise\` command.`,
            color    : 0xFC7B7B, // Red
            thumbnail: {
                url: `attachment://icon.png`
            },
            timestamp: new Date(),
            footer   : {
                text: 'Hello everyone, I hope can be of use! C:'
            },
            fields: [
                {
                    name : 'Authorisation Moderators',
                    value: tagOwners.toString()
                },
                {
                    name : 'Previous Authorisation Status',
                    value: guild.authorised && 'authorised' || 'unauthorised'
                }
            ],
            url: ''
        },
        files: [
            {
                attachment: './assets/media/images/vulcan/icon.png',
                name      : 'icon.png'
            }
        ]
    });
};
