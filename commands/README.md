# Command Structure

There currently exist **two** interfaces for commands in vulcan.

- [Discord Commands](./discord/)
- [Terminal Commands](./terminal/)

Discord commands are the commands executed via the Discord API. Terminal commands are the instructions executed via the Vulcan's process shell (on the host server). Please read the notes below for best practices with adding new commands.

## The 'commands.yml' file

Each of the folders directly under './commands' represents a command type realm. These folders contain a single file named 'commands.yml'. This file specifies the meta information about each of the commands belonging to the enclosing folder. For each command, the structured information is known as a command 'descriptor'. Instructions on the expected structure of descriptors are written atop each 'commands.yml' file.

## The '\$packages' folder

Complex commands may require modularisation to avoid excessively large files. In order to keep things organised, all custom written files included by the main command file must go in the '\$packages' folder. In this folder each command has its own subfolder acting as the root of the package. The subfolder has to be named as: 'realm.command_id'.

## Adding a new command

1. Navigate to the correct **realm** matching directory (discord or terminal).
2. Identify the **type** of command you wish to add and navigate to the folder that best describes that type.
   - If your type does not exist or is poorly represented then create a folder for it.
3. Inside the command type folder, create a new JavaScript file. This is where your main code will be for your new command.
   - The name of this file will be the primary command id (excluding aliases) and must be **lowercase** and **unique.**
4. Copy and paste the appropriate command **template** into your new command file.
5. **(optional)** Extra code can be placed in the [packages](./commands/$packages/) folder.
6. Add the descriptor for your command inside the appropriate 'commands.yml' file.
7. **(optional)** Add a thumbnail for your command's embed within the [assets](./assets/media/commands) folder.
   - Image name must be a **capitalization** of command file name.

### Discord Command Template (./discord/mytype/mycommand.js)

```js
const mycommand = module.exports;

/**
 * Called once only before all discord command executions.
 * Parameters:
 *   - 'descriptor': a JSON object representing the entry for this command in commands.yaml.
 *   - 'packages': an object containing all the exports for the command corresponding package folder.
 */
mycommand.load = async (descriptor, packages) => {
  // You can access the vulcan object (discord.js client) in two ways:
  //      - 'message.client'
  //      - 'this.command.client'

  // Code Here
  console.log(`Loaded command: ${descriptor.id}`);
};

/**
 * Called once for every discord command request.
 * Parameters:
 *   - 'message': a discord.js message object.
 */
mycommand.execute = async message => {
  // You can access the vulcan object (discord.js client) in two ways:
  //      - 'message.client'
  //      - 'this.command.client'

  // Code here
  await message.channel.send(`Hello World!`);
};
```

### Terminal Command Template (./terminal/mytype/mycommand.js)

```js
const mycommand = module.exports;

/**
 * Called once only before all terminal command executions.
 * Parameters:
 *   - 'descriptor': a JSON object representing the entry for this command in commands.yaml.
 */
mycommand.load = (descriptor, packages) => {
  // Can only access the vulcan object with 'this.command.client'

  // Code Here
  console.log(`Loaded command: ${descriptor.id}`);
};

/**
 * Called once for every terminal command request.
 * Parameters:
 *   - 'line': the input command as a string from the terminal.
 */
mycommand.execute = line => {
  // Can only access the vulcan object with 'this.command.client'

  // Code Here
  console.log('Hello world!');
};
```

### Using Packages & Accessing Parsed Message Content

```js
const mycommand = module.exports;

mycommand.load = async (descriptor, packages) => {
  // Example of loading generic command 'data'
  // packages.fetcher => ./$packages/discord.mycommand/fetcher.js
  this.data = packages.fetcher.fetchSomeData();
};

mycommand.execute = async message => {
  // Parsed content is stored in 'message.parsed'
  // Example: !mycommand Hello? hmmm? Paul#4234 @Paul
  const {
    raw, // "!mycommand Hello? hmmm? Paul#4234 @Paul"
    args, // ["Hello?", "hmmm?", "Paul#4234", "@Paul"]
    tags, // ["Paul#4234"]
    head, // "!mycommand"
    tail, // "@Paul"
    cmdName, // "mycommand"
    argsString, // "Hello? hmmm?"
    mentions // ["@Paul"]
  } = message.parsed;

  // Send message
  await message.channel.send(`Response to command ${cmdName}: ${this.data}`);
};
```

```
Packages work the same way for Terminal Commands.
```

### Extra Notes

    * On the Discord Command Template, load functions may also be synchronous.
    * On the Terminal Command Template, load functions may also be asynchrnous.
    * On all templates, load functions can be ommited but execution functions must be defined.
    * A command will never execute before its loaded function has completed execution.
    * Load functions exist primarly because we do not want disabled commands to load their dependencies.
