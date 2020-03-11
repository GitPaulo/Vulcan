/**
 * ? Handler file
 * Handles the preprocessing of all messages before they are sent by client.
 * ! APIMessage.create has internal error checks.
 * ! Code in this file may heavily impact performance.
 */

const fs       = xrequire('fs');
const path     = xrequire('path');
const yaml     = xrequire('js-yaml');
const hastebin = xrequire('./modules/hastebin');
const logger   = xrequire('./modules/logger').getInstance();

// Structures
const {
    DMChannel,
    TextChannel,
    APIMessage
}  = xrequire('discord.js');

// Handler
const handler = async (channel, wrap) => {
    const { client } = channel;
    const { api }    = client.constants;

    // Already a message!
    if (wrap instanceof APIMessage) {
        return wrap;
    }

    // We only apply these to these channels
    if (!(channel instanceof DMChannel
        || channel instanceof TextChannel)) {
        return APIMessage.create(
            channel,
            wrap
        );
    }

    // In case of string, still apply a wrap.
    if (typeof wrap === 'string') {
        wrap = {
            content: wrap,
            embed  : null,
            files  : []
        };
    }

    // Reasons for modification
    const reasons = [];
    const stamp   = `[${channel.guild.name}@${channel.name}]`;

    /**
     * ? File Size Handling
     * Go through all files and check for transgressions of the api size limit.
     */
    const largeFiles = [];

    if (wrap.files) {
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

            if (fileSize > api.maxUpload.base) {
                largeFiles.push(localFilePath);
                wrap.files.splice(i, 1);
            }
        }
    }

    /**
     * ? Message Content Check
     * Size checks for:
     *  - (if) message content
     *  - (if) message embed properties content
     */
    const largeContent = [];

    // Check message content
    if (wrap.content
            && (wrap.content.length > api.messageLimits.content)
    ) {
        largeContent.push(`\n[Message Content]${stamp}\n`);
        largeContent.push(wrap.content);
        reasons.push(`Message content limit reached >${api.messageLimits.content}`);
    }

    // Check embed content
    if (wrap.embed) {
        const scount = reasons.length;

        if (wrap.embed.title
                && (wrap.embed.title.length > api.messageLimits.embed.title)) {
            reasons.push(`Embed limit reached for 'title' >${api.messageLimits.embed.title}`);
        }

        if (wrap.embed.author
                && (wrap.embed.author.name.length > api.messageLimits.embed.author)) {
            reasons.push(`Embed limit reached for 'author' >${api.messageLimits.embed.author}`);
        }

        if (wrap.embed.description
                && (wrap.embed.description.length > api.messageLimits.embed.description)) {
            reasons.push(`Embed limit reached for 'description >${api.messageLimits.embed.description}`);
        }

        if (wrap.embed.fields) {
            if (wrap.embed.fields.length >= api.messageLimits.embed.fieldLimit) {
                reasons.push(`Embed count limit reached >${api.messageLimits.embed.fieldLimit}`);
            } else {
                let counter = 0;

                wrap.embed.fields.forEach((field) => {
                    if (
                        field.name
                            && (field.name.length > api.messageLimits.embed.fields.title)
                    ||  field.value
                            && (field.value.length > api.messageLimits.embed.fields.value)
                    ) {
                        counter++;
                    }
                });

                if (counter > 0) {
                    reasons.push(`Embed limit reach for field properties!\n\tCounter: ${counter}`);
                }
            }
        }

        if (wrap.embed.footer
            && (wrap.embed.footer.text.length > api.messageLimits.embed.footer)) {
            reasons.push(`Embed limit reached for 'description >${api.messageLimits.embed.description}`);
        }

        if (reasons.length !== scount) {
            largeContent.push(`\n[Embed Content]${stamp}\n`);
            largeContent.push(yaml.safeDump(wrap.embed));
        }
    }

    // ? Nothing to declare
    if (largeContent.length + largeFiles.length <= 0) {
        return APIMessage.create(
            channel,
            wrap
        );
    }

    /**
     * ? Creating new message
     * Received message was illegal!
     * Time to generate a new legal message w/ embed :)
     */
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
            let publicPath = path.join(client.webFiles.publicFolderPath, fileName);

            fs.copyFileSync(largeFilePath, publicPath);
            logger.debug(`Copied file to public realm: ${largeFilePath} => ${publicPath}`);

            publicPaths.push(publicPath);
        });

        // Add IP and http
        let resolveIp = (await client.resolveIp()).v4;

        publicPaths.forEach((publicPath, i) => {
            publicPaths[i] = `http://${resolveIp}:${client.webFiles.port}`
                + `${publicPath.replace(global.basedir, '')}`;
        });

        // Outsource
        wrap.embed.fields.push(
            {
                name : 'Outsource',
                value: publicPaths
            }
        );

        // Notifty
        channel.send(`:warning: \`Large files detected!\``);
    }


    /**
     * ? Sort out large content
     * Currently two ways of dealing with lareg content messages:
     *  *  Hastebin upload
     *  *  Discord file upload (fallback)
     */
    if (largeContent.length > 0) {
        logger.debug('Found large content in message!');

        // Large Content String
        const dataDir       = `./data/`;
        const contentString = largeContent.join('\n');

        // Wrap
        wrap.content           = null;
        wrap.embed.fields      = [];
        wrap.embed.description = `*Content moved.*`;

        try {
            wrap.embed.fields.push({
                name : 'Outsource',
                value: await hastebin.post(contentString)
            });
        } catch (error) {
            logger.warn(
                `In this case, a few things could happen.`
                + `\n\t1- The file was really big. Exceed discord upload.`
                + `\n\t2- Hastebin was down.`
                + `\n\t3- Exploit/Bug.`
            );

            let id       = fs.readdirSync(dataDir).length + 1;
            let filePath = path.join(dataDir, `${channel.id}_${id}.txt`);

            fs.writeFileSync(filePath, contentString);

            wrap.embed.description += `\nDetected hastebin to be **down**?`
                                    + `\nUploaded content via Discord file system!`;
            wrap.files = [filePath];
        }

        // Notify
        channel.send(`:warning: \`Large content detected!\``);
    }

    // Create and send. API Message.
    return APIMessage.create(
        channel,
        wrap
    );
};

// ! Performance logging
module.exports = async (...args) => {
    const clock = Date.now();

    logger.logTimeStart('FormatHandler@' + clock);

    const msg = await handler(...args);

    logger.logTimeEnd(
        'FormatHandler@' + clock,
        `Performance checks on '${__filename}'`
    );

    return msg;
};
