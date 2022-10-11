const mongoose = require('mongoose');
const {Schema} = mongoose;

const stateSchema = new Schema({
    name:String,
});

const State = mongoose.model('State',stateSchema);

module.exports = {
    State,
};