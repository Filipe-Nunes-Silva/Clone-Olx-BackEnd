require('dotenv').config();
const mongoose = require('mongoose');
const mongoUrl = process.env.DB;

const conn = async ()=>{
    await mongoose.connect(mongoUrl);
    console.log(`Conectado a database`);
};

conn().catch((err)=>{
    console.log(`Erro ao conectar = ${err}`);
});

module.exports = mongoose;