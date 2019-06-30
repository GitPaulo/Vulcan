const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');
const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

class Destroy extends DiscordCommand {
    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        const musicController = message.guild.musicController;

        musicController.destroy();

        await message.channel.send(messageEmbeds.reply(
            {
                replyeeMessage: message,
                description: 'Destroyed the music player.',
                fields: [
                    { name: 'Is Playing?', value: musicController.playing || 'No' },
                    { name: 'Queue Size',  value: musicController.queue.length || '0' }
                ]
            }
        ));
    }
}

module.exports = Destroy;
