const fs               = xrequire('fs');
const path             = xrequire('path');
const http             = xrequire('http');
const Command          = xrequire('./structures/classes/Command');
const messageEmbeds    = xrequire('./modules/utility/messageEmbeds');
const stringAlgorithms = xrequire('./modules/utility/stringAlgorithms');

class Gif extends Command {
    constructor(type) { // type = root folder name (passed on by command loader)
        super(type, {
            name: 'gif',
            aliases: ['GIF'],
            group: 'group2',
            description: 'Retrieves a Gif from the database',
            examples: ['gif store somegif http://somegif.jpg', 'gif get somegif', 'gif all'],
            throttling: 2000,
            args: [],
            embed: {
                color: 0x666666,
                title: `Gif`,
                image: './assets/media/images/commands/Gif.gif',
            }
        });

        this.folderPath        = path.join(__basedir, 'data', 'gifs');
        this.allowedExtensions = ['.png', '.jpg', '.mp4', '.gif'];

        // Create Gif folder (where we store all downloaded gifs)
        if (!fs.existsSync(this.folderPath)) {
            fs.mkdirSync(this.folderPath);
        }
    }

    async validate(message) {
        return true;
    }

    async execute(message) {
        let cmd        = message.args[0];
        let channel    = message.channel;
        let replyEmbedData = {
            replyeeMessage: message,
            title: `Gif request received: **${cmd}**`,
            fields: [
                {
                    name: 'Arguments',
                    value: message.args.join(', ')
                },
                {
                    name: 'Output',
                    value: 'Processing...'
                }
            ]
        };

        let firstReply = await channel.send(messageEmbeds.reply(replyEmbedData));

        switch (cmd) {
            case 'store':
            case 'upload':
            case 'put':
                let n = message.args.length;
                if (n < 3)
                    return message.client.emit('invalidCommandCall', `Expected 3 arguments got ${n}.`, message);
                let keyword = message.args[1];
                let data    = message.args[2];
                if (stringAlgorithms.isURL(data)) {
                    this.storeImageFromURL(keyword, data, async (result) => {
                        replyEmbedData.fields[1].value = result;
                        firstReply.edit(messageEmbeds.reply(replyEmbedData));
                    });
                } else { // its file upload
                    let messageWithImage;
                    try {
                        messageWithImage = await message.channel.fetchMessage(String(data));
                    } catch (err) {
                        return message.client.emit('invalidCommandCall', 'The message with id: **' + data + '** was not found in the list of messages from this channel.', message);
                    }
                    this.storeImageFromMessage(keyword, messageWithImage, async (result) => {
                        replyEmbedData.fields[1].value = result;
                        firstReply.edit(messageEmbeds.reply(replyEmbedData));
                    });
                }
                break;
            case 'get':
            case 'fetch':
                let potentialKeyword = message.args[1];
                if (!potentialKeyword)
                    return message.client.emit('invalidCommandCall', `There were invalid arguments for the "fetch" request: arg[1] = ${potentialKeyword}`, message);
                this.fetchImage(potentialKeyword, async (result) => {
                    replyEmbedData.fields[1].value = result, 
                    firstReply.edit(messageEmbeds.reply(replyEmbedData));
                    await message.channel.send({
                        files: [result]
                    });
                });
                break;
            case 'list':
            case 'all':
                this.getImages(async (err, files) => {
                    replyEmbedData.fields[1].value = files.join(', ');
                    firstReply.edit(messageEmbeds.reply(replyEmbedData));
                });
                break;
            default:
                return message.client.emit('invalidCommandCall', `The command **${cmd}** was not found in the list of sub-commands for this operation.`, message);
        }
    }

    getImages(callback) {
        fs.readdir(this.folderPath, callback);
    }

    storeImageFromMessage(fileName, message, callback) {
        let attachments = message.attachments;
        let i = 0;

        attachments.forEach(attachment => {
            this.storeImageFromURL(fileName + (i>0 ? i++ : i++, ""), attachment.proxyURL);
        });

        if (callback)
            callback("completed!");
    }

    storeImageFromURL(fileName, url, callback) {
        // Only 'http' allowed with GET
        url = url.replace('https://', 'http://');

        let extension = url.substr(url.lastIndexOf('.'));
        if (!this.allowedExtensions.includes(extension)) {
            if (callback)
                callback("Invalid extension!");
            return;
        }

        let filePath = path.join(this.folderPath, fileName + extension);
        let file = fs.createWriteStream(filePath);

        try {
            http.get(url, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                    file.close(); 
                    if (callback)
                        callback("File stored!");
                });
            }).on('error', function (err) { // Handle errors
                fs.unlink(this.folderPath); // Delete the file async. (But we don't check the result)
                if (callback)
                    callback(err.message);
            });
        } catch (err) {
            if (callback)
                callback(err.message)
        }
    };

    fetchImage(keyword, callback) {
        fs.readdir(this.folderPath, (err, files) => {
            if (err) {
                if (callback)
                    callback(err.message);
            }

            let filePath = 'N/A';
            let hvalue   = 0;

            files.forEach(function (file) {
                let cvalue = stringAlgorithms.levenshteinSimilarity(keyword, file);
                if (cvalue > hvalue) {
                    filePath = file;
                    hvalue   = cvalue;
                }
            });

            if (callback)
                callback(path.join(this.folderPath, filePath));
        });
    }
}

module.exports = Gif;