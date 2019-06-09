const isPlainObject = x =>
    Object(x) === x && !Array.isArray(x)

const formatKey = (...segments) =>
    segments.join('.')

module.exports = {
    allKeys: function (o, pre = [], acc = []) {
        Object
            .keys(o)
            .reduce((acc, k) =>
                isPlainObject(o[k]) ? [...acc, ...deepKeys(o[k], [...pre, k], acc)] : [...acc, formatKey(...pre, k)], []
            )
    }
}