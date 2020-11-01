/**
 * ? Handler file
 * Handles the parsing for every message content.
 * The results of the parsing will be stored in the message.parsed property.
 * ! Performance tests needed.
 * ! Discord commands only. (terminal manager has its own parser)
 */

// * Consider not using regex?
const argumentsRegex = /'+([^;]*)'+|{+([^;]*)}+|`+([^;]*)`+|\[([^;]*)\]|\S+/g;
const tagsRegex = /<((@!?\d+)|(:.+?:\d+))>/g;

module.exports = async (prefixRegex, message) => {
  const raw = message.content;
  const vulcan = message.client;

  // Parse data
  const args = raw.match(argumentsRegex);
  const tags = raw.match(tagsRegex);
  const head = args[0];
  const tail = raw.substring(head.length);

  // Resolve cmd
  const cmdName = head.replace(prefixRegex, '');
  const command = vulcan.commands.get(cmdName);

  // Shift to remove head
  args.shift();

  // Create useful string
  const argsString = args.join(' ').trim();

  // ? Add properties
  message.command = command;
  message.parsed = {
    raw,
    args,
    tags,
    head,
    tail,
    cmdName,
    argsString,
    mentions: message.mentions // ? For consitensy
  };
};
