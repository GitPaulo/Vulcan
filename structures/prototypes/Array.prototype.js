Object.defineProperty(Array.prototype, 'difference', {
    enumerable: false,
    value: function (a) {
        return this.filter(function (i) {
            return a.indexOf(i) < 0;
        });
    }
});