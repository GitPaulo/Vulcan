const proto = Error.prototype;

global.extend(proto, 'shortMessage', function () {
    let err   = this;
    let stack = err.stack.split('\n');

    return `(${err.name}): ${err.message}\n\t[LOCATION] => '${stack[0]}'`;
});
