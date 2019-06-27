const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');
const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

class Repeat extends DiscordCommand {
    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        let bool = Boolean(message.parse.args[0]);

        const musicController = message.guild.musicController;
        musicController.setRepeat(bool);

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
