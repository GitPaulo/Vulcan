const mongoose = xrequire('mongoose');
const logger   = xrequire('./managers/LogManager').getInstance();

mongoose.Promise = global.Promise;

class DatabaseManager {
    constructor (vulcan) {
        this.vulcan = vulcan;
        this.db     = mongoose.connection;
        this.db.on('error', logger.error.bind(logger, 'MongoDB connection error!'));
        this.db.on('disconnected', logger.log.bind(logger, 'MongoDB connection has been lost!'));
        this.db.on('reconnected', logger.log.bind(logger, 'MongoDB connection has been restablished!'));
        this.db.on('close', logger.log.bind(logger, 'MongoDB connection has been closed!'));
    }

    async connect (username, password, settings = {
        autoReconnect: true,
        reconnectTries: 10,
        reconnectInterval: 3000,
        useNewUrlParser: true
    }) {
        const dbURL = 'mongodb://' + username + ':' + password + '@ds125125.mlab.com:25125/vulcan';

        try {
            await mongoose.connect(dbURL, settings);
        } catch (err) {
            logger.error(err.message);
        }

        // If the Node process ends, close the Mongoose connection
        process.on('SIGINT', () => {
            mongoose.connection.close(() => {
                console.log('Mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });
    }

    // to do (on both, check first if this.db is undefined [we may sometimes not want to use database])
    // eslint-disable-next-line no-unused-vars
    async databaseQuery (query) {}
    databaseQuerySync () {}
}

module.exports = DatabaseManager;
