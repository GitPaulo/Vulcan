const _ = module.exports;

_.roundDP = (value, decimals) => Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);

_.randomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
};

_.randomArbitrary = (min, max) => Math.random() * (max - min) + min;
