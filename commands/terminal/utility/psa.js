const psa = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

psa.execute = line => {
  const vulcan = this.command.client;
  const argsString = line.substring(line.indexOf(' ')) || '[EMPTY]';

  vulcan.guilds.cache.forEach(guild => {
    if (guild.botChannel) {
      guild.botChannel.send(
        messageEmbeds.PSA({
          description: argsString
        })
      );
    }
  });
};
