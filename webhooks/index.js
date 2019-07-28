const fs     = xrequire('fs');
const path   = xrequire('path');
const https  = xrequire('https');
const logger = xrequire('./managers/LogManager').getInstance();

// ===== Web server constants
const key    = fs.readFileSync('key.pem');
const cert   = fs.readFileSync('cert.pem');
const server = https.createServer({ key, cert }, (request, response) => {
    if (request.method === 'POST') {
        handlePOST(request, response);
    }

    if (request.method === 'GET') {
        handleGET(request, response);
    }

    logger.log(`${request.method} request received!\n\tURL: ${request.url}`);
});

// ==== HTTP Method Handlers
const handleGET = (request, response) => {
    request.end('Currently there is no functionality tied to GET requests :(');
};

const handlePOST = (request, response) => {
    let body = '';

    request.on('data', (data) => {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6) {
            request.connection.destroy();
        }
    });

    request.on('end', () => {
        let cmds = null;

        logger.debug(`POST request ended, collected body: ${body}`);

        try {
            cmds = JSON.parse(body);
        } catch (err) {
            return response.end('Response body should be JSON');
        }

        if (!Array.isArray(cmds)) {
            return response.end('No cmd parameter!');
        }

        cmds.forEach((cmd) => {
            const funcFilePath = path.join(__dirname, cmd + '.js');

            if (!fs.existsSync(funcFilePath)) {
                return response.end('Invalid cmd parameter!');
            }

            xrequire(funcFilePath)(request, response);

            response.end('POST request successful!');
        });
    });
};

// Export to store on vulcan client
module.exports = server;
