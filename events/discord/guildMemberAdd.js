module.exports = (member) => xrequire('./managers/LogManager').getInstance().log(`User '${member.displayName}(${member.id})' has joined guild '${member.guild ? member.guild.name : 'Unknown'}'.`);
