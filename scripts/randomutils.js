/* Random Utility functions will be here - this is sort of a meme module */

exports.round = function(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}