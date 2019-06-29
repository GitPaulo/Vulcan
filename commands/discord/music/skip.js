const Discord        = xrequire('discord.js');
const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');
const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

class Skip extends DiscordCommand {
    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        const musicController = message.guild.musicController;

        let force = Boolean(message.parsed.args[0]);

        if (musicController.isQueueEmpty()) {
            return message.client.emit('channelInfo', message.channel, 'Cannot skip because queue is empty!');
        }

        let lsName = Discord.Util.escapeMarkdown(musicController.loadedSong.name);
        musicController.skip(force);

        await message.channel.send(messageEmbeds.reply(
            {
                replyeeMessage: message,
                fields: [
                    {
                        name: 'Skipped Song',
                        value: lsName
                    },
                    {
                        name: 'Forced?',
                        value: force.toString()
                    }
                ]
            }
        ));
    }
}

module.exports = Skip;
