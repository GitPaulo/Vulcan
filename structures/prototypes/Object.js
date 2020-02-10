Object.simpleTransverse = function (
    value,
    callback
) {
    if (typeof callback !== 'function') {
        throw new TypeError('Second argument is expected to be a function and was not.');
    }

    if (value !== null && typeof value === 'object') {
        Object.entries(value).forEach(([, value]) => {
            this.simpleTransverse(value, callback);
        });
    } else {
        callback(value);
    }
};

Object.filter = function (obj, predicate) {
    let result = {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
            result[key] = obj[key];
        }
    }

    return result;
};

Object.flip = function (obj) {
    let ret = {};

    for (let key in obj) {
        ret[obj[key]] = key;
    }

    return ret;
};

Object.createLookup = function (obj) {
    return Object.assign(Object.create(null), obj);
};
