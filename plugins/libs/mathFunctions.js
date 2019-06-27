const mathFunctions = module.exports = {};

mathFunctions.round = (value, decimals) => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};
