module.exports = (guild) => xrequire('./managers/LogManager').getInstance().log(`Vulcan has joined guild '${guild.name}(${guild.id})' owned by ${guild.owner ? guild.owner.user.tag : 'Unknown'}.`);
