module.exports = {
    difference: function (array) {
        return this.filter(function (i) {
            return array.indexOf(i) < 0;
        });
    },
    shuffle: function () {
        this.sort(() => Math.random() - 0.5);
    },
    asyncForEach: async function (callback) {
        for (let index = 0; index < this.length; index++) {
            await callback(this[index], index, this);
        }
    }
};
