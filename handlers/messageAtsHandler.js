/**
 * ? Handler file
 * Handles translation of special ats to a sequence of discord ats for every message:
 * Matches all special ats:
 * * - @<prefix1>... -> Text channel
 * * - @<prefix2>... -> Voice channel
 * Prefixes are defined in the configuration.yaml file (extendedAts.prefixes)
 */

const { configuration } = xrequire('./prerequisites/settings');

// Avoid recalculations
const exAtLimit   = configuration.extendedAts.AtLimit;
const exAtsConfig = configuration.extendedAts.prefixes;
const exAtsMapStr = Object.entries(exAtsConfig).map((prefix) => '\\' + prefix[1]).join('|');
const exAtsRegex  = new RegExp(`@(${exAtsMapStr})[^\\s]*`, 'g');
const exAtsLookup = new Map(Object.entries(Object.flip(exAtsConfig)));

// Export handler
module.exports = async (message) => {
    const vulcan  = message.client;
    const matches = message.cleanContent.match(exAtsRegex) || [];

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
        let channelType = exAtsLookup[separator];

        // Get all channels by the same name
        let filteredChannels = message.guild.findChannelsByName(textID, channelType);

        if (Object.keys(filteredChannels).length <= 0) {
            atedArray.push([`[Empty Channel]`]);
            continue;
        }

        for (let filteredChannel of filteredChannels) {
            let fcMembers = filteredChannel.members;

            // Skip channels that go over limit
            if (fcMembers.size > exAtLimit) {
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
    if (atArray.length > exAtLimit) {
        return vulcan.emit(
            'channelInformation',
            message.channel,
            `The @ limit was reached.\nYou pinged channels with total #@s > ${exAtLimit}!`
        );
    }

    await message.channel.send(
        atArray.join(' ')
        + `\n\`${message.author.tag} pinged the channel(s): '${atedArray.join(', ')}'.\``
    );
};
