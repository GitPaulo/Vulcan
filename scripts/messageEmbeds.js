var MessageEmbeds = {};

MessageEmbeds.error = function(authorName = "", title, message) {
    return {
        embed: {
            color: 0xFF0000, // red
            author: {
                name: authorName,
                icon_url: `https://tinyurl.com/y77ryuwp` // save as files SOON TM
            },
            title: title,
            description: message,
            timestamp: new Date(),
            footer: {
                text: "A Error: An exception thrown by vulcan or something bad! Contact devs pls!"
            }
        }
    }
}

MessageEmbeds.warning = function(authorName = "", title, message) {
    return {
        embed: {
            color: 0xff8d00, // orange
            author: {
                name: authorName,
                icon_url: `https://tinyurl.com/y838d92m` // save as files SOON TM
            },
            title: title,
            description: message,
            timestamp: new Date(),
            footer: {
                text: "A warning: An unexpected behaviour not controlled by vulcan."
            }
        }
    }
}

MessageEmbeds.info = function (authorName = "", title, message) {
    return {
        embed: {
            color: 0xC0C0C0, // grey
            author: {
                name: authorName,
                // icon_url: `https://tinyurl.com/y838d92m` // save as files SOON TM
            },
            title: title,
            description: message,
            timestamp: new Date(),
            footer: {
                text: "An info box: Information displayed to the user."
            }
        }
    }
}



module.exports = MessageEmbeds;