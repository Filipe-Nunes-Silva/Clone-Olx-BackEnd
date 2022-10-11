const { State } = require('../models/State');
const { User } = require('../models/User');
const { Category } = require('../models/Category');
const { Ad } = require('../models/Ad');
//Mongoose
const {isValidObjectId} = require('mongoose');
//Encrypted password hash return function
const { passwordCript } = require('../controllers/AuthController');



class UserController {

    static async getStates(req, res) {
        let states = await State.find();
        res.json({
            states,
        });
    };

    static async info(req, res) {
        let token = req.query.token;
        const user = await User.findOne({ token }).lean();
        const state = await State.findById(user.state).lean();
        const ads = await Ad.find({ idUser: user._id.toString() }).lean();

        let adList = [];
        for(let i in ads){

            const category = await Category.findById(ads[i].category);
            adList.push({...ads[i],category:category.slug})
        };

        res.json({
            name:user.name,
            email:user.email,
            state:state.name,
            ads: adList,
        });
    };

    static async editAction(req, res) {
        const data = req.body;
        let updates = {};

        if(data.name){ updates.name = data.name; };
        if(data.email){ updates.email = data.email; };
        if(data.state){ updates.state = data.state; };
        if(data.password){ updates.password = await passwordCript(data.password); };

        await User.findOneAndUpdate({token:data.token},{$set: updates});
        res.json({msg:'OK'}); 
    };
};

module.exports = {
    UserController
};