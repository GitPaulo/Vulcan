const messageEmbeds = module.exports;

/**
 * * Note
 * This file should only contained wraps that are used more than once!
 * ! Do not create wraps for events.
 * ! Any fields to omit/change from defaults must be force changed post embed wrap usage.
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
            name    : message.author.tag,
            icon_url: message.author.displayAvatarURL(),   /* eslint-disable-line camelcase */
            url     : message.author.displayAvatarURL()
        },
        description = ``,
        // ! if this is changed, image will be attached
        thumbnail   = {
            url: `attachment://${imgName}`
        },
        fields    = [],
        timestamp = new Date(),
        footer    = {
            text: `[Command Response]`
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
            text: '[Expected Exception]'
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
            attachment: './assets/media/embeds/general/error.png',
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
            text: '[Unexpected Exception]'
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
            attachment: './assets/media/embeds/general/warning.png',
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
            text: '[Informative Message]'
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
            attachment: './assets/media/embeds/general/info.png',
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
            text: '[Global Message]'
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
            attachment: './assets/media/embeds/general/psa.png',
            name      : 'psa.png'
        }
    ]
});

messageEmbeds.musicManager = (
    {
        title       = `Music Manager`,
        description = `Music Manager wishes to notify you about something?`,
        color       = 0xFFC07A,
        thumbnail   = {
            url: `attachment://musicManager.gif`
        },
        timestamp = new Date(),
        footer    = {
            text: '[Music Manager]'
        },
        fields = [],
        url    = '',
        image  = {}
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
        url,
        image
    },
    files: [
        {
            attachment: './assets/media/embeds/general/musicManager.gif',
            name      : 'musicManager.gif'
        }
    ]
});
