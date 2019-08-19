const logger = xrequire('./managers/LogManager').getInstance();

module.exports = (message) => {
    const vulcan = message.client;

    return new Promise((resolve, reject) => {
        try {
            // Check for content from 'credentials'
            let filteredContent = message.content;

            Object.simpleTransverse(vulcan.credentials, (value) => {
                if (message.content.includes(value)) {
                    logger.warning(`Private value (${value}) has been leaked?\n\tMessage: ${message.content}\n\tAuthor: ${message.author.tag}`);
                    filteredContent = filteredContent.replace(value, '*'.repeat(value.length));
                }
            });

            // Other filters
            // (...)

            // Finally filter content (edit message)
            let hasFiltered = filteredContent !== message.content;

            if (hasFiltered) {
                if (!message.guild.me.hasPermission('MANAGE_MESSAGES')) {
                    return message.client.emit(
                        'vulcanMissingPermissions',
                        message,
                        `Vulcan doesn't have the essential permission: \`MANAGE_MESSAGES\` thus he cannot reply!`
                    );
                }

                message.delete().then(() => (
                    message.channel.send({
                        embed: {
                            color : 0x0099ff,
                            title : 'Message Filtered',
                            author: {
                                name    : `Message by: ${message.author.tag}`,
                                icon_url: message.author.defaultAvatarURL       /* eslint-disable-line camelcase */
                            },
                            description: filteredContent
                        }
                    })
                )).catch((err) => {
                    vulcan.emit('channelError', message.channel, err);
                });
            }

            resolve(hasFiltered);
        } catch (err) {
            reject(err);
        }
    });
};
