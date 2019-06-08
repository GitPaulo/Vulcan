const Discord          = xrequire('discord.js');
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

        // Create gif folder 
        let folder_name = 'gifs';
        let rootPath    = __basedir;
        this.folderPath = path.join(rootPath, 'data', folder_name);
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
                let keyword = message.args[1];
                let data    = message.args[2];
                if (typeof data === undefined  || data === "" 
                    || typeof keyword == undefined || typeof keyword === undefined) {
                    await message.channel.send(messageEmbeds.warning(
                        {
                            authorName: message.author.username,
                            title:      this.constructor.name + ' -> Invalid arguments.',
                            description: `There were invalid arguments for the "put" request: arg[1] = ${keyword}, arg[2] = ${data}`
                        }
                    ));
                    return;
                }
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
                        await message.channel.send(messageEmbeds.warning(
                            {
                                authorName: message.author.username,
                                title:      this.constructor.name + ' -> Unknown channel message',
                                description: 'The message with id: **' + data + '** was not found in the list of messages from this channel.'
                            }
                        ));
                        return;
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
                if (!potentialKeyword) {
                    await message.channel.send(messageEmbeds.warning(
                        {
                            authorName: message.author.username,
                            title:      this.constructor.name + ' -> Invalid arguments.',
                            description:`There were invalid arguments for the "fetch" request: arg[1] = ${potentialKeyword}`
                        }
                    ));
                    return;
                }
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
                await message.channel.send(messageEmbeds.warning(
                    {
                        authorName: message.author.username,
                        title: '    Invalid "' + this.constructor.name + '" sub-command!',
                        description:'The command **' + cmd + '** was not found in the list of sub-commands for this operation. Please try again or check documentation.',
                    }
                ));
                break;
        }
    }

    getImages(callback) {
        fs.readdir(this.folderPath, callback);
    }

    storeImageFromMessage(fileName, message, callback) {
        let files = message.attachments;

        for (let [key, attachment] of files) {
            this.storeImageFromURL(fileName, attachment.proxyURL);
        }

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
            let request = http.get(url, function (response) {
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