let apiDB    = require('../../functions/db.js');
const { Sequelize, Op } = require("sequelize");
const APIMISC = require('../../functions/misc');
const DBDefinitions = require('../../functions/mainDB.js');
const path     = require('path');
let hash       = require("password-hash");

module.exports = {
	response: {
		success: false,
		output: "",
		errorMessage: ""
	},
	errorResponse: (error) => {
		// Log error file
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		response.errorMessage = "Unable to process request. Please try again.";
		res.send(response);
	},

	// User Authentication
	getUserAuth: async (req , res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let checkUser = await DBDefinitions.MainDBUsers.findOne({
				where: {
					username: req.params.username,
					status: 1
				}
			});
			if(checkUser) {
				if(hash.verify(req.params.password, checkUser.password)){
					let newKey = Math.floor((Math.random() * 10000000000) + 1);
					DBDefinitions.MainDBAccountKey.update({
						secretKey: newKey
					}, {
						where : { userReference: checkUser.userUid }
					}).then(function() {
						let output= { 'username' : checkUser.username, 'key': newKey};
						response = {
							success: true,
							output: output,
							errorMessage: "" 
						}
						res.send(response);
					});
				}else{
					response = {
						success: false,
						errorMessage: "Incorrect password" 
					}
					res.send(response);
				}
			}else{
				response.success = false;
				response.errorMessage = "Incorrect username"
				res.send(response);
			}
		}catch(error){
			// APIMISC.apiErrorLog(error);
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},

	checkUserToken: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let getUser = await DBDefinitions.MainDBUsers.findOne({
				where: { username: req.params.username }
			});
			if(getUser){
				let getKey = await DBDefinitions.MainDBAccountKey.findOne({
					where: { userReference: getUser.userUid }
				});
				let output= { 'username' : getUser.username, 'key': getKey.secretKey};
				
				response = {
					success: true,
					output: output,
					errorMessage: "" 
				}
			}else{
				response = {
					success: false,
					errorMessage: "Incorrect password" 
				}
			}
			res.send(response);
		}catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},

	//User Accounts
	getUserRole: async (req , res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let getUser = await DBDefinitions.MainDBUsers.findOne({
				where: { username: req.params.username }
			});

			if(getUser) {
				let userRole = await DBDefinitions.MainDBUserRoles.findOne({
					where: { userRoleUid: getUser.userRoleReference }
				});

				response = {
					success: true,
					output: userRole.userRole,
					errorMessage: "" 
				}
				res.send(response);
			}else{
				response.success = false;
				response.errorMessage = "Incorrect username or password"
				res.send(response);
			}
		}catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getUsersPaginated: async (req , res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let searchTerm       	 	= req.params.searchTerm;
			let pageNumber  	 		= req.params.pageNumber;
			let limit        	 		= 10;
			let offset      	 		= (pageNumber - 1) * limit;
			let usersArray	 	= [];
			let usersCount 	= 0;

			if(searchTerm) {			
				usersCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM users WHERE username LIKE '%" + searchTerm + "%'", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
				usersArray = await apiDB.mainDBConnection.query("SELECT * FROM users WHERE username LIKE '%" + searchTerm + "%' ORDER BY username ASC LIMIT " + offset + "," + limit + "", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			}else{
				usersCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM users", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
				usersArray = await apiDB.mainDBConnection.query('SELECT * FROM users ORDER BY username ASC LIMIT ' + offset + ',' + limit + '', { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			}

			let output = {
				count: usersCount[0].count,
				users: usersArray
			}

			response = {
				success: true,
				output: output,
				errorMessage: "" 
			}
			res.send(response);
		}catch (error) {
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getRoles: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let userRoles = await DBDefinitions.MainDBUserRoles.findAll({
				order: [ ['user_role', 'ASC'] ],
			});
			let output = { userRoles: userRoles }

			response = {
				success: true,
				output: output,
				errorMessage: "" 
			}
			res.send(response);
		}catch(error){
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getDepartments: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let departments = await DBDefinitions.MainDBDepartments.findAll({
				order: [ ['department_name', 'ASC'] ],
			});
			let output = { departments: departments }

			response = {
				success: true,
				output: output,
				errorMessage: ""
			}
			res.send(response);
		}catch(error){
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	
	},
	newUser: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let checkUsername = await DBDefinitions.MainDBUsers.findOne({
				where: { username: req.body.username }
			});
			let checkName = await DBDefinitions.MainDBUsers.findOne({
				where: {
					firstname: req.body.firstname,
					middlename:req.body.middlename,
					lastname: req.body.lastname
				}
			});
			let checkEmail = await DBDefinitions.MainDBUsers.findOne({
				where: { emailAddress: req.body.emailAddress }
			});
			let checkContactNumber = await DBDefinitions.MainDBUsers.findOne({
				where: { contactNumber: req.body.contactNumber }
			});

			if(checkUsername) {
				response.success = false;
				response.errorMessage = "Username already exists.";
				res.send(response);
			}else if(checkName) {
				response.success = false;
				response.errorMessage = "Name already exists.";
				res.send(response);
			}else if(checkEmail) {
				response.success = false;
				response.errorMessage = "Email address already exists.";
				res.send(response);
			}else if(checkContactNumber) {
				response.success = false;
				response.errorMessage = "Contact number already exists.";
				res.send(response);
			}else{
				let getUser = await DBDefinitions.MainDBUsers.findOne({
					where: { username: req.body.createdBy }
				});
				let genId = 'aisUID-' + APIMISC.uniqID();
				DBDefinitions.MainDBUsers.create({
					userUid : genId,
					firstname: req.body.firstname,
					middlename: req.body.middlename,
					lastname: req.body.lastname,
					emailAddress: req.body.emailAddress,
					contactNumber: req.body.contactNumber,
					username: req.body.username,
					password: hash.generate(req.body.password),
					userRoleReference: req.body.userRole,
					userIDReference: getUser.userUid,
					departmentReference: req.body.department,
					status: 1,
					dateCreated: APIMISC.dateToday(),
					createdBy: req.body.createdBy,
				}).then(function() {
					response.success = true;

					DBDefinitions.MainDBAccountKey.create({
						accountKeyId: 'aisAKI-' + APIMISC.uniqID(),
						userReference: genId,
						secretKey: Math.floor((Math.random() * 10000000000) + 1),
						dateCreated: APIMISC.dateToday()
					});
					res.send(response);
				}).catch(function(error) {
					console.log(error);
					response.success = false;
					response.errorMessage = "Something went wrong. Please try again.";
					res.send(response);
				});
			}
		}catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getUser: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let user = await DBDefinitions.MainDBUsers.findOne({
				where: { userUid: req.params.userUid }
			});
			let output = { user: user }

			response = {
				success: true,
				output: output,
				errorMessage: "" 
			}
			res.send(response);
		}catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},

	updateUser: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let checkUsername = await DBDefinitions.MainDBUsers.findOne({
				where: {
					[Op.not]: [ { userUid: req.body.userUid } ],
					username: req.body.username
				}
			});
			let checkName = await DBDefinitions.MainDBUsers.findOne({
				where: {
					[Op.not]: [ { userUid: req.body.userUid } ],	
					firstname: req.body.firstname,
					middlename: req.body.middlename,
					lastname: req.body.lastname
				}
			});
			let checkEmail = await DBDefinitions.MainDBUsers.findOne({
				where: {
					[Op.not]: [{ userUid: req.body.userUid } ],	
					emailAddress: req.body.emailAddress
				}
			});
			let checkContactNumber = await DBDefinitions.MainDBUsers.findOne({
				where: {
					[Op.not]: [ { userUid: req.body.userUid } ],	
					contactNumber: req.body.contactNumber
				}
			});

			if(checkUsername) {
				response.success = false;
				response.errorMessage = "Username already exists.";
				res.send(response);
			}else if(checkName) {
				response.success = false;
				response.errorMessage = "Name already exists.";
				res.send(response);
			}else if(checkEmail) {
				response.success = false;
				response.errorMessage = "Email address already exists.";
				res.send(response);
			}else if(checkContactNumber) {
				response.success = false;
				response.errorMessage = "Contact number already exists.";
				res.send(response);
			}else{
				DBDefinitions.MainDBUsers.update({
					firstname: req.body.firstname,
					middlename: req.body.middlename,
					lastname: req.body.lastname,
					emailAddress: req.body.emailAddress,
					contactNumber: req.body.contactNumber,
					username: req.body.username,
					password: hash.generate(req.body.password),
					userRoleReference: req.body.userRole,
					departmentReference: req.body.department,
					dateModified: APIMISC.dateToday()
				},{
					where: { userUid: req.body.userUid }
				}).then(function() {
					response.success = true;
					res.send(response);
				}).catch(function(error) {
					response.errorMessage = "Unable to process request. Please try again.";
					res.send(response);
				});
			}
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	updateUserStatus: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			DBDefinitions.MainDBUsers.update({
				status: req.body.status,
				dateModified: APIMISC.dateToday()
			},{
				where: { userUid: req.body.userUid }
			}).then(function() {
				response.success = true;
				res.send(response);
			});
		} catch(error){
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getUserProfile: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let user = await DBDefinitions.MainDBUsers.findOne({
				where: { username: req.params.username }
			});
			let output = { user: user }

			response = {
				success: true,
				output: output,
				errorMessage: "" 
			}
			res.send(response);
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	updateProfile: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			DBDefinitions.MainDBUsers.update({
				firstname: req.body.firstname,
				middlename: req.body.middlename,
				lastname: req.body.lastname,
				emailAddress: req.body.emailAddress,
				contactNumber: req.body.contactNumber,
				departmentReference: req.body.department,
				dateModified: APIMISC.dateToday()
			},{
				where: { userUid: req.body.userUid }
			}).then(function() {
				response.success = true;
				res.send(response);
			}).catch(function(error) {
				console.log(error);
				response.errorMessage = "Unable to process request. Please try again.";
				res.send(response);
			});
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	changePassword: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let getUser = await DBDefinitions.MainDBUsers.findOne({
				where: {
					userUid: req.body.userUid,
					status: 1
				}
			});

			if(getUser){
				if(!hash.verify(req.body.oldPassword, getUser.password)){
					response = {
						success: false,
						errorMessage: "Wrong old password" 
					}
				}else{
					DBDefinitions.MainDBUsers.update({
						password: hash.generate(req.body.newPassword),
						dateModified: APIMISC.dateToday()
					},{
						where: { userUid: req.body.userUid }
					}).then(function() {
						response.success = true;
						res.send(response);
					}).catch(function(error) {
						console.log(error);
						response.errorMessage = "Unable to process request. Please try again.";
					});
				}
			}
			res.send(response);
		}catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	checkAdminPassword: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let getUser = await DBDefinitions.MainDBUsers.findOne({
				where: {
					username: req.body.username,
					status: 1
				}
			});

			if(getUser){
				if(!hash.verify(req.body.password, getUser.password)){
					response = {
						success: false,
						errorMessage: "Invalid password" 
					}
				}else if(hash.verify(req.body.password, getUser.password)){
					response = {
						success: true, 
					}
				}
			}else{
				response = {
					success: false,
					errorMessage: "Invalid password" 
				}
			}
			res.send(response);
		}catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
}