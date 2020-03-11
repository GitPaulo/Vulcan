const http   = require('http');
const url    = require('url');
const fs     = require('fs');
const path   = require('path');
const logger = xrequire('./modules/logger').getInstance();

// Constants
// Maps file extention to MIME typere
const extToMime = new Map([
    ['.ico',  'image/x-icon'],
    ['.html', 'text/html'],
    ['.js',   'text/javascript'],
    ['.json', 'application/json'],
    ['.css',  'text/css'],
    ['.png',  'image/png'],
    ['.jpg',  'image/jpeg'],
    ['.wav',  'audio/wav'],
    ['.mp3',  'audio/mpeg'],
    ['.mp4',  'video/mp4'],
    ['.svg',  'image/svg+xml'],
    ['.pdf',  'application/pdf'],
    ['.doc',  'application/msword']
]);

// ! This folder can be manipulated via HTTP requests
const rootFolderName    = 'webfiles';
const publicFolderName  = 'public';
const publicFolderPath  = path.join(global.basedir, rootFolderName, publicFolderName);
const rpublicFolderPath = './' + rootFolderName + '/' + publicFolderName;

// Create public folder (where files can be seen)
if (!fs.existsSync(publicFolderPath)) {
    fs.mkdirSync(publicFolderPath);
}

/* eslint-disable no-unused-vars */
module.exports = (vulcan) => {
    const server = http.createServer((request, response) => {
        logger.log(`[File Server] => ${request.method} ${request.url}`);

        // Parse URL
        const parsedUrl = url.parse(request.url);

        // Extract URL path
        let pathname = `.${parsedUrl.pathname}`;

        // Nased on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(pathname).ext;

        // ? Check if public subfolder exists
        fs.exists(pathname, (exist) => {
            if (!exist) {
                // If the file is not found, return 404
                response.statusCode = 404;
                response.end(`[File Server] => File ${pathname} not found!`);

                return;
            }

            const sync  = fs.statSync(pathname);
            const isDir = sync.isDirectory();

            // Check for Authentication (public folder)
            console.log({pathname, rpublicFolderPath, publicFolderPath})
            if (!pathname.startsWith(rpublicFolderPath)) {
                // Cheeky!
                response.statusCode = 403;
                response.end(`[File Server] => Access denied to this part of the file system.`);

                return;
            }

            // If is a directory search for index file matching the extention
            if (isDir) {
                fs.readdir(pathname, (err, files) => {
                    if (err) {
                        response.statusCode = 500;
                        response.end(`[File Server] => Error getting the file: ${err}.`);
                    } else {
                        response.end(JSON.stringify(files));
                    }
                });
            } else { // Read file from file system
                fs.readFile(pathname, (err, data) => {
                    if (err) {
                        response.statusCode = 500;
                        response.end(`[File Server] => Error getting the file: ${err}.`);
                    } else {
                        // If the file is found, set Content-type and send data
                        response.setHeader('Content-type', extToMime.get(ext) || 'text/plain');
                        response.end(data);
                    }
                });
            }
        });
    });

    // It is useful
    server.rpublicFolderPath = rpublicFolderPath;
    server.publicFolderPath  = publicFolderPath;
    server.publicFolderName  = publicFolderName;

    return server;
};
