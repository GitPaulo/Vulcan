const mongoose = require('mongoose');
const YAML     = require('js-yaml');
const fs       = require('fs');
const gif  = require('../structures/database/models/gif')

class StorageManager {
    constructor(vulcan) {
        this.vulcan = vulcan;

        const credentialsFile = fs.readFileSync('./settings/database_credentials.yaml', 'utf8');
        const credentials     = YAML.safeLoad(credentialsFile);
        
        let dbURL = 'mongodb://' + credentials.username + ':' + credentials.password + '@ds125125.mlab.com:25125/vulcan'
        mongoose.connect(dbURL);
        mongoose.Promise = global.Promise;
        
        this.db = mongoose.connection;
        this.db.on('error', console.error.bind(console, 'MongoDB connection error:'));
        this.test("https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif");
    }

    test(link) {
        let test = new gif({name: "cat", link: link, owner: 1});
        test.save((err) => { if(err) vulcan.logger.error(err); });
    }
}

module.exports = StorageManager;