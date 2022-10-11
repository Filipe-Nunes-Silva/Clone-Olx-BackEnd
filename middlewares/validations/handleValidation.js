const { validationResult } = require('express-validator');

function validate(req,res,next){
    const erros = validationResult(req);
    if(erros.isEmpty()){
        return next();
    }
    else{
        return res.status(422).json({erros:erros.array()})
    };
};

module.exports = {
    validate
};