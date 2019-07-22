const Discord  = xrequire('discord.js');
const hastebin = xrequire('./utility/modules/hastebin');

const CharacterLimits = {
    message: 2000,
    embed  : {
        title      : 256,
        authorName : 256,
        description: 2048,
        fieldTitle : 256,
        fieldValue : 1024,
        footer     : 2048
    }
};

const tooLargeWrap = (URI) => ({
    embed: {
        description: `Content was **too large** for me to send it via Discord. I have uploaded it to: ${URI}`
    },
    files: []
});

// ? This may slow down replying (be careful)
module.exports = async (channel, ...args) => {
    const apiMessage = Discord.APIMessage.create(channel, ...args);
    let { options }  = apiMessage;

    if (options.content && options.content.length > CharacterLimits.message) {
        apiMessage.options = tooLargeWrap(await hastebin.post(options.content));
    }

    // Check embed content
    if (options.embed
        && (
            options.embed.title && (options.embed.title.length > CharacterLimits.embed.title)
            || options.embed.author && (options.embed.author.name.length > CharacterLimits.embed.authorName)
            || options.embed.description && (options.embed.description.length > CharacterLimits.embed.description)
            || options.embed.fields && (options.embed.fields.filter((field) => (field.name.length > CharacterLimits.embed.fieldTitle) || (field.value.length > CharacterLimits.embed.fieldValue)).length)
            || options.embed.footer && (options.embed.footer.text.length > CharacterLimits.embed.footer)
        )
    ) {
        apiMessage.options = tooLargeWrap(await hastebin.post(JSON.stringify(options.embed, null, 4)));
    }

    // ! original TextBasedChannel.send()
    return channel._send(apiMessage);
};
