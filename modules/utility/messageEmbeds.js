module.exports = messageEmbeds = {};

messageEmbeds.reply = function ( 
    { 
        replyeeMessage,
        cmd    = replyeeMessage.command,
        color  = cmd.embed.color,
        title  = cmd.embed.title, 
        author = {
            name:     'Replying@' + replyeeMessage.author.username,
            icon_url: replyeeMessage.author.avatarURL,
            url:      replyeeMessage.url
        },
        description = "", 
        fields      = [], 
        timestamp   = new Date(),
        footer      = {
            text: `Vulcan's reply to a command request!`
        },
        url         = "",
        extraFiles  = [],
    }
) {
    let imgPath   = replyeeMessage.command.embed.image; 
    let imgName   = imgPath.substring(imgPath.lastIndexOf('/') + 1);
    let thumbnail = { url: 'attachment://' + imgName };
    let files     = [
        {
            attachment: imgPath,
            name: imgName
        },
        ...extraFiles
    ];

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
        files,
    };
}

messageEmbeds.error = function (
    {
        title       = `Error`,
        description = "",
        color       = 0xFF0000, // red
        authorName  = "",
        author      = {
            name:      authorName,
            icon_url: `attachment://error.png` 
        },
        timestamp   = new Date(),
        footer      = {
            text: '[Error] An exception thrown by vulcan or something bad! Contact devs pls!'
        },
        fields      = [],
        url         = ""
    }
) {
    return {
        embed: {
            title,
            description,
            color,
            author,
            timestamp,
            footer,
            fields,
            url
        },
        files: [
            {
                attachment: './assets/media/images/general/error.png',
                name: 'error.png'
            },
        ]
    }
}

messageEmbeds.warning = function (
    {
        title       = `Warning`, 
        description = "",
        color       = 0xff8d00, // orange
        authorName  = "",
        author      = {
            name:      authorName,
            icon_url: `attachment://warning.png` 
        },
        timestamp   = new Date(),
        footer      = {
            text: '[Warning] An unexpected behaviour not controlled by vulcan.'
        },
        fields      = [],
        url         = ""
    }
) {
    return {
        embed: {
            title,
            description,
            color,
            author,
            timestamp,
            fields,
            footer,
            url
        },
        files: [
            {
                attachment: './assets/media/images/general/warning.png',
                name: 'warning.png'
            },
        ]
    }
}

messageEmbeds.info = function (
    {
        title       = `Information`,
        description = "",
        color       = 0x89CFF0, // bblue
        authorName  = "",
        author      = {
            name:      authorName,
            icon_url: `attachment://warning.png` 
        },
        timestamp   = new Date(),
        footer      = {
            text: '[Info] Information displayed by vulcan for the users.'
        },
        fields      = [],
        url         = "",
    }
) {
    return {
        embed: {
            title,
            description,
            color,
            author,
            timestamp,
            footer,
            fields,
            url
        },
        files: [
            {
                attachment: './assets/media/images/general/info.png',
                name: 'info.png'
            },
        ]
    }
}