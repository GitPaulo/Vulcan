/**
 * ? Handler file
 * Handles all direct messages.
 * TODO: Permissions checking may be slowing down things?
 * ? Notes:
 *   - message.command is validated and authorised for execution at this point.
 *   - throws hacky object literal (caught on message event)
 */

module.exports = async (message) => {
    const command = message.command;
    const vulcan  = message.client;

    // Check if vulcan can even respond!
    if (!message.guild.me.hasPermission('SEND_MESSAGES')) {
        return vulcan.emit(
            'missingVulcanPermissions',
            message,
            `Vulcan doesn't have the essential permission: \`SEND_MESSAGES\` thus he cannot reply!`
        ), false;
    }

    // Disable unsafe interaction from unauthorised guilds
    if (!message.guild.authorised && !message.command.safe) {
        return vulcan.emit(
            'commandBlocked',
            message,
            `'${command.id}' is marked as unsafe.`
        ),
        vulcan.emit(
            'guildUnauthorised',
            message.guild,
            `Unsafe command was requested.`
        ),
        false;
    }

    // Discord Permissions: User
    const expectedUserPermissions = command.userPermissions;
    const userPermissions         = message.member.permissionsIn(message.channel).toArray();
    const upCorrectPermissions    = expectedUserPermissions.intersection(userPermissions);
    const upDifference            = expectedUserPermissions.difference(upCorrectPermissions);

    if (upDifference.length > 0) {
        return vulcan.emit(
            'missingUserPermissions',
            message,
            `User does not have the permissions required to execute this command!\n`
                + `\n==== Permissions Required ====\n`
                + '```' + upDifference + '```'

        ),
        false;
    }

    // Discord Permissions: Vulcan
    const expectedVulcanPermissions = command.vulcanPermissions;
    const vulcanPermissions         = message.guild.me.permissionsIn(message.channel).toArray();
    const vpCorrectPermissions      = expectedVulcanPermissions.intersection(vulcanPermissions);
    const vpDifference              = expectedVulcanPermissions.difference(vpCorrectPermissions);

    if (vpDifference.length > 0) {
        return vulcan.emit(
            'missingVulcanPermissions',
            message,
            `Vulcan does not have the permissions required to execute this command!\n`
                + `\n==== Permissions Required ====\n`
                + '```' + vpDifference + '```'
        ),
        false;
    }

    return true;
};
