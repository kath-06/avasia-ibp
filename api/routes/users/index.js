let router = require('express').Router();
let controller = require('./user.controller');

global.moment  = require('moment');
global.multer  = require('multer');
global.storage = multer.diskStorage({
	destination: '../src/assets/files',
	filename(req , file , cb) {
		if(req.file){
			cb(null , file.originalname, true);
		}
	} 
});
global.upload = multer({ dest:'../src/assets/files' });

// Users Authentication
router.get('/account/login/:username/:password?' , controller.getUserAuth);
router.get('/role/:username?' , controller.getUserRole);
router.get('/check/account/token/:username?', controller.checkUserToken);
//User Account
router.get('/roles' , controller.getRoles);
router.get('/get/accounts/:pageNumber/:searchTerm?' , controller.getUsersPaginated);
router.get('/get/departments', controller.getDepartments);
router.post('/add/new', controller.newUser);
router.get('/get/account/:userUid?', controller.getUser);
router.post('/update', controller.updateUser);
router.post('/update/status', controller.updateUserStatus);
//User Profile
router.get('/get/user/profile/:username?', controller.getUserProfile);
router.post('/update/profile', controller.updateProfile);
router.post('/change/password', controller.changePassword);
//Bank Recons
router.post('/check/password', controller.checkAdminPassword);

module.exports = router;