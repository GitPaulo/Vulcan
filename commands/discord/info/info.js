const info     = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

info.execute = async (message) => {
    const performance = this.vulcan.performance;
    const statistics  = this.vulcan.statistics;
    const guild       = message.guild;
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
                value : `${this.vulcan.configuration.prefixes.join(', ')}`,
                inline: true
            },
            {
                name  : 'Authorised Servers Count',
                value : `${this.vulcan.servers.size}`,
                inline: true
            }
        ]
    });

    await message.channel.send(embedWrap);
};
