const clearpublic   = module.exports;
const fs            = xrequire('fs');
const path          = xrequire('path');
const messageEmbeds = xrequire('./modules/messageEmbeds');

clearpublic.execute = async (message) => {
    fs.readdir('./public/', async (err, files) => {
        if (err) {
            throw err;
        }

        for (let file of files) {
            let santized = path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, '');
            let filePath = path.join('./public/', santized);

            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.unlink(filePath, (err) => {
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
