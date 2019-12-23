const http   = require('http');
const url    = require('url');
const fs     = require('fs');
const path   = require('path');
const logger = xrequire('./managers/LogManager').getInstance();

const rootDirReg       = /\.\/[^/\\]+/;
const publicFolderPath = './public/';

// Create public folder (where files can be seen)
if (!fs.existsSync(publicFolderPath)) {
    fs.mkdirSync(publicFolderPath);
}

/* eslint-disable no-unused-vars */
module.exports = (vulcan) => {
    const server = http.createServer((req, res) => {
        logger.log(`[File Server] => ${req.method} ${req.url}`);

        // Parse URL
        const parsedUrl = url.parse(req.url);
        // Extract URL path
        let pathname = `.${parsedUrl.pathname}`;
        // Nased on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(pathname).ext;
        // Maps file extention to MIME typere
        const map = {
            '.ico' : 'image/x-icon',
            '.html': 'text/html',
            '.js'  : 'text/javascript',
            '.json': 'application/json',
            '.css' : 'text/css',
            '.png' : 'image/png',
            '.jpg' : 'image/jpeg',
            '.wav' : 'audio/wav',
            '.mp3' : 'audio/mpeg',
            '.svg' : 'image/svg+xml',
            '.pdf' : 'application/pdf',
            '.doc' : 'application/msword'
        };

        fs.exists(pathname, (exist) => {
            if (!exist) {
                // If the file is not found, return 404
                res.statusCode = 404;
                res.end(`[File Server] => File ${pathname} not found!`);

                return;
            }
            
            const base  = pathname.match(rootDirReg)
            const sync  = fs.statSync(pathname);
            const isDir = sync.isDirectory();

            // Check for Authentication (public folder)
            if (!base || base[0] + '/' !== publicFolderPath) {
                // Cheeky!
                res.statusCode = 403;
                res.end(`[File Server] => Access denied to this part of the file system.`);

                return;
            }

            // If is a directory search for index file matching the extention
            if (isDir) {
                fs.readdir(pathname, (err, files) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end(`[File Server] => Error getting the file: ${err}.`);
                    } else {
                        res.end(JSON.stringify(files));
                    }
                });
            } else { // Read file from file system
                fs.readFile(pathname, (err, data) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end(`[File Server] => Error getting the file: ${err}.`);
                    } else {
                        // If the file is found, set Content-type and send data
                        res.setHeader('Content-type', map[ext] || 'text/plain');
                        res.end(data);
                    }
                });
            }
        });
    });

    return server;
};
