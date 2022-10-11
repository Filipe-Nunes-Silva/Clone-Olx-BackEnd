const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');


class AuthController {

    static async signin(req, res) {

        //Verificando usuario
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ erros: [{msg: 'E-mail e/ou senha errados!'}] });
        };
        //Verificando senha
        const matchPassword = bcrypt.compareSync(req.body.password, user.passwordHash);
        if (!matchPassword) {
            return res.status(401).json({ erros: [{msg: 'E-mail e/ou senha errados!'}] });
        };
        //Criando novo token, salvando no usuario e retornando resposta
        user.token = await newUserToken(user);
        await user.save();
        return res.status(200).json({ token: user.token, email: user.email });
    };

    static async signup(req, res) {
        //Dados do body
        const data = req.body;
        //Criando hash de senha
        const passwordHash = await passwordCript(data.password);
        //Criando usuario com model
        const newUser = new User({
            name:data.name,
            email:data.email,
            passwordHash,
            state:data.state,
        });
        //Inserindo Token no usuario
        newUser.token = await newUserToken(newUser);
        //Salvando usuario no Db
        await newUser.save();
        //Respondendo ao usuario
        res.status(201).json({token:newUser.token});
    };
};


const passwordCript = async (value)=>{
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(value,salt);
    return hashedPassword;
};

const newUserToken = async (data)=>{
    const token = jwt.sign({
        name:data.name,
        id:data._id.toString()
    },'SecretOlx');
    console.log(token);//Retirar
    console.log('Token Criado');
    return token;
};

module.exports = {
    AuthController,
    passwordCript,
};