# Command Structure

There currently exist **two** interfaces for commands in vulcan.

- [Discord Commands](./discord/)
- [Terminal Commands](./terminal/)

Discord commands are the commands executed via the discord API. In other words, the relevant ones which typical users may interact with. Furthermore, vulcan also has Terminal Comamnds. These commands are parsed and executed via the vulcan CLI interface and are typically only of use to the developers or the host of vulcan.

## The 'commands.yml' file

Each directory, representing a command interface, must contain the file 'commands.yml'. This file holds meta information about each of the commands. It is designed in such a way anyone can edit without much programming experience. The structure for each command descriptor should be definined at the top of each file.

## Adding a new command

  1. Navigate to the correct derictory.
  2. Identify the **type** of command you wish to add and navigate to the folder that best describes that type. If your type does not exist or is poorly represented, create a folder for it.
  3. Inside the folder of your command type, create a .js file. The name of this file will be your **command id** (convention is full lowercase) and **must be unique.**
  4. Add the descriptor for your command in the appropriate command.yml file.
  5. __(optional)__ Add a thumbnail for the command emebed in the [assets](./assets/media/images/commands) folder

### Discord Command Template (./discord/mytype/mycommand.js)

```js
const mycommand = module.exports;

mycommand.load = (commandDescriptor) => {
    // Parameter: 'commandDescriptor' is a JSON object representing the entry for this command in commands.yaml
    // You can access the vulcan object (the bot client) with: 'this.command.client'

    // This code is ran once before any call of execute()
};

mycommand.execute = async (message) => {
    // Parameter: 'message' is a discord.js message object
    // You can access the vulcan object (the bot client) with 'message.client' or 'this.command.client'

    await message.channel.send('Hello World!');
};
```

### Terminal Command Template (./terminal/mytype/mycommand.js)

```js
const mycommand = module.exports;

mycommand.load = (commandDescriptor) => {
    // Parameter: 'commandDescriptor' is a JSON object representing the entry for this command in commands.yaml
    // You can access the vulcan object (the bot client) with: 'this.command.client'

    // This code is ran once before any call of execute()
};

mycommand.execute = (line) => {
    // Parameter: 'line' the input command as a string from the terminal.
    // You can access the vulcan object with 'this.command.client'

    // Hi!
    console.log('Hello world!');
};
```

### Asynchronous Load Template (for any command type)

By design the command load functions are **not** asynchronous. The following is the recommended pattern when loading async data:

```js
const mycommand = module.exports;

mycommand.load = (commandDescriptor) => {
    // Set a flag
    iReturnAPromise().then((res) => (this._loaded = true)).catch((err) => console.err(err));
};

// Change to appropriate .execute() function type
mycommand.execute = async (...args) => {
    if (!this._loaded) { // Has it loaded?
        console.err('Command not loaded!');
        return;
    }

    console.log('Hello world!');
};
```

**Note**: On all templates, load() can be ommited but execute() cannot.
