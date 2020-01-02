const fs       = xrequire('fs');
const path     = xrequire('path');
const Discord  = xrequire('discord.js');
const hastebin = xrequire('./utility/modules/hastebin');
const logger   = xrequire('./managers/LogManager').getInstance();

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

// ! This may slow down replying (be careful)
module.exports = async (channel, ...args) => {
    const vulcan      = channel.client;
    const apiMessage  = Discord.APIMessage.create(channel, ...args);
    const { options } = apiMessage;

    // === Runtime permissions check
    // TODO: Improve this
    // Could be DM
    if (channel.type === 'text') {
        let vulcanPermissions = channel.permissionsFor(vulcan.user.id);

        if (
            !(vulcanPermissions.has('SEND_MESSAGES')
            && vulcanPermissions.has('ADD_REACTIONS')
            && vulcanPermissions.has('ATTACH_FILES'))
        ) {
            logger.warning(`Vulcan did not have enough permissions to send a message to the channel: ${channel.name} (${channel.id})`);

            return;
        }
    }

    // === File Size Check
    let largeFiles = [];

    if (options.files) {
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
                options.files.splice(i, 1);
            }
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

    // Weird champ
    if (!largeContent && largeFiles.length <= 0) {
        return channel._send(apiMessage);
    }

    // Embed time (but dont touch if embed already exists :))
    options.embed = options.embed || {
        description: options.content,
        fields     : []
    };

    /* Sort out large files
        * This is dependant on the status of the file server and the ./public/ folder
    */
    if (largeFiles.length > 0) {
        logger.debug('Found large files in message!');

        let publicPaths = [];

        // ! Copy files? what if sensitive?
        largeFiles.forEach((largeFilePath) => {
            let fileName   = path.basename(largeFilePath);
            let publicPath = path.join(vulcan.fileServer.publicFolderPath, fileName);

            fs.copyFileSync(largeFilePath, publicPath);
            logger.debug(`Copied file to public realm: ${largeFilePath} => ${publicPath}`);

            publicPaths.push(publicPath);
        });

        // Add IP and http
        let externalIP = (await vulcan.externalIP()).v4;

        publicPaths.forEach((publicPath, i) => {
            publicPaths[i] = `http://${externalIP}:${vulcan.fileServer.port}/${publicPath}`;
        });

        // Finally output
        options.embed.fields.push(
            {
                name : 'Large Files Found',
                value: `Number of large files: ${largeFiles.length}\nOutsource: ${publicPaths}`
            }
        );
    }


    /* Sort out large content
    * Currently two ways of dealing with lareg content messages:
        ?  Hastebin upload
        ?  Discord file upload (fallback)
    */
    if (largeContent) {
        logger.debug('Found large content in message!');

        options.content           = null;
        options.embed.description = `Embed content was too large!`;

        try {
            options.embed.description += `\nI have uploaded it to: ${(await hastebin.post(largeContent))}`;
        } catch (error) {
            const dataDir  = `./data/`;
            const id       = fs.readdirSync(dataDir).length + 1;
            const filePath = path.join(dataDir, `${channel.id}_${id}.txt`);

            fs.writeFileSync(filePath, largeContent);

            options.embed.description += `\nI also detected hastebin to be **down**? Or file was incompatible with hastebin!\nI am uploading content via Discord file system!`;
            options.files = [filePath];
        }
    }

    return channel._send(apiMessage);
};
