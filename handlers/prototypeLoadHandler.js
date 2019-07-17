
/*
* Prototype - Tasked with dynamically loading all extensions found in (./structures/prototypes/)
  Files on that dir must be named following pattern: <discord.js_Class>.js

  ? Files of type (1): <Class>.prototype.js
    - Will have the module.exports methods added
    - With enumerate property as false, to the prototype of <Class>.

  ? Files of type (2): <Class>.js
    - Will have the module.exports methods added
    - To the <Class> object.
*/

const fs              = xrequire('fs');
const path            = xrequire('path');
const { performance } = xrequire('perf_hooks');
const logger          = xrequire('./managers/LogManager').getInstance();

// Needs to be absolute REEE fs lib
const prototypesDir = path.join(__basedir, './structures/prototypes/');

module.exports = () => {
    let files = fs.readdirSync(prototypesDir);

    files.forEach((file) => {
        if (file === 'index.js') {
            return;
        }

        let t     = performance.now();
        let parts = file.split('.');
        let ext   = 'js';

        if (parts.length < 2 || parts.length > 3) {
            throw new Error(`Invalid prototypes file name: ${file}`);
        }

        if (parts[parts.length - 1] !== ext) {
            throw new Error(`Invalid prototypes file extension: ${file}`);
        }

        let globalObject = global[parts[0]];

        if (!globalObject) {
            throw new Error(`Invalid object from file name: ${globalObject} from ${file}`);
        }

        let targetObject = parts[1] === 'prototype' ? globalObject.prototype : globalObject;
        let properties   = xrequire(path.join(prototypesDir, file));

        for (let property in properties) {
            let propertyValue = properties[property];

            Object.defineProperty(targetObject, property, {
                enumerable: false,
                value     : propertyValue
            });
        }

        logger.log(`Sucessfully loaded prototypes file '${file}'. (took ${Math.round(performance.now() - t, 2)}ms)`);
    });
};
