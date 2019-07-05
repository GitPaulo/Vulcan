## Information about command structure.
There currently exists **two** interfaces for commands in vulcan.
  - [Discord Commands](./discord/)
  - [Terminal Commands](./termina/)

Discord commands are the commands executed via the discord API. In other words, the relevant ones which typical users may interact with. Furthermore, vulcan also has Terminal Comamnds. These commands are parsed and executed via the vulcan CLI interface and are typically only of use to the developers or the host of vulcan.

### The 'commands.yml' file.
Each directory, representing a command interface, must contain the file 'commands.yml'. This file holds meta information about each of the commands. It is designed in such a way anyone can edit without much programming experience. The structure for each command descriptor should be definined at the top of each file.

### Adding a new command?
  1. Navigate to the correct derictory.
  2. Identify the **type** of command you wish to add and navigate to the folder that best describes that type. If your type does not exist or is poorly represented, create a folder for it.
  3. Inside the folder of your command type, create a .js file. The name of this file will be your **command id** and **must be unique.**
  4. Add the descriptor for your command in the appropriate command.yml file.

### Discord Command Template [./discord/mytype/mycommand.js]
```js
const mycommand = module.exports;

mycommand.load = (commandDescriptor) => {
    // 'commandDescriptor' is a JSON object representing the entry for this command in commands.yaml
    // this code is ran once before any call of execute()
};

mycommand.execute = async (message) => { 
    // 'message' is a discord.js message object
    await message.channel.send("Hello World!");
};
```

### Terminal Command Template [./terminal/mytype/mycommand.js]
```js
const mycommand = module.exports;

mycommand.load = (commandDescriptor) => {
    // 'commandDescriptor' is a JSON object representing the entry for this command in commands.yaml
    // this code is ran once before any call of execute()
};

mycommand.execute = (vulcan) => {
    // 'vulcan' is the object representing the vulcan client
    console.log('Hello world!');
};
```

**Note**: On all templates, load() can be ommited but execute() cannot.
