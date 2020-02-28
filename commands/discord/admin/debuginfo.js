const debuginfo     = module.exports;
const messageEmbeds = xrequire('./modules/messageEmbeds');
const logger        = xrequire('./modules/logger').getInstance();

debuginfo.execute = async (message) => {
    await message.channel.send(messageEmbeds.reply(
        {
            message,
            description: `Vulcan has been online for: \`${String(message.client.uptime / 1000).toHHMMSS()}\` on \`${process.arch}(${process.platform})\`.`,
            fields     : [
                {
                    name : 'Last Warn',
                    value: `\`\`\`${logger.lastWarning || '(No Last Warning)'}\`\`\``
                },
                {
                    name : 'Last Error',
                    value: `\`\`\`${logger.lastError || '(No Last Error)'}\`\`\``
                },
                {
                    name : 'Performance Snapshot',
                    value: `\`${JSON.stringify(message.client.performance)}\``
                },
                {
                    name : 'Process Snapshot',
                    value: `\`${JSON.stringify(process.memoryUsage())}\``
                },
                {
                    name : 'Resource Snapshot',
                    value: `\`${JSON.stringify(process.resourceUsage())}\``
                },
                {
                    name : 'Node D-Versions',
                    value: `\`${JSON.stringify(process.versions)}\``
                }
            ]
        }
    ));
};
