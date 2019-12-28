const restart       = module.exports;
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');
const exec          = xrequire('util').promisify(xrequire('child_process').exec);

restart.execute = async (message) => {
    const command = (global.isLinux ? 'sudo ' : '') + 'npm run production:restart';

    try {
        // eslint-disable-next-line prefer-const
        // eslint-disable-next-line no-unused-vars
        let { stdout, sterr } = await exec(command);
    } catch (err) {
        return message.client.emit(
            'channelWarning',
            message.channel,
            `Unable to perform a restart.\n\`\`\`\n${err.message}\`\`\``
        );
    }

    await message.channel.send(messageEmbeds.reply(
        {
            message,
            title: 'Restarting Vulcan'
        }
    ));
};
