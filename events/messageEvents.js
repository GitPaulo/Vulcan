// Expect a message handler object here soon TM
// For now have shit message handle function:

vulcan.on("message", async message => {
    vulcan.logger.info("[GUILD: " + message.guild.name + "] =>[MESSAGE][" + message.author.username + "][" + message.channel.name + "]: " + message);

    if (message.author.bot) return;

    let found = false;
    for (let prefix of vulcan.configurations.prefixes){
        found = found || Boolean(message.content[0] == prefix);
    }

    if (!found) return;

    const args    = message.content.slice(1).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(vulcan.ping)}ms`);
    }

    if (command === "say") {
        const sayMessage = args.join(" ");
        message.delete().catch(O_o => {});
        message.channel.send(sayMessage);
    }
});