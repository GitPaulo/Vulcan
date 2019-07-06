/*
* Files of type (1): <Class>.prototype.js
* Will have the module.exports methods added
* -with enumerate property as false, to the prototype of <Class>.
*/

/*
* Files of type (2): <Class>.js
* Will have the module.exports methods added
* -to the <Class> object.
*/

const fs              = xrequire('fs');
const path            = xrequire('path');
const { performance } = xrequire('perf_hooks');
const logger          = xrequire('./managers/LogManager').getInstance();

module.exports = () => {
    let files = fs.readdirSync(__dirname);

    files.forEach((file) => {
        if (file === 'index.js') {
            return;
        }

        let t     = performance.now();
        let parts = file.split('.');
        let ext   = 'js';

        if (parts.length < 2 || parts.length > 3) {
            throw Error(`Invalid prototypes file name: ${file}`);
        }

        if (parts[parts.length - 1] !== ext) {
            throw Error(`Invalid prototypes file extension: ${file}`);
        }

        let globalObject = global[parts[0]];

        if (!globalObject) {
            throw Error(`Invalid object from file name: ${globalObject} from ${file}`);
        }

        let targetObject = parts[1] === 'prototype' ? globalObject.prototype : globalObject;
        let properties   = xrequire(path.join(__dirname, file));

        for (let property in properties) {
            let propertyValue = properties[property];
            Object.defineProperty(targetObject, property, {
                enumerable: false,
                value: propertyValue
            });
        }

        logger.log(`Sucessfully loaded prototypes file '${file}'. (took ${Math.round(performance.now() - t)}ms)`);
    });
};
