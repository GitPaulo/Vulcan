const fs      = xrequire('fs');
const path    = xrequire('path');
const http    = xrequire('https');
const sstream = require('stream-stream');
const logger  = xrequire('./modules/logger').getInstance();

// Constants
const clFolderPath = path.join(__dirname, 'client');
const clFiles      = fs.readdirSync(clFolderPath);

// Oh no no
clFiles.reverse();

module.exports = (vulcan, keys) => {
    const server = http.createServer((request, response) => {
        logger.log(`[ClientServer] => ${request.method} ${response.url}`);

        if (request.method !== 'GET') {
            return;
        }

        // Stream-Stream
        let multiStream = sstream();

        clFiles.forEach((file, _index) => {
            let filePath = path.join(clFolderPath, file);

            // Write to multi stream
            multiStream.write(fs.createReadStream(filePath));
        });

        multiStream.end();
        multiStream.pipe(response);

        logger.log(`Finished piping client files to response stream.`);
    });

    return server;
};
