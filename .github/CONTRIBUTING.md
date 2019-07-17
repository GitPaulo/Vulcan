# Contributing to Vulcan

First, thank you for taking an interest in this project! I would like to remind the reader that this project is mostly a private venture, this means that,
although we are willing to accept contributions, they **may take time** to be recognised.

There are only a few things one must consider before contributing:

1. Read the files: [README](../README.md), [CONTRIBUTING](./CONTRIBUTING.md) and [COMMANDS_README](../commands/README.md).
2. Read all of the source code before opening a pull request.
3. Open a pull request with **acceptable** format and reason.
4. Follow the code-style guidelines listed **below**.

## Code Style Guidelines

- **Commenting style** is defined by the default settings of [Better Comments](https://github.com/aaron-bond/better-comments)
- **JavaScript style** is defined by the 'mudamuda' ESLint rule set, [codestyle: mudamuda](https://github.com/GitPaulo/eslint-config-mudamuda).

### Example Code

```js
/**
 * Commenting style:
 * [REMINDER]: 'Better Comments' must be used!
 * [INLINE COMMENTS PREFERED]
 *  
 *  Alert comments:
 *  ! Bug found in this section of code
 *
 *  Task List comments:
 *  TODO Fix XYZ
 *
 *  Regular comments:
 *  * Title/Note
 *      ? Subtitle/Important Section/Highlight somthing relevant
 */

// JavaScript style:
const luckyOrUnlucky = function (n, lucky = 0, unlucky = 0) {
    const luckyString   = 'I got lucky!';
    const unluckyString = 'Damn unlucky!';
    const result        = {
        lucky,
        unlucky,
        date       : Date.now(),
        randomArray: [...Array(n)].map((e) => Math.random())
    };

    for (let i = 0; i < result.randomArray.length; i++) {
        let num      = result.randomArray[i];
        let gotLucky = (num > 0.5)

        // ! Number four is always unlucky Mista!!
        if (i === 4) {
            num = 0;
        }

        console.log(
            gotLucky
            ? (result.lucky++, `${luckyString} #${result.lucky}`)
            : (result.unlucky++, `${unluckyString} #${result.unlucky}`)
        );
    }

    return result;
};
```

**Note:** We highly recommend the use of ESLint for contribution work. Pull requests will be denied if they do not meet standards.

Thank you for reading.
