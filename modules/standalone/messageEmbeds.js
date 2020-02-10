const messageEmbeds = module.exports;

/*
    * This file should only contained wraps that are used more than once!
    ! Do not create wraps for events.
    ! Any fields to omit/change from defaults must be force changed post embed wrap usage!
*/

messageEmbeds.reply = (
    {
        message,
        imgPath = message.command.embed.image,
        imgName = imgPath.substring(imgPath.lastIndexOf('/') + 1),
        cmd     = message.command,
        color   = cmd.embed.color,
        title   = cmd.embed.title,
        author  = {
            name    : `Replying@${message.author.tag}`,
            icon_url: message.author.displayAvatarURL(),   /* eslint-disable-line camelcase */
            url     : message.author.displayAvatarURL()
        },
        description = `Replying to a request from **${message.author.tag}** for command **${message.command.id}**.`,
        // ! if this is changed, image will be attached
        thumbnail   = {
            url: `attachment://${imgName}`
        },
        fields    = [],
        timestamp = new Date(),
        footer    = {
            text: `[Command request reply]`
        },
        url   = '',
        image = {},
        files = []
    }
) => ({
    embed: {
        color,
        author,
        title,
        description,
        thumbnail,
        fields,
        timestamp,
        footer,
        url,
        image
    },
    files: [
        {
            attachment: imgPath,
            name      : imgName
        },
        ...files
    ]
});

messageEmbeds.error = (
    {
        title       = `Error`,
        description = `An error has been detected by Vulcan.`,
        color       = 0xFF0000, // Red
        thumbnail   = {
            url: `attachment://error.png`
        },
        timestamp = new Date(),
        footer    = {
            text: '[Expected exception was thrown]'
        },
        fields = [],
        url    = ''
    }
) => ({
    embed: {
        title,
        description,
        color,
        thumbnail,
        timestamp,
        footer,
        fields,
        url
    },
    files: [
        {
            attachment: './assets/media/images/embeds/error.png',
            name      : 'error.png'
        }
    ]
});

messageEmbeds.warning = (
    {
        title       = `Warning`,
        description = 'Vulcan has detected unexpected behaviour.',
        color       = 0xFFFF00, // Orange
        thumbnail   = {
            url: `attachment://warning.png`
        },
        timestamp = new Date(),
        footer    = {
            text: '[Unexpected behaviour not controlled by vulcan]'
        },
        fields = [],
        url    = ''
    }
) => ({
    embed: {
        title,
        description,
        color,
        thumbnail,
        timestamp,
        footer,
        fields,
        url
    },
    files: [
        {
            attachment: './assets/media/images/embeds/warning.png',
            name      : 'warning.png'
        }
    ]
});

messageEmbeds.info = (
    {
        title       = `Information`,
        description = 'Vulcan has something to say?',
        color       = 0x89CFF0, // Blue
        thumbnail   = {
            url: `attachment://info.png`
        },
        timestamp = new Date(),
        footer    = {
            text: '[Informative message]'
        },
        fields = [],
        url    = ''
    }
) => ({
    embed: {
        title,
        description,
        color,
        thumbnail,
        timestamp,
        footer,
        fields,
        url
    },
    files: [
        {
            attachment: './assets/media/images/embeds/info.png',
            name      : 'info.png'
        }
    ]
});

messageEmbeds.PSA = (
    {
        title       = `Public Service Announcement (PSA)`,
        description = 'A PSA has been attempted.',
        color       = 0xFF7063, // Vulcan Red
        thumbnail   = {
            url: `attachment://psa.png`
        },
        timestamp = new Date(),
        footer    = {
            text: '[Global message]'
        },
        fields = [],
        url    = ''
    }
) => ({
    embed: {
        title,
        description,
        color,
        thumbnail,
        timestamp,
        footer,
        fields,
        url
    },
    files: [
        {
            attachment: './assets/media/images/embeds/psa.png',
            name      : 'psa.png'
        }
    ]
});
