# Contributing to Vulcan

Before anything, I thank you for taking an interest in this project! Although presented as mostly a 'personal' project, Vulcan still requires all contributors to follow the follwoing simple guidelines...

There are only a few things one must consider before contributing:

1. Read all README files: [README](../README.md), [CONTRIBUTING](./CONTRIBUTING.md) and [COMMANDS_README](../commands/README.md).
2. Read all of the relevant source code before opening a merge request.
3. Open reasonable merge requests and populate the description with description of the assumed reason.
4. Follow the code style guidelines below.
5. Have fun :)

## Directory Structure

| Folder        | Description                                                     | Generated |
| :------------ | :-------------------------------------------------------------- | :-------: |
| assets        | Contains all project assets. (hardcoded data & valuables)       | No        |
| commands      | Contains all command definitions and their code.                | No        |
| data          | Meaningfully structured storage directory for application data. | Yes       |
| events        | Contains all event oriented code.                               | No        |
| executions    | Different ways of booting up vulcan are stored here.            | No        |
| handlers      | Indepedent functional code directly tied to vulcan subroutines. | No        |
| logs          | Meaningfully structured storage directory for application logs. | Yes       |
| modules       | Indepedent modular code that is used by vulcan.                 | No        |
| prerequisites | Required code to run any vulcan execution.                      | No        |
| settings      | All user customizables encouintered here.                       | Yes       |
| shell         | Contains all terminal scripts.                                  | No        |
| structures    | Contains all classes, managers and extended prototypes/classes. | No        |
| webfiles      | Contains all files associated with the web (file) server.       | No        |
| webhooks      | Contains all files associated with the web (hook) server.       | No        |

## Code Style Guidelines

All commits will be checked with the following tools:

- **Better Comments** is used as the [commenting style](https://github.com/aaron-bond/better-comments).
- **JSDoc** is used as the [documentation style](https://jsdoc.app/).
- **Pettier** is used and included in developer dependencies as the code formatter.
- **Eslint** is used and included in developer dependencies as the linter.

```sh
Merge requests will be denied if they do not meet basic standards.
```

*Thank you for reading :)*
