/*
*   Handles filtering for messages sent from all channels belonging to the union of all joined guilds:
?   Filter important contents such as:
        - Bot credentials
        - Bad words
        - etc..
*/

module.exports = async (message) => {
    const vulcan = message.client;

    // Check for content from 'credentials'
    let filteredContent = message.content;

    // ? Transferse top layer of creditals
    // TODO: Make this effecient and for all layers.
    Object.simpleTransverse(vulcan.credentials, (value) => {
        if (message.content.includes(value)) {
            filteredContent = filteredContent.replace(value, '*'.repeat(value.length));
        }
    });

    // Other filters
    // (...)

    // * Finally filter content (edit message)
    const shouldFilter = filteredContent !== message.content;

    if (!shouldFilter) {
        return;
    }

    if (!message.guild.me.hasPermission('MANAGE_MESSAGES')) {
        return;
    }

    // Delete message with sensitive content
    await message.delete();

    // Notify channel of filtering
    await message.channel.send(
        {
            embed: {
                color : 0x0099ff,
                title : 'Message Filtered',
                author: {
                    name    : `Message by: ${message.author.tag}`,
                    icon_url: message.author.defaultAvatarURL       /* eslint-disable-line camelcase */
                },
                description: filteredContent
            }
        }
    );
};
