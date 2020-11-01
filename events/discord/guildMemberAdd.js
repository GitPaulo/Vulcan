/**
 * ? Guild Member Add (Discord Event)
 * Emitted whenever a user joins a guild.
 * (https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildMemberAdd)
 */

module.exports = member =>
  xrequire('./modules/logger')
    .getInstance()
    .log(
      `User '${member.displayName}(${member.id})' has joined guild '${member.guild ? member.guild.name : 'Unknown'}'.`
    );
