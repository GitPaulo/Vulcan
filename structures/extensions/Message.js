module.exports = {
    initCommand: function (command, argsString, args, raw, parsedName) {
        this.isCommand  = true;
        this.command    = command;
        this.argsString = argsString;
        this.args       = args;
        this.raw        = raw;
        this.parsedName = parsedName;

        return this;
    }
};
