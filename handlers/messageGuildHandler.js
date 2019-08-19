/*  Notes:
*       - message.command is validated and authorised for execution at this point.
*       - must return true or false defining success
*/

// TODO Permissions checking may be slowing down things?
// const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

module.exports = async (message) => {
    const command = message.command;

    // Check if vulcan can even respond!
    if (!message.guild.me.hasPermission('SEND_MESSAGES')) {
        return message.client.emit(
            'vulcanMissingPermissions',
            message,
            `Vulcan doesn't have the essential permission: \`SEND_MESSAGES\` thus he cannot reply!`
        ), false;
    }

    // Disable unsafe interaction from unauthorised guilds
    if (!message.guild.authorised && !message.command.safe) {
        return message.client.emit(
            'invalidCommandCall',
            message,
            `This guild is **unauthorised**. Only \`safe\` commands are enabled.\n`
            + `You may submit an authorisation request by using the \`authorise\` command!`
        ), false;
    }

    // Discord Permissions: User
    const expectedUserPermissions = command.userPermissions;
    const userPermissions         = message.member.permissionsIn(message.channel).toArray();
    const upCorrectPermissions    = expectedUserPermissions.intersection(userPermissions);
    const upDifference            = expectedUserPermissions.difference(upCorrectPermissions);

    if (upDifference.length > 0) {
        return message.client.emit(
            'userMissingPermissions',
            message,
            `User does not have the permissions required to execute this command!\n`
            + `\n==== Permissions Required ====\n`
            + '```' + upDifference + '```'
        ), false;
    }

    // Discord Permissions: Vulcan
    const expectedVulcanPermissions = command.vulcanPermissions;
    const vulcanPermissions         = message.guild.me.permissionsIn(message.channel).toArray();
    const vpCorrectPermissions      = expectedVulcanPermissions.intersection(vulcanPermissions);
    const vpDifference              = expectedVulcanPermissions.difference(vpCorrectPermissions);

    if (vpDifference.length > 0) {
        return message.client.emit(
            'vulcanMissingPermissions',
            message,
            `Vulcan does not have the permissions required to execute this command!\n`
            + `\n==== Permissions Required ====\n`
            + '```' + vpDifference + '```'
        ), false;
    }

    await command.execute(message);

    return true;
};
