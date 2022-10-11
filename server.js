require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const port = process.env.PORT;

//DataBase & models
const conn = require('./db/conn.js');
const Ad = require('./models/Ad');
const Category = require('./models/Category');
const State = require('./models/State');
const User = require('./models/User');
//Cors & JSON & POST
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
//FileUpload
app.use(fileUpload());
//Public
const pastaPublic = path.join(__dirname,'public');
app.use(express.static(pastaPublic));



//rotas
const rotas = require('./routes/router');
app.use(rotas);




app.listen(port,(err)=>{
    if(err){
        console.log(`Erro ao iniciar servidor = ${err}`);
        return;
    };

    console.log(`Servidor iniciado na porta ${port}`);
});