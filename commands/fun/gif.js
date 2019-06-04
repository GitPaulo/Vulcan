const fs            = require('fs');
const path          = require('path');
const http          = require('http');
const Command       = require('../../structures/classes/Command');
const messageEmbeds = require('../../modules/utility/messageEmbeds');
const stringAlgorithms = require('../../modules/utility/stringAlgorithms');

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
                title: `Gif Commands!`,
                image: './assets/media/images/commands/Gif.gif',
            }
        });

        // Create gif folder 
        let folder_name  = 'gifs';
        let rootPath     = path.dirname(require.main.filename);
        this.folderPath  = path.join(rootPath, 'data', folder_name);
        this.allowedExtensions = ['.png', '.jpg', '.mp4', '.gif'];

        // Create Gif folder (where we store all downloaded gifs)
        if (!fs.existsSync(this.folderPath)) {
            fs.mkdirSync(this.folderPath);
        }
    }

    async validate(message) {
        return true; // if true execute() will run
    }

    async execute(message) {
        let reply = await message.channel.send('**Processing request...**');;
        let cmd   = message.args[0];

        switch (cmd) {
            case 'store': case 'upload': case 'put':
                let keyword = message.args[1];
                let data    = message.args[2];
                if (stringAlgorithms.isURL(data)) {    
                    this.storeImageFromURL(keyword, data, async (result) => {
                        await reply.edit(result);
                    });
                } else { // its file upload
                    let messageWithImage;
                    try {
                        console.log(data);
                        messageWithImage = await message.channel.fetchMessage(String(data));
                    } catch (err) {
                        let replyEmbed = messageEmbeds.warning(
                            message.author.username,
                            this.constructor.name + ' -> Unknown channel message', 
                            'The message with id: **' + data + '** was not found in the list of messages from this channel.', 
                        );
                        await message.channel.send(replyEmbed);
                        return;
                    }
                    this.storeImageFromMessage(keyword, messageWithImage, async (result) => {
                        await reply.edit(result);
                    });
                }
                break;
            case 'get': case 'fetch':
                let potentialKeyword = message.args[1];
                this.fetchImage(potentialKeyword, async (result) => {
                    console.log("RESULT: ", result);
                    await message.channel.send({
                        files: [result]
                    });
                });
                break;
            case 'list': case 'all':
                // some sort of listing, because this can grow large, publish to pastebin?
                await message.channel.send('**[NOT IMPLEMENTED YET]**');
                break;
            default:
                let replyEmbed = messageEmbeds.warning(
                    message.author.username,
                    'Invalid "' + this.constructor.name + '" sub-command!', 
                    'The command **' + cmd + '** was not found in the list of sub-commands for this operation. Please try again or check documentation.', 
                );
                await message.channel.send(replyEmbed);
                break;
        }
    }

    storeImageFromMessage(fileName, message, callback) {
        let files = message.attachments;

        for (let [key, attachment] of files) {
            this.storeImageFromURL(fileName, attachment.proxyURL);
        }

        console.log(message.attachments);
        if (callback)
            callback("completed!");
    }

    storeImageFromURL(fileName, url, callback) {
        // make sure it is http
        url = url.replace('https://', 'http://');

        let extension = url.substr(url.lastIndexOf('.'));
        if (!this.allowedExtensions.includes(extension)) {
            if (callback)
                callback("Invalid extension!"); 
            return;
        }

        let filePath = path.join(this.folderPath, fileName + extension);
        let file = fs.createWriteStream(filePath);

        let request = http.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(); // close() is async, call callback after close completes.
                if (callback) 
                    callback("File stored!");
            });
        }).on('error', function (err) { // Handle errors
            fs.unlink(this.folderPath); // Delete the file async. (But we don't check the result)
            if (callback) 
                callback(err.message);
        });
    };

    fetchImage(keyword, callback) {
        fs.readdir(this.folderPath, (err, files) => {
            // handling error
            if (err) {
                if (callback) 
                    callback(err.message);
            } 

            let filePath = 'N/A';
            let hvalue   = 0;

            files.forEach(function (file) {
                let cvalue = stringAlgorithms.levenshteinSimilarity(keyword, file);
                if (cvalue > hvalue){
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