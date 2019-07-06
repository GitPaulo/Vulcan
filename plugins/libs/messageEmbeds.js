const messageEmbeds = module.exports = {};

messageEmbeds.reply = (
    {
        message,
        imgPath     = message.command.embed.image,
        imgName     = imgPath.substring(imgPath.lastIndexOf('/') + 1),
        cmd         = message.command,
        color       = cmd.embed.color,
        title       = cmd.embed.title,
        author      = {
            name: `Replying@${message.author.tag}`,
            icon_url: message.author.displayAvatarURL(),
            url: message.author.displayAvatarURL()
        },
        description = `Replying to a request from **${message.author.tag}** for command **${message.command.id}**.`,
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
) => {
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
};

messageEmbeds.critical = (
    {
        title       = `Critical Error`,
        description = `A Critical Error has been detected by Vulcan.`,
        color       = 0x000000, // black
        thumbnail   = {
            url: `attachment://critical.png`
        },
        timestamp   = new Date(),
        footer      = {
            text: '[Error] This is bad. MAZUI! Vulcan will shutdown!'
        },
        fields      = [],
        url         = ''
    }
) => {
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
                attachment: './assets/media/images/general/critical.png',
                name: 'critical.png'
            }
        ]
    };
};

messageEmbeds.error = (
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
) => {
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
    };
};

messageEmbeds.warning = (
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
) => {
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
    };
};

messageEmbeds.info = (
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
) => {
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
    };
};
