const cmds = module.exports;

// eslint-disable-next-line no-unused-vars
cmds.execute = (line) => {
    let documentString = '';
    let commands       = this.command.client.terminalManager.commands;

    commands.primaryIdentifiers.forEach((id) => documentString += commands.get(id).toString() + '\n');

    console.log(documentString);
};
