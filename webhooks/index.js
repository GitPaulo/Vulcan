const fs     = xrequire('fs');
const path   = xrequire('path');
const https  = xrequire('https');
const logger = xrequire('./managers/LogManager').getInstance();

// ===== Generate key
const keyPath  = './settings/webhook_key.txt';
let webhookKey = null;

fs.existsSync(keyPath)
    ? (webhookKey = fs.readFileSync(keyPath, 'utf8'))
    : ((webhookKey = Math.simpleUUID()), fs.writeFileSync(keyPath, webhookKey));

logger.debug(`Webhook key loaded: ${webhookKey}`);

module.exports = (vulcan, keys) => {
    // ===== Generated before
    const key  = keys.serviceKey;
    const cert = keys.certificate;

    // ===== Web server constants
    const server = https.createServer({ key, cert }, (request, response) => {
        // Lazy D:<
        if (request.statusCode >= 300 && request.statusCode <= 600) {
            return logger.error(`[Web Hooks] => Caught bad status code from request!\n\tCODE: ${request.statusCode}\n\tURL: ${request.url}`);
        }

        const end = (message, prefix = '[Denied]') => {
            logger.warn(
                `[Web Hooks] => HTTPS request has successfully completed!\n\t`
                + `MESSAGE: ${message}\n\t`
                + `PREFIX: ${prefix}`
            );
            response.end(`[Web Hooks] => ${prefix} => ${message}`);
        };

        // ! For now only allow POST (the commands)
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

                end(`Request has been completed!\n\n========[Output]========\n[${output.join(', ')}]`, '[Accepted]');
            });
        }

        if (request.method === 'GET') {
            end('Currently there is no functionality tied to GET requests :(');
        }

        logger.log(`[Web Hooks] => Parsing request: '${request.method}' with URL: '${request.url}'`);
    });

    return server;
};
