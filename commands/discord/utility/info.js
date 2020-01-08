const info          = module.exports;
const gitBranch     = xrequire('./utility/modules/gitBranch');
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

info.execute = async (message) => {
    const performance        = message.client.performance;
    const statistics         = message.client.statistics;
    const address            = await message.client.externalIP();
    const { branch, status } = await gitBranch();

    // Turn into actual names, if valid
    let atOwners = message.client.configuration.ownersID.map((ownerID) => {
        let owner = message.client.users.get(ownerID);

        if (owner) {
            return `<@${owner.id}>`;
        }

        return ownerID;
    });

    // Turn into actual names, if valid
    let atHosts = message.client.guilds.array().map((guild) => guild.owner);

    // Get admim tags
    let atAdmins = Array.from(message.client.usergroups.entries())
        .filter((entry) => entry[1] === 'administrator')
        .map((entry) => {
            let admin = this.command.client.users.get(entry[0]);

            return `<@${admin.id}>`;
        });

    // Output information
    await message.channel.send(messageEmbeds.reply({
        message,
        description: `Hello there, I'm Vulcan and here lies my information.\n\t\`ipv4: ${address.v4}\`\n\t\t\`ipv6: ${address.v6}\``,
        fields     : [
            {
                name : 'Github Repo',
                value: 'http://github.com/GitPaulo/Vulcan'
            },
            {
                name : 'Version & Branch',
                value: `Branch: '${branch}'\n${status}`
            },
            {
                name : 'Bot Owners',
                value: atOwners.toString() || '(No Owners)'
            },
            {
                name : 'Bot Administrators',
                value: atAdmins.toString() || '(No Administrators)'
            },
            {
                name : 'Bot Hosts',
                value: atHosts.toString() || '(No Hosts)'
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
                name  : 'Auth-Server Count',
                value : `${message.client.servers.size}`,
                inline: true
            },
            {
                name  : 'Blacklist Size',
                value : `${message.client.blacklist.size}`,
                inline: true
            },
            {
                name  : 'File Server Port',
                value : `${message.client.fileServer.port}`,
                inline: true
            },
            {
                name  : 'Web Server Port',
                value : `${message.client.webServer.port}`,
                inline: true
            }
        ]
    }));
};
