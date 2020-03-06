/**
 * ? Handler file
 * Handles the preprocessing of all messages before they are sent by vulcan.
 * ! Code in this file may heavily impact performance. Be effecient.
 * TODO: Could use A LOT of improvement.
 */

const fs       = xrequire('fs');
const path     = xrequire('path');
const hastebin = xrequire('./modules/hastebin');
const logger   = xrequire('./modules/logger').getInstance();

// Structures
const {
    DMChannel,
    TextChannel,
    APIMessage
}  = xrequire('discord.js');

// File Constants
const MaxFileSizeMB   = 8;
const CharacterLimits = {
    content: 2000,
    embed  : {
        title      : 256,
        authorName : 256,
        description: 2048,
        fieldTitle : 256,
        fieldValue : 1024,
        fieldLimit : 25,
        footer     : 2048
    }
};

module.exports = async (channel, wrap) => {
    // ? Already a message!
    if (!(wrap instanceof APIMessage)) {
        return wrap;
    }

    // ? We only apply these to these channels
    if (!(channel instanceof DMChannel
        || channel instanceof TextChannel)) {
        return APIMessage.create(
            channel,
            wrap
        );
    }

    // ? Create wrap
    if (typeof wrap === 'string') {
        wrap = {
            content: wrap,
            embed  : null,
            files  : []
        };
    }

    // Debug
    // console.log('MF HANDLER =========\n');
    // console.log(wrap);

    // Shorten code
    const vulcan = channel.client;

    /**
     * ? Attachements Check (Size)
     * Go through all files and check for discord size limit.
     */
    let largeFiles = [];

    if (wrap.files) {
        // Check for large files
        for (let i = 0; i < wrap.files.length; i++) {
            let localFilePath = wrap.files[i];

            if (typeof localFilePath === 'object') {
                localFilePath = path.join(global.basedir, localFilePath.attachment);
            }

            if (typeof localFilePath !== 'string') {
                continue;
            }

            // Only analyse for local files
            if (!fs.existsSync(localFilePath)) {
                continue;
            }

            const stats    = fs.statSync(localFilePath);
            const fileSize = stats['size'] / 1000000;

            if (fileSize > MaxFileSizeMB) {
                largeFiles.push(localFilePath);
                wrap.files.splice(i, 1);
            }
        }
    }

    /**
     * ? Message Content Check
     * Check content only of message.
     */
    let largeContent = ''; // * reminder that '' is falsey in JS
    let reasons      = [];

    // Check message content
    if (wrap.content && (wrap.content.length > CharacterLimits.content)) {
        largeContent += `\n========[Message Content]========\n`;
        largeContent += wrap.content;
        reasons.push(`Message content limit reached >${CharacterLimits.content}`);
    }

    // Check embed content
    if (wrap.embed) {
        const scount = reasons.length;

        if (wrap.embed.title && (wrap.embed.title.length > CharacterLimits.embed.title)) {
            reasons.push(`Embed limit reached for 'title' >${CharacterLimits.embed.title}`);
        }

        if (wrap.embed.author && (wrap.embed.author.name.length > CharacterLimits.embed.authorName)) {
            reasons.push(`Embed limit reached for 'author' >${CharacterLimits.embed.authorName}`);
        }

        if (wrap.embed.description && (wrap.embed.description.length > CharacterLimits.embed.description)) {
            reasons.push(`Embed limit reached for 'description >${CharacterLimits.embed.description}`);
        }

        if (wrap.embed.fields) {
            if (wrap.embed.fields.length >= CharacterLimits.embed.fieldLimit) {
                reasons.push(`Embed count limit reached >${CharacterLimits.embed.fieldLimit}`);
            } else {
                let counter = 0;

                // Check field values & titles
                wrap.embed.fields.forEach((field) => {
                    if (
                        // Name check
                        field.name && (field.name.length > CharacterLimits.embed.fieldTitle)
                        // Value check
                        || field.value && (field.value.length > CharacterLimits.embed.fieldValue)
                    ) {
                        counter++;
                    }
                });

                if (counter > 0) {
                    reasons.push(`Embed limit reach for field properties!\n\tCounter: ${counter}`);
                }
            }
        }

        if (wrap.embed.footer && (wrap.embed.footer.text.length > CharacterLimits.embed.footer)) {
            reasons.push(`Embed limit reached for 'description >${CharacterLimits.embed.description}`);
        }

        if (reasons.length !== scount) {
            largeContent += `\n========[Embed Content]========\n`;
            largeContent += JSON.stringify(wrap.embed, null, 4);
        }
    }

    // WeirdChamp
    if (!largeContent && largeFiles.length <= 0) {
        // Create and send. API Message.
        return APIMessage.create(
            channel,
            wrap
        );
    }

    // Embed time (but dont touch if embed already exists :))
    wrap.embed = wrap.embed || {
        description: wrap.content,
        fields     : []
    };

    /**
     * ? Sort out large files
     * This is dependant on the status of the file server and the ./public/ folder
     */
    if (largeFiles.length > 0) {
        logger.debug('Found large files in message!');

        let publicPaths = [];

        // ! Copy files? what if sensitive?
        largeFiles.forEach((largeFilePath) => {
            let fileName   = path.basename(largeFilePath);
            let publicPath = path.join(vulcan.webFiles.publicFolderPath, fileName);

            fs.copyFileSync(largeFilePath, publicPath);
            logger.debug(`Copied file to public realm: ${largeFilePath} => ${publicPath}`);

            publicPaths.push(publicPath);
        });

        // Add IP and http
        let resolveIp = (await vulcan.resolveIp()).v4;

        publicPaths.forEach((publicPath, i) => {
            publicPaths[i] = `http://${resolveIp}:${vulcan.webFiles.port}/${publicPath}`;
        });

        // Finally output
        wrap.embed.fields.push(
            {
                name : 'Large Files Found',
                value: `Number of large files: ${largeFiles.length}\nOutsource: ${publicPaths}`
            }
        );
    }


    /**
     * ? Sort out large content
     * Currently two ways of dealing with lareg content messages:
     *  *  Hastebin upload
     *  *  Discord file upload (fallback)
     */
    if (largeContent) {
        logger.debug('Found large content in message!');

        wrap.content           = null;
        wrap.embed.fields      = [];
        wrap.embed.description = `Content **exceeded** discord limits!`;

        try {
            wrap.embed.fields.push({
                name : 'Reupload',
                value: await hastebin.post(largeContent)
            });
        } catch (error) {
            logger.warn('In this case, a few things could happen. 1- The file was really big. Exceed discord upload. 2- Hastebin was down. 3- Exploit/Bug.');

            const dataDir  = `./data/`;
            const id       = fs.readdirSync(dataDir).length + 1;
            const filePath = path.join(dataDir, `${channel.id}_${id}.txt`);

            fs.writeFileSync(filePath, largeContent);

            wrap.embed.description += `\nI also detected hastebin to be **down**? Or file was incompatible with hastebin!\nI am uploading content via Discord file system!`;
            wrap.files = [filePath];
        }
    }

    // Create and send. API Message.
    return APIMessage.create(
        channel,
        wrap
    );
};
