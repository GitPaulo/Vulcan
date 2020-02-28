/**
 * ? Guild Create (Discord Event)
 * Emitted whenever the client joins a guild.
 * (https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildCreate)
 */

// Imports
const settings = xrequire('./prerequisites/settings');
const logger   = xrequire('./modules/logger').getInstance();

// ? Necessary permissions to join
const requiredPermissions = [
    'SEND_MESSAGES',
    'ADD_REACTIONS',
    'CONNECT',
    'SPEAK',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_TTS_MESSAGES',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MANAGE_CHANNELS',
    'MANAGE_MESSAGES'
];

module.exports = async (guild) => {
    // Log join
    logger.log(`Vulcan joined a new guild: ${guild.name}(${guild.id})`);

    // Rename
    const vulcan        = guild.client;
    const configuration = settings.configuration;

    // Check permissions
    const vulcanMember      = guild.member(vulcan.user);
    const vulcanPermissions = vulcanMember.permissions;

    // ! Don't join guild if vulcan has the wrong permissions
    if (!vulcanMember || !vulcanPermissions.has(requiredPermissions)) {
        let ownerChannel = await guild.owner.createDM();

        await ownerChannel.send(
            {
                embed: {
                    title      : `Guild Join Prevented`,
                    description: `I was **unable** to join your guild. This is likely due to a premissions issue.`,
                    color      : 0xFC7B7B, // Red
                    thumbnail  : {
                        url: `attachment://icon.png`
                    },
                    timestamp: new Date(),
                    footer   : {
                        text: '[Joining Process]'
                    },
                    fields: [
                        {
                            name : 'Missing Permissions',
                            value: `\`${requiredPermissions.difference(vulcanPermissions.toArray()) || '??'}\``
                        },
                        {
                            name : 'Invite Me',
                            value: vulcan.constants.client.invite || '??'
                        }
                    ],
                    url: ''
                },
                files: [
                    {
                        attachment: './assets/media/icons/icon.png',
                        name      : 'icon.png'
                    }
                ]
            }
        );

        // Explicit log
        logger.warning(`Could not join guild (${guild.id}) because of insuficient permissions`);

        return guild.leave();
    }

    // ? Create bot channel or fetch it
    let responseChannel = guild.findChannelsByName(vulcan.constants.guild.botChannel).first();

    if (!responseChannel) {
        responseChannel = await guild.channels.create(
            vulcan.constants.guild.botChannel,
            {
                type  : 'text',
                reason: 'Vulcan\'s chill place :)'
            }
        );
    }

    // Resolve owners by config id. Fetch bot channel, else dm.
    const owners = configuration.ownersID.map((id) => vulcan.users.resolve(id));

    // Temp
    let title;
    let description;

    // New guild? Request auth!
    if (!guild.authorised) {
        // Welcome message: Unauthorised
        title       = `Hello World!`,
        description = `Thank you for inviting Vulcan to your guild.\n\n`
                        + `This bot is intended for **private** use and is only maintained by one person.\n\n`
                        + `Right now Vulcan is set to \`safe\` mode, this means that, most of the bot features are **restricted** by default. `
                        + `A request has been sent to the authorisation moderators to grant access for this guild.\n\n`
                        + `You may send another request using the \`authorise\` command.`;
    } else {
        // Welcome message: Already Authorised
        title       = `Hello again?`,
        description = `This guild is already registered as **authorised**!\n`
                        + `Full access to Vulcan features is availabled on this guild.\n\n`;
    }

    // * Welcome Message
    await responseChannel.send({
        embed: {
            title,
            description,
            color    : 0xFC7B7B, // Red
            thumbnail: {
                url: `attachment://icon.png`
            },
            timestamp: new Date(),
            footer   : {
                text: '[Joining Process]'
            },
            fields: [
                {
                    name : 'Authorisation Moderators',
                    value: (owners.toString()) || 'Unknown'
                },
                {
                    name : 'Bot Prefixes',
                    value: `\`${configuration.prefixes.join(', ') || 'Unknown'}\``
                }
            ],
            url: ''
        },
        files: [
            {
                attachment: './assets/media/icons/icon.png',
                name      : 'icon.png'
            }
        ]
    });

    // Request authorisation
    vulcan.emit('authorisationRequest', vulcan.user, guild);
};
