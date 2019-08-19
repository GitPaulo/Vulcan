const proto = Array.prototype;

global.extendPrototype(proto, 'union', function (array) {
    return [...new Set([...this, ...array])];
});

global.extendPrototype(proto, 'difference', function (array) {
    return this.filter((i) => array.indexOf(i) < 0);
});

global.extendPrototype(proto, 'intersection', function (array) {
    return this.filter((x) => array.includes(x));
});

global.extendPrototype(proto, 'shuffle', function () {
    this.sort(() => Math.random() - 0.5);
});

global.extendPrototype(proto, 'asyncForEach', async function (callback) {
    for (let index = 0; index < this.length; index++) {
        await callback(this[index], index, this);
    }
});

global.extendPrototype(proto, 'random', function () {
    return this[Math.floor(Math.random() * this.length)];
});

global.extendPrototype(proto, 'subsetOf', function (array) {
    return this.every((val) => array.includes(val));
});
