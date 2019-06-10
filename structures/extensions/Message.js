module.exports = {
    initCommand : function (command, argString, args, raw, parsedName) {
        this.isCommand  = true;
        this.command    = command;
        this.argString  = argString;
        this.args       = args;
        this.raw        = raw;
        this.parsedName = parsedName;

        return this;
    }
}
