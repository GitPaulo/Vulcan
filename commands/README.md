# Command Structure

There currently exist **two** interfaces for commands in vulcan.

- [Discord Commands](./discord/)
- [Terminal Commands](./terminal/)

Discord commands are the commands executed via the Discord API. Terminal commands are the instructions executed via the Vulcan's process shell (on the host server). Please read the notes below for best practices with adding new commands.

## The 'commands.yml' file

Each of the folders representing a command 'package' contains a file named 'commands.yml'. This file specifies the meta information about each of the commands within their respective realm. It is designed in such a way that anyone should be able to edit without much programming experience. The structure for each command descriptor should be defined at the top of each file. Please follow the instruction detailed in the commented sections.

## Adding a new command

  1. Navigate to the correct realm directory (discord/terminal).
  2. Identify the **type** of command you wish to add and navigate to the folder that best describes that type. If your type does not exist or is poorly represented then create a folder for it.
  3. Inside the folder of your command type, create a .js file in which the main code will be held for that command. The name of this file will be your **command id** (full lowercase please) and **must be unique.**
  4. __(optional)__ Extra code can be placed in the [](../structures/packages/) directory
  5. Add the descriptor for your command in the appropriate command.yml file.
  6. __(optional)__ Add a thumbnail for the command emebed in the [assets](./assets/media/images/commands) folder.

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

### Asynchronous Load Template (for any command type/realm)

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
