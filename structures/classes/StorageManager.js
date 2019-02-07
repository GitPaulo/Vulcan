const mongoose = require('mongoose');
const YAML = require('js-yaml');
const fs = require('fs');
const Example = require('../database/models/example')

class StorageManager {
    constructor() {
        const credentialsFile = fs.readFileSync('./settings/database_credentials.yaml', 'utf8');
        const credentials = YAML.safeLoad(credentialsFile);
        let dbURL = 'mongodb://' + credentials.username + ':' + credentials.password + '@ds125125.mlab.com:25125/vulcan'
        mongoose.connect(dbURL);
        mongoose.Promise = global.Promise;
        this.db = mongoose.connection;
        this.db.on('error', console.error.bind(console, 'MongoDB connection error:'));
        this.test("pas");
    }

    test(givenName) {
        let test = new Example({name: givenName, id: 0});
        test.save((err) => { if(err) console.log(err); });
    }
}

module.exports = StorageManager;