module.exports = messageEmbeds = {};

messageEmbeds.reply = function (
    {
        replyeeMessage,
        imgPath     = replyeeMessage.command.embed.image,
        imgName     = imgPath.substring(imgPath.lastIndexOf('/') + 1),
        cmd         = replyeeMessage.command,
        color       = cmd.embed.color,
        title       = cmd.embed.title,
        author      = {
            name: `Replying@${replyeeMessage.author.username}`,
            icon_url: replyeeMessage.author.avatarURL,
            url: replyeeMessage.url
        },
        description = `Replying to a request from **${replyeeMessage.author.username}** for command **${replyeeMessage.command.name}**.`,
        thumbnail   = {
            url: `attachment://${imgName}`
        },
        fields      = [],
        timestamp   = new Date(),
        footer      = {
            text: `[Command] Vulcan's reply to a command request.`
        },
        url         = '',
        files       =  [
            {
                attachment: imgPath,
                name: imgName
            }
        ]
    }
) {
    console.log(imgName, imgPath, thumbnail, files)
    return {
        embed: {
            color,
            author,
            title,
            description,
            thumbnail,
            fields,
            timestamp,
            footer,
            url
        },
        files
    };
}

messageEmbeds.error = function (
    {
        title       = `Error`,
        description = `An error has been detected by Vulcan.`,
        color       = 0xFF0000, // red
        thumbnail   = {
            url: `attachment://error.png`
        },
        timestamp   = new Date(),
        footer      = {
            text: '[Error] An exception thrown by vulcan or something bad! Contact devs pls!'
        },
        fields      = [],
        url         = ''
    }
) {
    return {
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
                attachment: './assets/media/images/general/error.png',
                name: 'error.png'
            }
        ]
    }
}

messageEmbeds.warning = function (
    {
        title       = `Warning`,
        description = 'Vulcan has detected unexpected behaviour.',
        color       =  0xFFFF00, // orange
        thumbnail   = {
            url: `attachment://warning.png`
        },
        timestamp   = new Date(),
        footer      = {
            text: '[Warning] An unexpected behaviour not controlled by vulcan.'
        },
        fields      = [],
        url         = ''
    }
) {
    return {
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
                attachment: './assets/media/images/general/warning.png',
                name: 'warning.png'
            }
        ]
    }
}

messageEmbeds.info = function (
    {
        title       = `Information`,
        description = 'Vulcan has something to say?',
        color       = 0x89CFF0, // bblue
        thumbnail   = {
            url: `attachment://info.png`
        },
        timestamp   = new Date(),
        footer      = {
            text: '[Info] Information displayed by vulcan for the users.'
        },
        fields      = [],
        url         = ''
    }
) {
    return {
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
                attachment: './assets/media/images/general/info.png',
                name: 'info.png'
            }
        ]
    }
}
