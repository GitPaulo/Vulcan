# Contributing to Vulcan

Firstly, thank you for taking an interest in this project! Although presented as mostly a 'non-professional' project, Vulcan still requires all contributors to follow simple guidelines. 

There are only a few things one must consider before contributing:

1. Read all README files: [README](../README.md), [CONTRIBUTING](./CONTRIBUTING.md) and [COMMANDS_README](../commands/README.md).
2. Read all of the relevant source code before opening a pull request.
3. Open a pull request with a reasonable format and reason.
4. Follow the additional guidelines listed below!
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

- **Commenting style** is defined by the default settings of [Better Comments](https://github.com/aaron-bond/better-comments) and [JSDoc](https://jsdoc.app/).
- **Program code style** is defined by the 'mudamuda' ESLint rule set, [codestyle: mudamuda](https://github.com/GitPaulo/eslint-config-mudamuda).

### Example Comments

```js
`
For Multiline Comments
    - Titles and TODO comments are not full stopped.
    - Capitalise all lines.
    - Follow identation as shown bellow.
`

/**
 * TODO: Task #23445
 * ? Title
 * ! Important information.
 * * Extra information.
 * Normal comment.
 */

`
Inline Comments
    - Capitalise.
    - Keep it short.
`

// Standard multiline
// ! Better comments allowed
```

### Example Code

```js
// We allign all assignments (OCD)
const luckyString   = 'I got lucky!';
const unluckyString = 'Damn unlucky!'

/**
 * ? JSDoc
 * Function which will determine your luck in a stupid and obnoxious way.
 * ! This function is only to serve as a code style example.
 * @param {number} n
 * @param {number} [lucky=0]
 * @param {number} [unlucky=0]
 * @returns {string}
 */
let luckyOrUnlucky = function (n, lucky = 0, unlucky = 0) {
    // Checks
    n = Number(n);

    if (!n) {
        throw Error(`Expected 'n' to be a number`);
    }

    // Constants
    const randomArray = [...Array(n)].map((_e) => Math.random())

    // Begin lucky shooting
    for (let i = 0; i < randomArray.length; i++) {
        let num      = randomArray[i];
        let gotLucky = (num > 0.5);

        // ! Number four is always unlucky Mista!!
        if (i === 4) {
            num = 0;
        }

        console.log(
            gotLucky
                ? (lucky++, `${luckyString} (x${lucky})`)
                : (unlucky++, `${unluckyString} (x${unlucky})`)
        );
    }

    return {
        lucky,
        unlucky,
        randomArray,
    };
};
```

```
Pull requests will be denied if they do not meet basic standards.
```

*Thank you for reading.*
