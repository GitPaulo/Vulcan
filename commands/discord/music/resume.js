const Discord        = xrequire('discord.js');
const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');
const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

class Resume extends DiscordCommand {
    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        const musicController = message.guild.musicController;

        if (musicController.playing) {
            return message.client.emit('channelInfo', message.channel, 'Music is already playing. Therefore cannot resume.');
        }

        musicController.resume();

        await message.channel.send(messageEmbeds.reply(
            {
                replyeeMessage: message,
                fields: [
                    {
                        name: 'Resumed Song',
                        value: Discord.Util.escapeMarkdown(musicController.loadedSong.name)
                    }
                ]
            }
        ));
    }
}

module.exports = Resume;
