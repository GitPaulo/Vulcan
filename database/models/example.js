/****
 * To be continued...
*/
const mongoose = xrequire('mongoose');

let Schema = mongoose.Schema;

let exampleSchema = new Schema({
    name: String,
    id  : Number
});

module.exports = mongoose.model('Example', exampleSchema);
