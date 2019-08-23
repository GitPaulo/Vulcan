const fs       = xrequire('fs');
const path     = xrequire('path');
const Discord  = xrequire('discord.js');
const hastebin = xrequire('./utility/modules/hastebin');
const logger   = xrequire('./managers/LogManager').getInstance();

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

// ! This may slow down replying (be careful)
module.exports = async (channel, ...args) => {
    const apiMessage  = Discord.APIMessage.create(channel, ...args);
    const { options } = apiMessage;

    // === File Size Check
    if (options.files) {
        let largeFiles = [];

        // Check for large files
        for (let i = 0; i < options.files.length; i++) {
            let localFilePath = options.files[i];

            if (typeof localFilePath === 'object') {
                localFilePath = path.join(global.__basedir, localFilePath.attachment);
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
                apiMessage.options.files.splice(i, 1);
            }
        }

        if (largeFiles.length > 0) {
            logger.warning(`Tried to upload large files through discord.`);
            logger.debug(largeFiles);

            channel._send({
                embed: {
                    description: `Files from a messages were to large to upload. Had to remove them :(\n`,
                    fields     : [
                        { name: 'Files', value: largeFiles.join('\n') }
                    ]
                }
            });
        }
    }

    // === Message Content Check
    let largeContent = ''; // * reminder that '' is falsey in JS
    let reasons      = [];

    // Check message content
    if (options.content && (options.content.length > CharacterLimits.content)) {
        largeContent += `\n========[Message Content]========\n`;
        largeContent += options.content;
        reasons.push(`Message content limit reached >${CharacterLimits.content}`);
    }

    // Check embed content
    if (options.embed) {
        const scount = reasons.length;

        if (options.embed.title && (options.embed.title.length > CharacterLimits.embed.title)) {
            reasons.push(`Embed limit reached for 'title' >${CharacterLimits.embed.title}`);
        }

        if (options.embed.author && (options.embed.author.name.length > CharacterLimits.embed.authorName)) {
            reasons.push(`Embed limit reached for 'author' >${CharacterLimits.embed.authorName}`);
        }

        if (options.embed.description && (options.embed.description.length > CharacterLimits.embed.description)) {
            reasons.push(`Embed limit reached for 'description >${CharacterLimits.embed.description}`);
        }

        if (options.embed.fields) {
            if (options.embed.fields.length >= CharacterLimits.embed.fieldLimit) {
                reasons.push(`Embed count limit reached >${CharacterLimits.embed.fieldLimit}`);
            } else {
                let counter = 0;

                options.embed.fields.forEach((field) => {
                    (field.name && (field.name.length > CharacterLimits.embed.fieldTitle)
                        || field.value && (field.value.length > CharacterLimits.embed.fieldValue))
                    && counter++;
                });

                if (counter > 0) {
                    reasons.push(`Embed limit reach for field properties!\n\tCounter: ${counter}`);
                }
            }
        }

        if (options.embed.footer && (options.embed.footer.text.length > CharacterLimits.embed.footer)) {
            reasons.push(`Embed limit reached for 'description >${CharacterLimits.embed.description}`);
        }

        if (reasons.length !== scount) {
            largeContent += `\n========[Embed Content]========\n`;
            largeContent += JSON.stringify(options.embed, null, 4);
        }
    }

    // If nothing is large, send normal!
    if (!largeContent) {
        return channel._send(apiMessage);
    }

    /*
    * Currently two ways of dealing with lareg content messages:
        ?  Hastebin upload
        ?  Discord file upload (fallback)
    */
    apiMessage.options.content = null;
    apiMessage.options.embed   = {
        description: `Content was **too large** to be sent via Discord text channel.\n`,
        fields     : [
            { name: 'Reasons', value: reasons.join('\n=> ') }
        ]
    };

    try {
        apiMessage.options.embed.description += `\nI have uploaded it to: ${(await hastebin.post(largeContent))}`;
    } catch (error) {
        const dataDir  = `./data/`;
        const id       = fs.readdirSync(dataDir).length + 1;
        const filePath = path.join(dataDir, `${channel.id}_${id}.txt`);

        fs.writeFileSync(filePath, largeContent);

        apiMessage.options.embed.description += `I also detected hastebin to be **down**?\nI am uploading content via Discord file system!`;
        apiMessage.options.files = [filePath];
    }

    return channel._send(apiMessage);
};
