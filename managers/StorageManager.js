const mongoose = require('mongoose');
const YAML     = require('js-yaml');
const fs       = require('fs');
const gif      = require('../database/models/gif')

class StorageManager {
    constructor() {
    }

    databaseConnect() {
        mongoose.Promise = global.Promise;

        // PASSWORD SAFETY?? HASH??? uhmmm (WE NEED TO LOOK INTO THIS)
        const credentialsFile = fs.readFileSync(global.Defaults.files.dbcredentials.location, 'utf8');
        const credentials     = YAML.safeLoad(credentialsFile);

        this.dbURL = 'mongodb://' + credentials.username + ':' + credentials.password + '@ds125125.mlab.com:25125/vulcan';
        this.db    = mongoose.connection;
        
        // DB Event callbacks
        let logger = logger;
        this.db.on('error', logger.error.bind(logger, 'MongoDB connection error:'));
        this.db.on('disconnected', logger.info.bind(logger, 'MongoDB connection has been lost!'));
        this.db.on('reconnected', logger.info.bind(logger, 'MongoDB connection has been restablished!'));
        this.db.on('close', logger.info.bind(logger, 'MongoDB connection has been closed!'));
        
        mongoose.connect(this.dbURL, () => {
            logger.info('MongoDB connection has been established!');
        });

        // If the Node process ends, close the Mongoose connection 
        process.on('SIGINT', function() {  
            mongoose.connection.close(function () { 
                print('Mongoose default connection disconnected through app termination'); 
                process.exit(0); 
            }); 
        });
    }

    // to do (on both, check first if this.db is undefined [we may sometimes not want to use database])
    async databaseQuery(query) {}
    databaseQuerySync() {}
}

module.exports = StorageManager;