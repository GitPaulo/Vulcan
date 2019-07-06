const mathFunctions = module.exports = {};

mathFunctions.round = (value, decimals) => Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);

mathFunctions.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

mathFunctions.getRandomArbitrary = (min, max) => Math.random() * (max - min) + min;
