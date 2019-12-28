const clearpublic   = module.exports;
const fs            = xrequire('fs');
const path          = xrequire('path');
const messageEmbeds = xrequire('./utility/modules/messageEmbeds');

clearpublic.execute = async (message) => {
    fs.readdir('./public/', async (err, files) => {
        if (err) {
            throw err;
        }

        for (let file of files) {
            fs.unlink(path.join('./public/', file), (err) => {
                if (err) {
                    throw err;
                }
            });
        }

        await message.channel.send(messageEmbeds.reply({
            message,
            description: 'Deleted all files in the public folder from the file server.'
        }));
    });
};
