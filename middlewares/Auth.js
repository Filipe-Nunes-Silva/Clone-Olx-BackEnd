const {User} = require('../models/User');

class Auth {
    
    static async private(req,res,next){

        let token = req.query.token || req.body.token;
        if(!token || token == ''){
            res.json({notallowed:true});
            return;
        };
    
        const user = await User.findOne({token});
        if(!user){
            res.json({notallowed:true});
            return;
        };

        next();
    };
};


module.exports = Auth;