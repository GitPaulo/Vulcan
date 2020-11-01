# Contributing to Vulcan

Before anything, I thank you for taking an interest in this project! Although presented as mostly a 'personal' project, Vulcan still requires all contributors to follow the follwoing simple guidelines...

There are only a few things one must consider before contributing:

1. Read all README files: [MAIN_README](../README.md), [COMMANDS_README](../commands/README.md).
2. Read all of the relevant source code before opening a merge/pull request.
3. Open reasonable merge/pull requests such that:
    - They are properly labeled according to the sub-project.
    - They are created for a reasonable feature/bug/etc.
    - They follow the contributing guidelines.
4. Have fun :)

## Directory Structure

| Folder        | Description                                                     | Generated |
| :------------ | :-------------------------------------------------------------- | :-------: |
| assets        | Contains all project assets. (hardcoded data & valuables)       |    No     |
| commands      | Contains all command definitions and their code.                |    No     |
| data          | Meaningfully structured storage directory for application data. |    Yes    |
| events        | Contains all event oriented code.                               |    No     |
| executions    | Different ways of booting up vulcan are stored here.            |    No     |
| handlers      | Functional code directly tied to vulcan subroutines.            |    No     |
| logs          | Meaningfully structured storage directory for application logs. |    Yes    |
| modules       | Vulcan modules and submodules are stored here.                  |    No     |
| prerequisites | Required code to run any vulcan execution.                      |    No     |
| settings      | All user customizables encouintered here.                       |    Yes    |
| shell         | Contains all terminal scripts.                                  |    No     |
| structures    | Contains all classes, managers and extended prototypes/classes. |    No     |

## Code Style Guidelines

All commits will be checked with the following tools:

- **Better Comments** is used as the [commenting style](https://github.com/aaron-bond/better-comments).
- **JSDoc** is used as the [documentation style](https://jsdoc.app/).
- **Pettier** is used and included in developer dependencies as the code formatter.
- **Eslint** is used and included in developer dependencies as the linter.

```sh
Merge requests will be denied if they do not meet basic standards.
```

_Thank you for reading :)_
