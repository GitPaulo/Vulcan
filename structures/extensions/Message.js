const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

module.exports = class _Message extends xrequire('discord.js').Message {
    isDirectMessage () {
        return !this.guild;
    }

    setParsed (
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
