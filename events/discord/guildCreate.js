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

    // Bot channel may not exist because guilds may have no text channel
    const responseChannel = guild.botChannel || await guild.owner.createDM();

    // Message Wrap (save lines of code)
    const wrap = {
        embed: {
            color    : 0xFC7B7B, // Red
            thumbnail: {
                url: `attachment://icon.png`
            },
            timestamp: new Date(),
            footer   : {
                text: 'Hello everyone, I hope I can be of use! C:'
            },
            fields: [
                {
                    name : 'Authorisation Moderators',
                    value: tagOwners.toString()
                },
                {
                    name : 'Current Authorisation Status',
                    value: guild.authorised && 'authorised' || 'unauthorised'
                },
                {
                    name : 'Bot Prefix Expression',
                    value: `\`${guild.client.prefixRegex.source}\``
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
    };

    // New guild? Request auth!
    if (!guild.authorised) {
        guild.requestAuthorisation(); // Requestee === client.user

        // Welcome message: Unauthorised
        wrap.embed.title       = `Hello World!`,
        wrap.embed.description = `Thank you for inviting Vulcan to your guild.\n\n`
                            + `This bot is intended for **private** use and is only maintained by one person.\n\n`
                            + `Right now Vulcan is set to \`safe\` mode, this means that, most of the bot features are **restricted** by default. `
                            + `A request has been sent to the authorisation moderators to grant access for this guild.\n\n`
                            + `You may send another request using the \`authorise\` command.`;
    } else {
        // Welcome message: Already Authorised
        wrap.embed.title       = `Hello again?`,
        wrap.embed.description = `This guild is already registered as **authorised**!\n`
                            + `Full access to Vulcan features is availabled on this guild.\n\n`;
    }

    await responseChannel.send(wrap);
};
