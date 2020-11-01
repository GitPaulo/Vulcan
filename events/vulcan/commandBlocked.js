/**
 * ? Command Blocked (Vulcan Event)
 * Happens when:
 *   - Commmand was disabled
 *   - Command has not loaded
 *   - Spam prevention
 *   - Category restriction
 */

module.exports = (message, reason, extraFields = []) => {
  message.channel.send({
    embed: {
      title: `Request Blocked`,
      description: `A command request has been **blocked**.`,
      color: 0xff0000, // Red
      thumbnail: {
        url: `attachment://commandBlocked.gif`
      },
      timestamp: new Date(),
      footer: {
        text: `Request by ${message.author.tag}`
      },
      fields: [
        {
          name: 'Reason',
          value: reason
        },
        ...extraFields
      ],
      url: ''
    },
    files: [
      {
        attachment: './assets/media/embeds/events/commandBlocked.gif',
        name: 'commandBlocked.gif'
      }
    ]
  });
};
