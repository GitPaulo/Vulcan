const botchannel = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');

botchannel.execute = async message => {
  const guild = message.guild;
  const unauth = Boolean(message.parsed.args[0]);
  const embedWrap = messageEmbeds.reply({
    message,
    description: 'Vulcan has **left** this guild!',
    fields: [
      {
        name: 'Unauthorised?',
        value: String(unauth)
      },
      {
        name: 'Re-Invite',
        value: message.client.constants.client.invite
      }
    ]
  });

  await message.channel.send(embedWrap);

  if (unauth) {
    await message.client.unauthoriseGuild(guild.id);
  }

  await guild.leave();
};
