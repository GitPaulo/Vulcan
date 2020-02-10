/*
?   Warn (Discord Event)
*   Emitted for general warnings.
    https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-warn
*/

module.exports = (info) => xrequire('./managers/LogManager').getInstance().warning(info);
