const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let exampleSchema = new Schema({
    name: String,
    id: Number
});

module.exports = mongoose.model('Example', exampleSchema)