# Command Structure

There currently exist **two** interfaces for commands in vulcan.

- [Discord Commands](./discord/)
- [Terminal Commands](./terminal/)

Discord commands are the commands executed via the Discord API. Terminal commands are the instructions executed via the Vulcan's process shell (on the host server). Please read the notes below for best practices with adding new commands.

## The 'commands.yml' file

Each of the folders representing a command 'package' contains a file named 'commands.yml'. This file specifies the meta information about each of the commands within their respective realm. It is designed in such a way that anyone should be able to edit without much programming experience. The structure for each command descriptor should be defined at the top of each file. Please follow the instruction detailed in the commented sections.

## The '__packages' folder

Complex commands may require modularisation to avoid excessively large files. In order to keep things organised, all custom written files included by the main command file must go in the '__packages' folder. In this folder, each command has its own subfolder acting as the root of the package.

## Adding a new command

  1. Navigate to the correct **realm** matching directory (discord or terminal).
  2. Identify the **type** of command you wish to add and navigate to the folder that best describes that type. 
        * If your type does not exist or is poorly represented then create a folder for it.
  3. Inside the command type folder, create a new JavaScript file. This is where your main code will be for your new command. 
        * The name of this file will be the primary command id (excluding aliases) and must be **lowercase** and **unique.**
  4. Copy and paste the appropriate command **template** into your new command file.
  5. __(optional)__ Extra code can be placed in the [packages](./commands/__packages/) folder.
  6. Add the descriptor for your command inside the appropriate 'commands.yml' file.
  7. __(optional)__ Add a thumbnail for your command's embed within the [assets](./assets/media/images/commands) folder.
        * Image name must be a **capitalization** of command file name.

### Discord Command Template (./discord/mytype/mycommand.js)

```js
const mycommand = module.exports;

// Called once before any execution.
// Parameters:
//      - 'commandDescriptor': a JSON object representing the entry for this command in commands.yaml
mycommand.load = async (commandDescriptor) => {
    // You can access the vulcan object (discord.js client) in two ways:
    //      - 'message.client'
    //      - 'this.command.client'

    // Code Here
    console.log(`Loaded command: ${commandDescriptor.id}`);
};

// Called once for every user request.
// Parameters:
//      - 'message': a discord.js message object
mycommand.execute = async (message) => {
    // You can access the vulcan object (discord.js client) in two ways:
    //      - 'message.client'
    //      - 'this.command.client'

    // Code Here
    await message.channel.send('Hello World!');
};
```

### Terminal Command Template (./terminal/mytype/mycommand.js)

```js
const mycommand = module.exports;

// Called once before any execution.
// Parameters:
//      - 'commandDescriptor': a JSON object representing the entry for this command in commands.yaml
mycommand.load = (commandDescriptor) => {
    // Can only access the vulcan object with 'this.command.client'

    // Code Here
    console.log(`Loaded command: ${commandDescriptor.id}`);
};

// Called once for every user request.
// Parameters:
//      - 'line': the input command as a string from the terminal.
mycommand.execute = (line) => {
    // Can only access the vulcan object with 'this.command.client'

    // Code Here
    console.log('Hello world!');
};
```

### Extra Notes

    * On the Discord Command Template, load functions may also be synchronous.
    * On the Terminal Command Template, load functions may also be asynchrnous.
    * On all templates, load functions can be ommited but execution functions must be defined.
    * A command will never execute before its loaded function has completed execution.
