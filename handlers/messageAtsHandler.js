// const logger = xrequire('./managers/LogManager').getInstance();

/*
* Matches all special ats:
?   @#... -> Text channel
?   @$... -> Voice channel
*/
const lookup = { '#': 'text', '$': 'voice' };
const regex  = /@(\#|\$)\w*/gm;

module.exports = async (message) => {
    const matches = message.cleanContent.match(regex) || [];
    const atArray = [];

    for (const extendedAt of matches) {
        let separator = extendedAt[1];
        let textID    = extendedAt.substring(2);

        // get all channels by the same name
        let filteredChannels = message.guild.findChannelsByName(textID, lookup[separator]);

        for (let filteredChannel of filteredChannels) {
            // eslint-disable-next-line no-unused-vars
            for (let [id] of filteredChannel.members) {
                atArray.push(`<@${id}>`);
            }
        }
    }

    if (atArray.length !== 0) {
        await message.channel.send(atArray.join(' '));
    }
};
