Object.defineProperty(Error.prototype, 'shortMessage', {
    enumerable: false,
    value: function () {
        let err   = this;
        let stack = err.stack.split('\n');
        return `(${err.name}): ${err.message}\n\t[LOCATION] => '${stack[0]}'`;
    }
});