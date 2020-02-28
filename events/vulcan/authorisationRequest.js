/**
 * ? Authorisation Request (Vulcan Event)
 * Happens when an authorisation request is made.
 */

const { configuration } = xrequire('./prerequisites/settings');
const logger            = xrequire('./modules/logger').getInstance();

module.exports = async (
    requester,
    guild
) => {
    if (guild.authorised) {
        return;
    }

    // Resolve requester to a user
    requester = guild.members.resolve(requester);

    if (!requester) {
        throw new Error(
            `Could not resolve requester to a guild member.`
        );
    }

    // Resolve owners
    const vulcan = guild.client;
    const owners = configuration.ownersID
        .map((id) => vulcan.users.resolve(id) || id);

    // If no owners, grant auth!
    if (owners.length <= 0) {
        logger.warn(
            `No bot owners have been configured! Authorisation granted by default to guild ${guild.name}(${guild.id}).`
        );

        // Default
        vulcan.authoriseGuild(guild);

        return;
    }

    // Only first answer is valid
    let answered = false;

    // ? Query owners to accept request.
    owners.forEach(async (owner) => {
        if (typeof owner === 'string') {
            return logger.warn(`Unreachable owner (${owner}) in authorisation request.`);
        }

        // Create DM with owner
        const dmChannel  = await owner.createDM();
        const requestMsg = await dmChannel.send(
            `\`\`\`New Guild Authorisation Request\n`
            + `\tName: ${guild.name}\n`
            + `\tID: ${guild.id}\`\`\``
        );

        // Set up reactions
        const no  = '❎';
        const yes = '✅';
        const filter = (reaction, user) =>
            (reaction.emoji.name === yes || reaction.emoji.name === no)
            && (user !== vulcan.user);

        // Avoid rate limit
        requestMsg.safeReact(no).then(() => requestMsg.safeReact(yes));

        // Collect!
        // ? Reminder: this will await until bot shutdown or request is answered.
        requestMsg.awaitReactions(filter, { max: 1 })
            .then((collected) => {
                // Answer
                const answer = (collected.first().emoji.name === yes);

                // * Deals with authorisation responses
                vulcan.emit(
                    'authorisationResponse',
                    owner,
                    requester,
                    guild,
                    answer, // Boolean for acceptance
                    answered // If someone has already accepted
                );

                if (answered) {
                    return;
                }

                answered = true;

                // Update message
                requestMsg.edit(
                    `${requestMsg.content.substring(0, requestMsg.content.length - 3)}\n`
                    + `\tStatus: ${answer}\n`
                    + `\tResponder: ${owner.tag}\`\`\``
                );

                // Log outcome
                logger.log(`Authorisation request for guild ${guild.name}(${guild.id}) answered by ${owner.tag}. Answer: ${answer}.`);
            });
    });

    logger.log(`Guild authorisation request executed. Request by ${requester.tag} for guild ${guild.name}(${guild.id}).`);
};
