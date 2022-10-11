const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
//Models
const { User } = require('../../models/User');


function signinValidation(){
    return[
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Insira um email valido!'),
        body('password')
            .isLength({ min: 2 })
            .withMessage('Senha precisa ter no minimo 2 caracteres!'),
    ];
    
};

module.exports = {
    signinValidation,
};