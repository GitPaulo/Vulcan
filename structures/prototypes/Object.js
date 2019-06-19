module.exports = {
    simpleTransverse: function (
        value,
        callback
    ) {
        if (typeof callback !== 'function')
            throw TypeError('Second argument is expected to be a function and was not.');

        if (value !== null && typeof value === 'object') {
            Object.entries(value).forEach(([key, value]) => {
                this.simpleTransverse(value, callback);
            });
        } else {
            callback(value);
        }
    }
};
