const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let gifSchema = new Schema({
    name: String,
    link: String,
    owner: Number
});

module.exports = mongoose.model('gifs', gifSchema)