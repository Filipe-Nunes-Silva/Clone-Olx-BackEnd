const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    name:String,
    email:String,
    state:String,
    passwordHash:String,
    token:String,
});

const User = mongoose.model('User',userSchema);

module.exports = {
    User,
};