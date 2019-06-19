const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

module.exports = {
    isDirectMessage: function () {
        return !this.guild;
    },
    setParsed: function (
        {
            command,
            raw,
            args,
            tags,
            head,
            tail,
            cmdName,
            argsStr
        }
    ) {
        this.isCommand  = (command instanceof DiscordCommand);
        this.command    = command;
        this.parsed     = {
            raw,
            args,
            tags,
            head,
            tail,
            cmdName,
            argsStr
        };
    }
};
