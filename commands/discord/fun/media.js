const media           = module.exports;
const util            = xrequire('util');
const fs              = xrequire('fs');
const path            = xrequire('path');
const http            = xrequire('http');
const messageEmbeds   = xrequire('./utility/modules/messageEmbeds');
const stringFunctions = xrequire('./utility/modules/stringFunctions');
// const logger       = xrequire('./managers/LogManager').getInstance();

// Promisify fs functions
const readdir = util.promisify(fs.readdir);

// eslint-disable-next-line no-unused-vars
media.load = (commandDefinition) => {
    this.omitReplyPrefix   = 'or-';
    this.folderPath        = path.join(__basedir, 'data', 'media');
    this.allowedExtensions = ['.png', '.jpg', '.mp4', '.gif'];

    // Create Media folder (where we store all downloaded media)
    if (!fs.existsSync(this.folderPath)) {
        fs.mkdirSync(this.folderPath);
    }
};

media.execute = async (message) => {
    const omitReply = (message.parsed.args[0].substr(0, 3) === this.omitReplyPrefix);
    const scmd      = omitReply && message.parsed.args[0].substr(3) || message.parsed.args[0];
    const numArgs   = message.parsed.args.length;
    const embedWrap = messageEmbeds.reply({
        message,
        title : `**Media** request received: **${scmd}**`,
        fields: [
            {
                name : 'Arguments',
                value: message.parsed.args.join(', ')
            },
            {
                name : 'Output',
                value: 'Processing...'
            }
        ]
    });

    // For cleaner code
    let action     = null;
    let parameters = [];

    switch (scmd) {
        case 'store':
        case 'upload':
        case 'put': {
            if (numArgs < 3) {
                return message.client.emit(
                    'invalidCommandUsage',
                    `Expected 3 arguments got ${numArgs}.`,
                    message
                );
            }

            action = this.store;
            parameters.push(message.parsed.args[1]); // ID
            parameters.push(message.parsed.args[2]); // URL
            parameters.push(message.channel);

            break;
        }
        case 'fetch':
        case 'dwonload':
        case 'get': {
            if (numArgs < 2) {
                return message.client.emit(
                    'invalidCommandUsage',
                    message,
                    `Expected 1 arguments got ${numArgs}.`
                );
            }

            action = this.fetch;
            parameters.push(message.parsed.args[1]);
            parameters.push(message.channel);

            break;
        }
        case 'list':
        case 'all': {
            action = this.list;

            break;
        }
        default: {
            return message.client.emit(
                'invalidCommandUsage',
                message,
                `The command **${scmd}** was not found in the list of sub-commands for this operation.`
            );
        }
    }

    // In the case users want just the picture!
    if (omitReply) {
        await action(...parameters);

        return;
    }

    // First reply
    let reply = await message.channel.send(embedWrap);

    // Edit reply based on action response
    embedWrap.embed.fields[1].value = (await action(...parameters));
    await reply.edit(embedWrap);
};

/*******************
 *  Extra Methods  *
*******************/

media.getImages = () => readdir(this.folderPath);

media.storeImageFromMessage = (fileName, message) => {
    let attachments = message.attachments;
    let i           = 0;

    attachments.forEach((attachment) => {
        this.storeImageFromURL(attachment.proxyURL, fileName + (i > 0 ? i++ : i++, ''));
    });
};

media.storeImageFromURL = async (url, fileName) => {
    // Only 'http' allowed with GET
    url = url.replace('https://', 'http://');

    let extension = url.substr(url.lastIndexOf('.'));

    if (!this.allowedExtensions.includes(extension)) {
        return Error('Invalid extension!');
    }

    let filePath = path.join(this.folderPath, fileName + extension);
    let file     = fs.createWriteStream(filePath);

    try {
        await http.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
            });
        });
    } catch (err) {
        fs.unlink(this.folderPath); // Delete the file async. (But we don't check the result)
        throw err;
    }
};

media.fetchImage = async (keyword) => {
    const files = await readdir(this.folderPath);

    let filePath = null;
    let hvalue   = 0;

    files.forEach((file) => {
        let cvalue = stringFunctions.levenshtein(keyword, file);

        if (cvalue > hvalue) {
            filePath = file;
            hvalue   = cvalue;
        }
    });
    
    return filePath ? path.join(this.folderPath, filePath) : false;
};

/******************
 *  SCMD Methods  *
*******************/

media.store = async (id, url, channel) => {
    try {
        if (stringFunctions.isURL(url)) {
            await this.storeImageFromURL(url, id);
        } else { // It is a file upload
            let messageWithImage = await channel.fetchMessage(String(url));

            this.storeImageFromMessage(id, messageWithImage);
        }
    } catch (err) {
        return `\`\`\`\nError while storing gif: ${url}\nMessage: ${err.message}\`\`\``;
    }

    return `\`Gif stored with id: '${id}'\``;
};

media.fetch = async (id, channel) => {
    const result = await this.fetchImage(id);

    if (!result) {
        return `\`Unable to fetch gif with id: ${id}\``;
    }

    await channel.send(
        {
            files: [result]
        }
    );

    return `\`Gif with id '${id}' fetched!\``;
};

media.list = async () => {
    const files = await this.getImages();

    if (files.length <= 0) {
        return `\`There are no media stored!\``;
    }

    return `\`\`\`\n${files.join(', ')}\`\`\``;
};
