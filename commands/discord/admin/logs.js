const logs            = module.exports;
const path            = xrequire('path');
const { performance } = xrequire('perf_hooks');
const messageEmbeds   = xrequire('./utility/modules/messageEmbeds.js');
const archiver        = xrequire('./utility/modules/promiseArchiver');

logs.execute = async (message) => {
    const dmOnly  = Boolean(message.parsed.args[0]);
    const t0      = performance.now();
    const zipPath = path.join(global.basedir, 'data', 'logs.zip');
    const archive = archiver(zipPath, 'zip', {
        store: true
    });

    // Append all logs
    archive.directory('./logs/');

    // Finalize the archive
    await archive.finalize();

    // DM only?
    const channel = dmOnly
        ? ((await message.author.createDM()), (await message.channel.send(`Sent zipped logs to your DMs <@${message.author.id}>`)), message.author.dmChannel)
        : message.channel;

    // Message
    await channel.send(messageEmbeds.reply(
        {
            message,
            fields: [
                { name: 'Time taken',  value: `${Math.roundDP(performance.now() - t0, 2)}ms`, inline: true },
                { name: 'Sent to DM?', value: dmOnly,                                         inline: true }
            ],
            files: [
                zipPath
            ]
        }
    ));
};
