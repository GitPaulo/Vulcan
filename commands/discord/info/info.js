const info          = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

info.execute = async (message) => {
    const performance = message.client.performance;
    const statistics  = message.client.statistics;
    const embedWrap   = messageEmbeds.reply({
        message,
        description: `Hello there, I'm vulcan and here is my information.`,
        fields     : [
            {
                name : 'Github Repo',
                value: 'https://github.com/GitPaulo/Vulcan'
            },
            {
                name  : 'CPU Usage',
                value : `${performance.cpuUsage}`,
                inline: true
            },
            {
                name  : 'Memory Usage',
                value : `${performance.memUsage}`,
                inline: true
            },
            {
                name  : 'User Count',
                value : `${statistics.userCount}`,
                inline: true
            },
            {
                name  : 'Guild Count',
                value : `${statistics.guildCount}`,
                inline: true
            },
            {
                name  : 'Perfixes',
                value : `${message.client.configuration.prefixes.join(', ')}`,
                inline: true
            },
            {
                name  : 'Authorised Servers Count',
                value : `${message.client.servers.size}`,
                inline: true
            }
        ]
    });

    await message.channel.send(embedWrap);
};
