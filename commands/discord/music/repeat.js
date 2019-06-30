const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');
const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

class Repeat extends DiscordCommand {
    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        const musicController = message.guild.musicController;

        let input = message.parsed.args[0];
        let bool  = input ? Boolean(input) : !musicController.repeat;

        musicController.setRepeatSong(bool);

        await message.channel.send(messageEmbeds.reply(
            {
                replyeeMessage: message,
                fields: [
                    {
                        name: 'Repeat Status',
                        value: bool.toString()
                    }
                ]
            }
        ));
    }
}

module.exports = Repeat;
