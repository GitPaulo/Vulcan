const gif             = module.exports;
const util            = xrequire('util');
const fs              = xrequire('fs');
const path            = xrequire('path');
const http            = xrequire('http');
const messageEmbeds   = xrequire('./plugins/libs/messageEmbeds');
const stringFunctions = xrequire('./plugins/libs/stringFunctions');
// const logger           = xrequire('./managers/LogManager').getInstance();

// Promisify fs functions
const readdir = util.promisify(fs.readdir);

// eslint-disable-next-line no-unused-vars
gif.load = (vulcan, commandDefinition) => {
    this.folderPath        = path.join(__basedir, 'data', 'gifs');
    this.allowedExtensions = ['.png', '.jpg', '.mp4', '.gif'];

    // Create Gif folder (where we store all downloaded gifs)
    if (!fs.existsSync(this.folderPath)) {
        fs.mkdirSync(this.folderPath);
    }
};

gif.execute = async (message) => {
    let cmd = message.parsed.args[0];

    const channel   = message.channel;
    const embedWrap = messageEmbeds.reply({
        message,
        title : `**Gif** request received: **${cmd}**`,
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

    const noreply = (cmd.substr(0, 3) === 'nr-') && (cmd = cmd.substr(3));
    const reply   = !noreply && await channel.send(embedWrap);
    const numArgs = message.parsed.args.length;

    switch (cmd) {
        /* Stores media from URL or File (from message id) by id */
        case 'store':
        case 'upload':
        case 'put':
            // Check arguments [!gif store <url> <id>]
            if (numArgs < 3) {
                return message.client.emit('invalidCommandCall', `Expected 3 arguments got ${numArgs}.`, message);
            }

            // ID must come last to support multiple arguments easily
            const [, url, ...idArray] = message.parsed.args;
            const id                  = idArray.join(' ');

            if (stringFunctions.isURL(url)) {
                await this.storeImageFromURL(url, id);
            } else { // its file upload
                let messageWithImage;

                try {
                    messageWithImage = await message.channel.fetchMessage(String(url));
                } catch (err) {
                    return message.client.emit(
                        'invalidCommandCall',
                        'The message with id: **' + url + '** was not found in the list of messages from this channel.',
                        message
                    );
                }

                this.storeImageFromMessage(id, messageWithImage);
            }

            embedWrap.embed.fields[1].value = 'Completed!';
            break;
        /* Fetches stored media by id (data/gifs) */
        case 'get':
        case 'fetch':
            if (numArgs < 2) {
                return message.client.emit('invalidCommandCall', `Expected 1 arguments got ${numArgs}.`, message);
            }

            const input  = message.parsed.args[1];
            const result = await this.fetchImage(input);

            embedWrap.embed.fields[1].value = result;

            await message.channel.send({
                files: [result]
            });
            break;
        /* Lists all entries of media. */
        case 'list':
        case 'all':
            const files = await this.getImages();

            embedWrap.embed.fields[1].value = `\`\`\`\n${files.join(', ')}\n\`\`\``;
            break;
        default:
            return message.client.emit('invalidCommandCall', `The command **${cmd}** was not found in the list of sub-commands for this operation.`, message);
    }

    if (!noreply) {
        // console.log("NANI!???", reply)
        await reply.edit(embedWrap);
    }
};

/*******************
 *  Extra Methods  *
*******************/

gif.getImages = () => readdir(this.folderPath);

gif.storeImageFromMessage = (fileName, message) => {
    let attachments = message.attachments;
    let i           = 0;

    attachments.forEach((attachment) => {
        this.storeImageFromURL(attachment.proxyURL, fileName + (i > 0 ? i++ : i++, ''));
    });
};

gif.storeImageFromURL = async (url, fileName) => {
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

gif.fetchImage = async (keyword) => {
    const files = await readdir(this.folderPath);

    let filePath = 'N/A';
    let hvalue   = 0;

    files.forEach((file) => {
        let cvalue = stringFunctions.levenshteinSimilarity(keyword, file);

        if (cvalue > hvalue) {
            filePath = file;
            hvalue   = cvalue;
        }
    });

    return path.join(this.folderPath, filePath);
};
