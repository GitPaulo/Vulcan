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

        const end = (message, prefix = 'REQUEST DENIED') => {
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

            request.on('end', () => {
                let requestObject = null;

                logger.debug(`[Web Hooks] => POST request ended, collected body: ${body}`);

                try {
                    requestObject = JSON.parse(body);
                } catch (err) {
                    return end('[Web Hooks] => Response body should be JSON. (Check validity of JSON)');
                }

                const { key, cmds } = requestObject;

                if (!key) {
                    return end('[Web Hooks] => No authorisation key parameter detected!');
                }

                if (key !== webhookKey) {
                    return end('[Web Hooks] => Invalid webhook key! Not authorised.');
                }

                if (!Array.isArray(cmds)) {
                    return end('[Web Hooks] => No cmd parameter(s) detected!');
                }

                cmds.forEach((cmd) => {
                    const funcFilePath = path.join(__dirname, cmd + '.js');

                    if (!fs.existsSync(funcFilePath)) {
                        return end(`[Web Hooks] => Invalid cmd parameter: ${cmd}`);
                    }

                    const output = xrequire(funcFilePath)(vulcan, request, response);

                    end(`[Web Hooks] => Request has been completed successfully!\n\n[Output]\n${output}`, 'POST REQUEST ACCEPTED');
                });
            });
        }

        if (request.method === 'GET') {
            end('[Web Hooks] => Currently there is no functionality tied to GET requests :(');
        }

        logger.log(`[Web Hooks] => ${request.method} request received!\n\tURL: ${request.url}`);
    });

    return server;
};
