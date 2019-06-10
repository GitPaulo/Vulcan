const mongoose = xrequire('mongoose');
const logger   = xrequire('./managers/logManager').getInstance();

mongoose.Promise = global.Promise;

class databaseManager {
    constructor() {
        this.db = mongoose.connection;
        this.db.on('error', logger.error.bind(logger, 'MongoDB connection error!'));
        this.db.on('disconnected', logger.info.bind(logger, 'MongoDB connection has been lost!'));
        this.db.on('reconnected', logger.info.bind(logger, 'MongoDB connection has been restablished!'));
        this.db.on('close', logger.info.bind(logger, 'MongoDB connection has been closed!'));
    }

    async connect(username, password, settings = {
        autoReconnect     : true,
        reconnectTries    : 10,
        reconnectInterval : 3000,
        useNewUrlParser   : true,
    }) {
        const dbURL = 'mongodb://' + username + ':' + password + '@ds125125.mlab.com:25125/vulcan';

        await mongoose.connect(dbURL, settings);

        // If the Node process ends, close the Mongoose connection 
        process.on('SIGINT', function () {
            mongoose.connection.close(function () {
                console.log('Mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });
    }

    // to do (on both, check first if this.db is undefined [we may sometimes not want to use database])
    // eslint-disable-next-line no-unused-vars
    async databaseQuery(query) {}
    databaseQuerySync() {}
}

module.exports = databaseManager;