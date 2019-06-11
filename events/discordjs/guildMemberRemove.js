module.exports = member => xrequire('./managers/LogManager').getInstance().info(`User '${member.displayName}(${member.id})' has left guild '${member.guild ? member.guild.name : 'Unknown'}'.`);
