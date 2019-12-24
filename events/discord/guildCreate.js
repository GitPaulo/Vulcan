const logger = xrequire('./managers/LogManager').getInstance();

module.exports = async (guild) => {
    logger.log(`Vulcan joined a new guild: ${guild.name}(${guild.id})`);

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

    // Welcome message
    await guild.botChannel.send({
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
