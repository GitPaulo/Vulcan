var MessageEmbeds = {};

MessageEmbeds.cmdreply = function (text, requestMessage, replyFields=[], extraFiles=[]) {
    let cmd     = requestMessage.command;
    let imgPath = cmd.embed.image; 
    let imgName = imgPath.substring(imgPath.lastIndexOf("/")+1);
    
    return {
        embed: {
            color: cmd.embed.color,
            author: {
                name: "Replying@" + requestMessage.author.username,
                icon_url: requestMessage.author.avatarURL()
            },
            title: cmd.embed.title,
            description: text,
            thumbnail: {
                url: 'attachment://' + imgName,
            },
            fields : replyFields,
            timestamp: new Date(),
            footer: {
                text: "Vulcan's reply to a command request!"
            }
        },
        files: [
            {
                attachment: imgPath,
                name: imgName
            },
            ...extraFiles
        ]
    }
}

MessageEmbeds.error = function (message, title="Error!", ) {
    return {
        embed: {
            color: 0xFF0000, // red
            author: {
                name: authorName,
                icon_url: `attachment://error.png` 
            },
            title: title,
            description: message,
            timestamp: new Date(),
            footer: {
                text: "[Error] => An exception thrown by vulcan or something bad! Contact devs pls!"
            }
        },
        files: [
            {
                attachment: "./assets/media/images/general/error.png",
                name: 'error.png'
            },
        ]
    }
}

MessageEmbeds.warning = function (authorName = "", title, message) {
    return {
        embed: {
            color: 0xff8d00, // orange
            author: {
                name: authorName,
                icon_url: `attachment://warning.png`
            },
            title: title,
            description: message,
            timestamp: new Date(),
            footer: {
                text: "[Warning] => An unexpected behaviour not controlled by vulcan."
            }
        },
        files: [
            {
                attachment: "./assets/media/images/general/warning.png",
                name: 'warning.png'
            },
        ]
    }
}

MessageEmbeds.info = function (authorName = "", title, message) {
    return {
        embed: {
            color: 0xC0C0C0, // grey
            author: {
                name: authorName,
                icon_url: `attachment://info.png`
            },
            title: title,
            description: message,
            timestamp: new Date(),
            footer: {
                text: "[Info] => Information displayed by vulcan for the users."
            }
        },
        files: [
            {
                attachment: "./assets/media/images/general/info.png",
                name: 'info.png'
            },
        ]
    }
}

module.exports = MessageEmbeds;