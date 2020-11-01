/**
 * ? Command Invalid (Vulcan Event)
 * Happens when:
 *   - Wrong command id used
 */

module.exports = (message, extraFields = []) => {
  const { commands } = message.client;
  const nSuggestions = 4;

  message.channel.send({
    embed: {
      title: `Invalid Command`,
      description:
        `The command request \`${message.parsed.cmdName}\` is **invalid**.\n` +
        `\`\`\`\nDid you mean?\n${commands
          .similar(message.parsed.cmdName)
          .map(s => `- ${s.reference}`)
          .slice(0, nSuggestions)
          .join('\n')}\`\`\``,
      color: 0x6b43d7,
      thumbnail: {
        url: `attachment://commandInvalid.gif`
      },
      timestamp: new Date(),
      footer: {
        text: `Request by ${message.author.tag}`
      },
      fields: [
        {
          name: 'Documentation?',
          value: 'Use the `docs` command!'
        },
        ...extraFields
      ],
      url: ''
    },
    files: [
      {
        attachment: './assets/media/embeds/events/commandInvalid.gif',
        name: 'commandInvalid.gif'
      }
    ]
  });
};
