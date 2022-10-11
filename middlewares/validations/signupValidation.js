const { body } = require('express-validator');
//Models
const { User } = require('../../models/User');
const { State } = require('../../models/State');
//Mongoose
const {isValidObjectId} = require('mongoose');

function signupValidation() {
    return [
        body('name')
            .trim()
            .isLength({ min: 2 })
            .withMessage('Nome precisa ter no minimo 2 caracteres!'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Insira um email valido!'),
        body('email')
            .custom(async (value) => {
                const user = await User.findOne({ email: value });
                if (user) {
                    return Promise.reject('Email já cadastrado!');
                };
                return true;
            }),
        body('password')
            .isLength({ min: 2 })
            .withMessage('Senha precisa ter no minimo 2 caracteres!'),
        body('state')
            .notEmpty()
            .withMessage('Estado não preenchido!'),
        body('state')
            .custom(async (value) => {
                if(isValidObjectId(value)){
                    const state = await State.findById(value);
                    if(state){
                        return true;
                    };
                };
               return Promise.reject('Estado não encontrado na lista!');
            }),
    ];
};

module.exports = {
    signupValidation
};