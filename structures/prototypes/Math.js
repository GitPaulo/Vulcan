const _ = module.exports;

_.roundDP = (value, decimals) => Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);

_.randomRange = (min, max) => Math.random() * (max - min) + min;
