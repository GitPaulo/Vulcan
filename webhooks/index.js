const fs      = xrequire('fs');
const path    = xrequire('path');
const https   = xrequire('https');
const sstream = require('stream-stream');
const logger  = xrequire('./managers/LogManager').getInstance();

// ? Load key from file
const loadWebhookKey = () => {
    const path     = './settings/webhook_key.txt';
    let webhookKey = null;

    fs.existsSync(path)
        ? (webhookKey = fs.readFileSync(path, 'utf8'))
        : ((webhookKey = Math.simpleUUID()), fs.writeFileSync(path, webhookKey));

    logger.debug(`Webhook key loaded: ${webhookKey}`);

    return webhookKey;
};

module.exports = (vulcan, keys) => {
    // ===== Generated before
    const webhookKey = loadWebhookKey();
    const key        = keys.serviceKey;
    const cert       = keys.certificate;

    // ===== Web server constants
    const server = https.createServer({ key, cert }, (request, response) => {
        // * Quick accces
        let cmdString = '(unknown)';

        // ? Nested utility function
        const end = (output, accepted = false) => {
            const requestData = cmdString;
            const prefix      = accepted ? 'ACCEPTED' : 'DENIED';

            // Log response end
            logger.log(
                `[Web Hooks] => HTTPS request has successfully completed!\n\t`
                + `PREFIX: ${prefix}\n\t`
                + `URL & PATH: ${request.url} & ${request.path}\n\t`
                + `CODE: ${request.code}\n\t`
                + `CMDS: ${requestData}\n\t`
                + `OUTPUT: ${output}`
            );

            // End response (gets sent to requestee)
            response.end(
                `=====| Response Ended\n`
                + `Endpoint: webhooks\n`
                + `Status: ${prefix}\n`
                + `Command(s): ${requestData}\n`
                + `Output: ${output}`
            );
        };

        // * Lazy catch bad codes
        if (request.statusCode >= 300 && request.statusCode <= 600) {
            logger.error(
                `[Web Hooks] => Caught bad status code from request!\n`
                + `\tCODE: ${request.statusCode}\n\tURL: ${request.url}`
            );

            return end('Bad status.');
        }

        // ? Check if vulcan is ready
        if (vulcan.readyAt > Date.now()) {
            logger.warn(`[Web Hooks] => Webhook request was recevied before vulcan being ready.\n`);

            return end('Request received before vulcan was ready.');
        }

        // For now only allow POST (the commands)
        // ! Passcode needed?
        if (request.method === 'POST') {
            let body = '';

            request.on('data', (data) => {
                body += data;

                // Too much POST data, kill the connection!
                if (body.length > 1e6) {
                    request.connection.destroy();
                }
            });

            request.on('end', async () => {
                let requestObject = null;

                logger.debug(`POST request recevied, collected body: ${body}`);

                try {
                    requestObject = JSON.parse(body);
                } catch (err) {
                    return end('Response body should be JSON. (Check validity of JSON)');
                }

                const { key, cmds } = requestObject;

                // Set up quick access for 'end'
                cmdString = cmds.join(', ');

                if (!key) {
                    return end('No authorisation key parameter detected!');
                }

                if (key !== webhookKey) {
                    return end('Invalid webhook key! Not authorised.');
                }

                if (!Array.isArray(cmds)) {
                    return end('No cmd parameter(s) detected!');
                }

                // Store all of the output
                const output = [];

                await cmds.asyncForEach(async (cmd) => {
                    const funcFilePath = path.join(__dirname, cmd + '.js');

                    if (!fs.existsSync(funcFilePath)) {
                        return end(`[Web Hooks] => Invalid cmd parameter: ${cmd}`);
                    }

                    // ? If command errors, don't panic!
                    let returnValue = null;

                    try {
                        returnValue = await (xrequire(funcFilePath)(vulcan, request, response));
                    } catch (err) {
                        returnValue = `Command '${cmd}' has errored.\nMessage: ${err.message}`;

                        logger.error(returnValue);
                    }

                    output.push(returnValue);
                });

                // ? Success!
                end(output.join(', '), true);
            });
        }

        // ? GET requests return the client page
        if (request.method === 'GET') {
            const clFolderPath = path.join(__dirname, 'client');
            const clFiles      = fs.readdirSync(clFolderPath);

            // Oh no no
            clFiles.reverse();

            // Stream-Stream
            let multiStream = sstream();

            clFiles.forEach((file, _index) => {
                let filePath = path.join(clFolderPath, file);

                // Write to multi stream
                multiStream.write(fs.createReadStream(filePath));
            });

            multiStream.end();
            multiStream.pipe(response);
        }
    });

    return server;
};
