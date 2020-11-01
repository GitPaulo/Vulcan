/**
 * ? Authorisation Response (Vulcan Event)
 * Happens when a response is given to an authorisation request.
 * This happens for EVERY response. Use boolean to check if reques has been answered!
 */

module.exports = async (
  responder, // User
  requester, // GuildMember
  guild,
  accepted,
  answered
) => {
  if (answered) {
    return; // For now
  }

  // Finally, grant authorisation
  if (accepted) {
    guild.client.authoriseGuild(guild);
  }

  // Resolve strings
  const authStr1 = accepted ? 'approved' : 'rejected';
  const authStr2 = accepted
    ? `This guild now has access to all of Vulcan's features.`
    : `Vulcan features will remained locked.`;
  const authStr3 = accepted
    ? `Get started by using the \`docs\` command!`
    : `You may resubmit the request with the \`authorise\` command.`;

  // In the case there are no text channels!
  const responseChannel = guild.botChannel || (await requester.createDM());

  // Notify
  await responseChannel.send({
    embed: {
      title: `Guild Authorisation`,
      description: `This guild has been **${authStr1}** authorisation.\n${authStr2}`,
      color: 0xcf9863, // Red
      thumbnail: {
        url: `attachment://authorisationResponse.gif`
      },
      timestamp: new Date(),
      footer: {
        text: `[Authorisation System]`
      },
      fields: [
        {
          name: 'Respondant',
          value: responder.tag,
          inline: true
        },
        {
          name: 'Requestee',
          value: requester.user.tag,
          inline: true
        },
        {
          name: 'What Next?',
          value: authStr3
        }
      ],
      url: ''
    },
    files: [
      {
        attachment: `./assets/media/embeds/events/authorisationResponse_${authStr1}.gif`,
        name: 'authorisationResponse.gif'
      }
    ]
  });
};
