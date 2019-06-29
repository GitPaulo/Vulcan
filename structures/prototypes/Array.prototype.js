module.exports = {
    difference: function (array) {
        return this.filter(function (i) {
            return array.indexOf(i) < 0;
        });
    },
    shuffle: function () {
        this.sort(() => Math.random() - 0.5);
    }
};
