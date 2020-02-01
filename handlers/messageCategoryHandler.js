/*
*   Handles the checks for specific comamnd categories.
    IF return true, command doesnt run.
!   This probably should be in the message.js event
*/

module.exports = async (message) => {
    // ? Music commands
    // Requires caller to be in the same voice channel as bot
    if (
        message.command.category === 'music'
        && message.member.voice.channel
        && !message.member.voice.channel.members.get(message.client.user.id)
    ) {
        return message.client.emit(
            'invalidCommandCall',
            message,
            `Commands from the category \`music\` require the requestee to share a voice channel with the bot.\n\n`
            + `Use the command \`music\` to have the bot join your voice channel first!`
        );
    }

    // ? NSFW commands
    // Require caller to be in the same voice channel as bot
    if (
        message.command.category === 'nsfw'
        && !message.channel.nsfw
    ) {
        return message.client.emit(
            'invalidCommandCall',
            message,
            `Commands from the category \`nsfw\` require the requestee to be in a NSFW enabled channel.\n\n`
        );
    }

    return false;
};
