/**
 * ? Error (Discord Event)Guild Member Remove (Discord Event)
 * Emitted whenever a user leaves a guild.
 * (https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildMemberRemove)
 */

module.exports = (member) => xrequire('./modules/logger').getInstance().log(`User '${member.displayName}(${member.id})' has left guild '${member.guild ? member.guild.name : 'Unknown'}'.`);
