const psa           = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

psa.execute = async (message) => {
    const target = message.parsed.args[0];
    const text   = [...message.parsed.args].splice(1).join(' ');
    let guilds   = [];

    // Needs [0] = target guild or global, [1]...[n] = psa text
    if (message.parsed.args.length < 2) {
        return message.client.emit(
            'invalidCommandUsage',
            message,
            `This command expects at least **two** arguments.`
        );
    }

    if (target.toLowerCase() === 'global') {
        guilds = message.client.guilds.array();
    } else {
        let guild = message.client.guilds.get(target);

        if (!guild) {
            return message.client.emit(
                'invalidCommandUsage',
                message,
                `Target ID provided was **not** from a valid guild networked to Vulcan.`
            );
        }

        guilds.push(guild);
    }

    guilds.forEach((guild) => {
        if (guild.botChannel) {
            guild.botChannel.send(messageEmbeds.PSA({
                description: text
            }));
        }
    });
};
