var mathematics = {};

mathematics.round = function (value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

module.exports = mathematics;