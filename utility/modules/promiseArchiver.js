const fs       = xrequire('fs');
const archiver = xrequire('archiver');
const logger   = xrequire('./managers/LogManager').getInstance();

module.exports = (outputPath, fileType, options) => {
    const output = fs.createWriteStream(outputPath);

    output.on('close', () => {
        logger.debug(archive.pointer() + ' total bytes');
        logger.log(`Archiver finalised.\n\tPath: ${outputPath}\n\tOptions: ${options}`);
    });

    output.on('end', () => {
        logger.debug('Data has been drained.');
    });

    const archive = archiver(fileType, options);

    let done;
    let error;
    let promise;
    let onSuccess;
    let onError;

    archive.on('finish', () => {
        done = true;

        if (onSuccess) {
            onSuccess();
        }
    });

    archive.on('error', (err) => {
        error = err;

        if (onError) {
            onError(err);
        }

        throw err;
    });

    // Pipe archive data to the file
    archive.pipe(output);

    let finalize = archive.finalize;

    archive.finalize = () => {
        if (error) {
            return Promise.reject(error);
        }

        if (done) {
            return Promise.resolve();
        }

        if (!promise) {
            promise = new Promise((resolve, reject) => {
                onSuccess = resolve;
                onError   = reject;
            });

            finalize.call(archive);
        }

        return promise;
    };

    return archive;
};
