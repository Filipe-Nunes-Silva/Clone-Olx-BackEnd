const mongoose = require('mongoose');
const {Schema} = mongoose;

const adSchema = new Schema({
    idUser:String,
    state:String,
    category:String,
    images:[Object],
    dateCreated:Date,
    title:String,
    price:Number,
    priceNegotiable:Boolean,
    description:String,
    views:Number,
    status:String,

});

const Ad = mongoose.model('Ad',adSchema);

module.exports = {
    Ad,
};