const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');
const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

class Shuffle extends DiscordCommand {
    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        let bool = Boolean(message.parsed.args[0]);

        const musicController = message.guild.musicController;
        musicController.setShuffle(bool);

        await message.channel.send(messageEmbeds.reply(
            {
                replyeeMessage: message,
                fields: [
                    {
                        name: 'Shuffle Status',
                        value: bool.toString()
                    }
                ]
            }
        ));
    }
}

module.exports = Shuffle;
