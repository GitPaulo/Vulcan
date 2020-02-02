/* eslint-disable no-throw-literal */
/*
*   Handles all direct messages.
    TODO: Permissions checking may be slowing down things?
?   Notes:
        - message.command is validated and authorised for execution at this point.
!       - throws hacky object literal (caught on message event)
*/

module.exports = async (message) => {
    const command = message.command;

    // Check if vulcan can even respond!
    if (!message.guild.me.hasPermission('SEND_MESSAGES')) {
        throw {
            message: `Vulcan doesn't have the essential permission: \`SEND_MESSAGES\` thus he cannot reply!`,
            event  : `vulcanMissingPermissions`
        };
    }

    // Disable unsafe interaction from unauthorised guilds
    if (!message.guild.authorised && !message.command.safe) {
        throw {
            message: `This guild is **unauthorised**. Only \`safe\` commands are enabled.\n`
                    + `You may submit an authorisation request by using the \`authorise\` command!`,
            event: 'invalidCommandCall'
        };
    }

    // Discord Permissions: User
    const expectedUserPermissions = command.userPermissions;
    const userPermissions         = message.member.permissionsIn(message.channel).toArray();
    const upCorrectPermissions    = expectedUserPermissions.intersection(userPermissions);
    const upDifference            = expectedUserPermissions.difference(upCorrectPermissions);

    if (upDifference.length > 0) {
        throw {
            message: `User does not have the permissions required to execute this command!\n`
                    + `\n==== Permissions Required ====\n`
                    + '```' + upDifference + '```',
            event: 'userMissingPermissions'
        };
    }

    // Discord Permissions: Vulcan
    const expectedVulcanPermissions = command.vulcanPermissions;
    const vulcanPermissions         = message.guild.me.permissionsIn(message.channel).toArray();
    const vpCorrectPermissions      = expectedVulcanPermissions.intersection(vulcanPermissions);
    const vpDifference              = expectedVulcanPermissions.difference(vpCorrectPermissions);

    if (vpDifference.length > 0) {
        throw {
            message: `Vulcan does not have the permissions required to execute this command!\n`
                    + `\n==== Permissions Required ====\n`
                    + '```' + vpDifference + '```',
            event: 'vulcanMissingPermissions'
        };
    }
};
