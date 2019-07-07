const _ = module.exports;

_.union = function (array) {
    return [...new Set([...this, ...array])];
};

_.difference = function (array) {
    return this.filter((i) => array.indexOf(i) < 0);
};

_.intersection = function (array) {
    return this.filter((x) => array.includes(x));
};

_.shuffle = function () {
    this.sort(() => Math.random() - 0.5);
};

_.asyncForEach = async function (callback) {
    for (let index = 0; index < this.length; index++) {
        await callback(this[index], index, this);
    }
};

_.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};
