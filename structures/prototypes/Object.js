const _ = module.exports;

_.simpleTransverse = function (
    value,
    callback
) {
    if (typeof callback !== 'function') {
        throw TypeError('Second argument is expected to be a function and was not.');
    }

    if (value !== null && typeof value === 'object') {
        Object.entries(value).forEach(([, value]) => {
            this.simpleTransverse(value, callback);
        });
    } else {
        callback(value);
    }
};
