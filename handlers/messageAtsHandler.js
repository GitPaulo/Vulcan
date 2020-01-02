// const logger = xrequire('./managers/LogManager').getInstance();

/*
* Matches all special ats:
?   @<prefix1>... -> Text channel
?   @<prefix2>... -> Voice channel
?  Prefixes are set in the configuration.yaml file (extendedAts.prefixes)
*/

module.exports = async (message) => {
    const vulcan  = message.client;
    const matches = message.cleanContent.match(vulcan.eatsRegex) || [];
    const atLimit = vulcan.configuration.extendedAts.AtLimit;

    // Avoid computation: nothing atted!
    if (matches.length <= 0) {
        return;
    }

    // Will contain all the @s
    let atArray   = [];
    let atedArray = [];

    for (const extendedAt of matches) {
        let separator   = extendedAt[1];
        let textID      = extendedAt.substring(2);
        let channelType = vulcan.eatsLookup[separator];

        // Get all channels by the same name
        let filteredChannels = message.guild.findChannelsByName(textID, channelType);

        if (Object.keys(filteredChannels).length <= 0) {
            atedArray.push([`[Empty Channel]`]);
            continue;
        }

        for (let filteredChannel of filteredChannels) {
            let fcMembers = filteredChannel.members;

            // Skip channels that go over limit
            if (fcMembers.size > atLimit) {
                continue;
            }

            // eslint-disable-next-line no-unused-vars
            for (let [id] of fcMembers) {
                atArray.push(`<@${id}>`);
            }

            atedArray.push(filteredChannel.name);
        }
    }

    // Avoid message limit and spam.
    if (atArray.length > atLimit) {
        return vulcan.emit(
            'channelInformation',
            message.channel,
            `The @ limit was reached.\nYou pinged channels with total #@s > ${atLimit}!`
        );
    }

    await message.channel.send(
        atArray.join(' ')
        + `\n\`${message.author.tag} pinged the channel(s): '${atedArray.join(', ')}'.\``
    );
};
