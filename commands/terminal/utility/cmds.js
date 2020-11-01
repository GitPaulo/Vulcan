const cmds = module.exports;

// eslint-disable-next-line no-unused-vars
cmds.execute = line => {
  let documentString = '============[ COMMANDS ]============\n';
  let commands = this.command.client.terminalManager.commands;

  commands.identifiers.forEach(id => (documentString += commands.get(id).toString() + '\n'));
  documentString += '============[ END ]============';

  console.log(documentString);
};
