const _ = module.exports;

_.difference = function (array) {
    return this.filter((i) => array.indexOf(i) < 0);
};

_.shuffle = function () {
    this.sort(() => Math.random() - 0.5);
};

_.asyncForEach = async function (callback) {
    for (let index = 0; index < this.length; index++) {
        await callback(this[index], index, this);
    }
};
