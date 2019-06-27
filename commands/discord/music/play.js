const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');
const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

class Play extends DiscordCommand {
    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        const musicController = message.guild.musicController;

        let request = message.parsed.args[0];

        if (!request) {
            message.client.emit('channelInfo', message.channel, 'Playing whatever is at front of queue. (or restarting current song)');
            await musicController.play();
            return;
        }

        // Join voice if not already in
        if (!musicController.voiceChannel)
            await musicController.joinVoice(message.member.voice.channel);

        // Queue song
        await musicController.enqueue(request, message.channel, message.author);
        await message.channel.send(messageEmbeds.reply(
            {
                replyeeMessage: message,
                title: 'Music Play',
                fields: [
                    { name: 'Queued Song', value: request },
                    { name: 'Queue Size',  value: musicController.queue.length }
                ]
            }
        ));

        // If nothing is playing and the song was queued
        if (musicController.idle)
            await musicController.play();
    }
}

module.exports = Play;
