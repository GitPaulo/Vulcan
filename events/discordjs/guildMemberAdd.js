module.exports = member => xrequire('./managers/logManager').getInstance().info(`User '${member.displayName}(${member.id})' has joined guild '${member.guild ? member.guild.name : 'Unknown'}'.`);
