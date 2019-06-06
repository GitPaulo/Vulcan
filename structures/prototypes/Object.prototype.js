Object.defineProperty(Object.prototype, 'methodNames', {
    enumerable: false,
    value: function () {
        let obj = this;
        let properties = new Set()
        let currentObj = obj;

        do {
            Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
        } while ((currentObj = Object.getPrototypeOf(currentObj)))

        return [...properties.keys()].filter(item => typeof obj[item] === 'function')
    }
});