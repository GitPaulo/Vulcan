Object.simpleTransverse = function (value, callback) {
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
        if (Object.hasOwnProperty(key)) {
            ret[obj[key]] = key;
        }
    }

    return ret;
};

Object.safeLiteral = function (obj) {
    return Object.freeze(Object.assign(Object.create(null), obj));
};

Object.keyHierarchy = function (obj) {
    const isObject = (val) =>
        typeof val === 'object' && !Array.isArray(val);

    const addDelimiter = (a, b) =>
        a ? `${a}.${b}` : b;

    const paths = (obj = {}, head = '') => Object.entries(obj)
        .reduce((product, [key, value]) => {
            let fullPath = addDelimiter(head, key);

            return isObject(value)
                ? product.concat(paths(value, fullPath))
                : product.concat(fullPath);
        }, []);

    return paths(obj);
};

Object.resolveKeyPath = function (obj, path) {
    return path.split('.').reduce((o, i) => o[i], obj);
};

Object.assignByKeyPath = function (obj, is, value) {
    if (typeof is == 'string') {
        return Object.assignByKeyPath(obj, is.split('.'), value);
    } else if (is.length === 1 && typeof value !== 'undefined') {
        return obj[is[0]] = value;
    } else if (is.length === 0) {
        return obj;
    }

    return Object.assignByKeyPath(obj[is[0]], is.slice(1), value);
};

Object.isEmpty = function (obj) {
    return Object.entries(obj).length === 0 && obj.constructor === Object;
};
