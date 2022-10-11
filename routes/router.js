const express = require('express');
const router = express.Router();

//Controllers
const { AuthController } = require('../controllers/AuthController');
const { UserController } = require('../controllers/UserController');
const { AdsController } = require('../controllers/AdsController');

//Middlewares
const Auth = require('../middlewares/Auth');
//Validations
const { validate } = require('../middlewares/validations/handleValidation');
const { signupValidation } = require('../middlewares/validations/signupValidation');
const { signinValidation } = require('../middlewares/validations/signinValidation');
const { userEditionValidation } = require('../middlewares/validations/userEditionValidation');


router.get('/ping', (req, res) => {
    res.json({ pong: true });
});


//Auth
router.post('/user/signin', signinValidation(), validate, AuthController.signin);//ok
router.post('/user/signup', signupValidation(), validate, AuthController.signup);//ok

//User
router.get('/states', /*Auth.private*/ UserController.getStates);//ok
router.get('/user/me', Auth.private, UserController.info);//ok
router.put('/user/me', userEditionValidation(), validate, Auth.private, UserController.editAction);//ok

//Ads
router.get('/categories', AdsController.getCategories);//ok
router.post('/ad/add', Auth.private, AdsController.addAction);//ok
router.get('/ad/list', AdsController.getList);//ok
router.get('/ad/item', AdsController.getItem);//ok
router.post('/ad/:id', Auth.private, AdsController.editAction);//ok

module.exports = router;