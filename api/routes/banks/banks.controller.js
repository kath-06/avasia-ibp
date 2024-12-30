let apiDB    = require('../../functions/db.js');
const { Sequelize, Op } = require("sequelize");
const APIMISC = require('../../functions/misc');
const DBDefinitions = require('../../functions/mainDB.js');
const path     = require('path');

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
	// Banks
	getBanksPaginated: async (req , res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let searchTerm       	 	= req.params.searchTerm;
			let pageNumber  	 		= req.params.pageNumber;
			let limit        	 		= 10;
			let offset      	 		= (pageNumber - 1) * limit;
			let banksArray	 	= [];
			let banksCount 	= 0;

			if(searchTerm) {			
				banksCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM banks WHERE bank LIKE '%" + searchTerm + "%'", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
				banksArray = await apiDB.mainDBConnection.query("SELECT * FROM banks WHERE bank LIKE '%" + searchTerm + "%' ORDER BY bank ASC LIMIT " + offset + "," + limit + "", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			}else{
				banksCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM banks", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
				banksArray = await apiDB.mainDBConnection.query('SELECT * FROM banks ORDER BY bank ASC LIMIT ' + offset + ',' + limit + '', { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			}
			let output = {
				count: banksCount[0].count,
				banks: banksArray
			}

			response = {
				success: true,
				output: output,
				errorMessage: "" 
			}
			res.send(response);
		}catch (error) {
			// APIMISC.sendErrorResponse(error, res);
			// APIMISC.apiErrorLog(error);
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getBanks: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let banks = await DBDefinitions.MainDBBanks.findAll({
				order: [
		            ['bank', 'ASC']
		        ],
			});
			let output = { banks: banks }

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
	newBank: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let checkBank = await DBDefinitions.MainDBBanks.findOne({
				where: { bank: req.body.bank }
			});

			if(checkBank) {
				response.success = false;
				response.errorMessage = "Bank exists."
				res.send(response);
			}else{
				let getUser = await DBDefinitions.MainDBUsers.findOne({
					where: { username: req.body.createdBy }
				});

				DBDefinitions.MainDBBanks.create({
					bankUid : 'aisBank-' + APIMISC.uniqID(),
					bank: req.body.bank,
					status: 1,
					userIdReference: getUser.userUid,
					dateCreated: APIMISC.dateToday(),
					createdBy: req.body.createdBy,
				}).then(function() {
					response.success = true;
					res.send(response);
				}).catch(function(error) {
					response.success = false;
					response.errorMessage = "Something went wrong. Please try again.";
					res.send(response);
				});
			}
		}catch(error){
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	updateBank: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let checkBank = await DBDefinitions.MainDBBanks.findOne({
				where: {
					[Op.not]: [ { bankUid: req.body.bankUid } ],	
					bank: req.body.bank,
					status: 1
				}
			});

			if(checkBank) {
				response.errorMessage = "Bank exists."
				res.send(response);
			}else{
				DBDefinitions.MainDBBanks.update({
					bank: req.body.bank,
					dateModified: APIMISC.dateToday()
				},{
					where: { bankUid: req.body.bankUid }
				}).then(function() {
					response.success = true;
					res.send(response);
				}).catch(function(error) {
					response.errorMessage = "Unable to process request. Please try again.";
					res.send(response);
				});
			}
		} catch(error){
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	updateBankStatus: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			DBDefinitions.MainDBBanks.update({
				status: req.body.status,
				dateModified: APIMISC.dateToday()
			},{
				where: { bankUid: req.body.bankUid }
			}).then(function() {
				response.success = true;
				res.send(response);
			});
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getActivateBanks: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let banks = await DBDefinitions.MainDBBanks.findAll({
				where: { status: 1 },
				order: [ ['bank', 'ASC'] ],
			});
			let output = { banks: banks }

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
	// Bank Accounts
	getBankAccountsPaginated: async (req , res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let searchTerm       	 	= req.params.searchTerm;
			let pageNumber  	 		= req.params.pageNumber;
			let limit        	 		= 10;
			let offset      	 		= (pageNumber - 1) * limit;
			let bankAccountsArray	 	= [];
			let bankAccountsCount 	= 0;

			if(searchTerm) {			
				bankAccountsCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_accounts WHERE bank_account_name LIKE '%" + searchTerm + "%'", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
				bankAccountsArray = await apiDB.mainDBConnection.query("SELECT * FROM bank_accounts WHERE bank_account_name LIKE '%" + searchTerm + "%' ORDER BY bank_account_name ASC LIMIT " + offset + "," + limit + "", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			}else{
				bankAccountsCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_accounts", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
				bankAccountsArray = await apiDB.mainDBConnection.query('SELECT * FROM bank_accounts ORDER BY bank_account_name ASC LIMIT ' + offset + ',' + limit + '', { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			}
			let output = {
				count: bankAccountsCount[0].count,
				bankAccounts: bankAccountsArray
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
	newBankAccount: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let checkBankAccount = await DBDefinitions.MainDBBankAccounts.findOne({
				where: {
					bankAccountName: req.body.bankAccountName,
					bankAccountNumber: req.body.bankAccountNumber
				}
			});

			if(checkBankAccount) {
				response.success = false;
				response.errorMessage = "Bank Account exists."
				res.send(response);
			}else{
				let getUser = await DBDefinitions.MainDBUsers.findOne({
					where: { username: req.body.createdBy }
				});

				DBDefinitions.MainDBBankAccounts.create({
					bankAccountUid : 'aisBankAcc-' + APIMISC.uniqID(),
					bankAccountName: req.body.bankAccountName,
					bankAccountNumber: req.body.bankAccountNumber,
					bankAccountDate: req.body.bankAccountDate,
					bankReference: req.body.bank,
					status: 1,
					userIdReference: getUser.userUid,
					dateCreated: APIMISC.dateToday(),
					createdBy: req.body.createdBy,
				}).then(function() {
					response.success = true;
					res.send(response);
				}).catch(function(error) {
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
	updateBankAccount: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let checkBankAccount = await DBDefinitions.MainDBBankAccounts.findOne({
				where: {
					[Op.not]: [ { bankAccountUid: req.body.bankAccountUid } ],	
					bankAccountName: req.body.bankAccountName,
					bankAccountNumber: req.body.bankAccountNumber,
					status: 1
				}
			});

			if(checkBankAccount) {
				response.errorMessage = "Bank Account exists."
				res.send(response);
			}else{
				DBDefinitions.MainDBBankAccounts.update({
					bankAccountName: req.body.bankAccountName,
					bankAccountNumber: req.body.bankAccountNumber,
					bankAccountDate: req.body.bankAccountCreated,
					bankReference: req.body.bank,
					dateModified: APIMISC.dateToday()
				},{
					where: { bankAccountUid: req.body.bankAccountUid }
				}).then(function() {
					response.success = true;
					res.send(response);
				}).catch(function(error) {
					response.errorMessage = "Unable to process request. Please try again.";
					res.send(response);
				});
			}
		} catch(error){
			APIMISC.apiErrorLog(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	updateBankAccountStatus: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			DBDefinitions.MainDBBankAccounts.update({
				status: req.body.status,
				dateModified: APIMISC.dateToday()
			},{
				where: { bankAccountUid: req.body.bankAccountUid }
			}).then(function() {
				response.success = true;
				res.send(response);
			});
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getBankAccounts: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let bankAccounts = await DBDefinitions.MainDBBankAccounts.findAll({
				order: [ ['bank_account_name', 'ASC'] ],
			});
			let output = { bankAccounts: bankAccounts }

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
	getActivateBankAccounts: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let bankAccounts = await DBDefinitions.MainDBBankAccounts.findAll({
				where: {
					status: 1,
					bankReference: req.params.bank
				},
				order: [ ['bank_account_name', 'ASC'] ],
			});
			let output = { bankAccounts: bankAccounts }

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

	// Bank Check Series
	getChecksSeriesPaginated: async (req , res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let searchTerm       	 	= req.params.searchTerm;
			let pageNumber  	 		= req.params.pageNumber;
			let limit        	 		= 10;
			let offset      	 		= (pageNumber - 1) * limit;
			let checkSeriesArray	 	= [];
			let checkSeriesCount 	= 0;

			if(searchTerm) {			
				checkSeriesCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_check_series WHERE bank_check_series LIKE '%" + searchTerm + "%'", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
				checkSeriesArray = await apiDB.mainDBConnection.query("SELECT * FROM bank_check_series WHERE bank_check_series LIKE '%" + searchTerm + "%' ORDER BY date_created DESC LIMIT " + offset + "," + limit + "", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			}else{
				checkSeriesCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_check_series", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
				checkSeriesArray = await apiDB.mainDBConnection.query('SELECT * FROM bank_check_series ORDER BY date_created DESC LIMIT ' + offset + ',' + limit + '', { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			}

			let output = {
				count: checkSeriesCount[0].count,
				checkSeries: checkSeriesArray
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
	newCheckSeries: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let checkCheckSeries = await DBDefinitions.MainDBBankCheckSeries.findOne({
				where: {
					bankCheckSeries: req.body.bankCheckSeries + '00',
					bankCheckSeriesDate: req.body.bankCheckSeriesDate,
					bankReference: req.body.bank
				}
			});

			if(checkCheckSeries) {
				response.success = false;
				response.errorMessage = "Check Series exists."
				res.send(response);
			}else{
				let seriesDate = new Date(req.body.bankCheckSeriesDate);
				let getUser = await DBDefinitions.MainDBUsers.findOne({
					where: { username: req.body.createdBy }
				});
				let seriesId = 'aisBCS-' + APIMISC.uniqID();

				DBDefinitions.MainDBBankCheckSeries.create({
					bankCheckSeriesUid : seriesId,
					bankCheckSeries: req.body.bankCheckSeries + '00' + '-' + seriesDate.getDate() + '' + (seriesDate.getMonth() + 1) + '' + seriesDate.getFullYear(),
					bankCheckSeriesDate: req.body.bankCheckSeriesDate,
					bankReference: req.body.bank,
					bankAccountReference: req.body.bankAccount,
					status: 1,
					userIdReference: getUser.userUid,
					dateCreated: APIMISC.dateToday(),
					createdBy: req.body.createdBy,
				}).then(function() {
					response.success = true;
					let checkNumber = parseInt(req.body.bankCheckSeries + '00');
					let stat = "current";
					for(var i = 1; i <= 99; i++){
						checkNumber = checkNumber + 1;
						if(i > 1){
							stat = "unused";
						}
						DBDefinitions.MainDBBankCheckSeriesReports.create({
							checkReportId: 'aisBCR-' + APIMISC.uniqID(),
							checkNumber: checkNumber,
							status: stat,
							checkSeriesReference: seriesId,
							bankAccountReference: req.body.bankAccount,
							bankReference: req.body.bank,
							userReference: getUser.userUid,
							dateCreated: APIMISC.dateToday()
						});
					}
					res.send(response);
				}).catch(function(error) {
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
	updateCheckSeries: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let checkCheckSeries = await DBDefinitions.MainDBBankCheckSeries.findOne({
				where: {
					[Op.not]: [ { bankCheckSeriesUid: req.body.checkSeriesUid } ],	
					bankCheckSeries: req.body.bankCheckSeries,
					bankCheckSeriesDate: req.body.bankCheckSeriesDate,
					bankReference: req.body.bank
				}
			});

			if(checkCheckSeries) {
				response.success = false;
				response.errorMessage = "Check Series exists."
				res.send(response);
			}else{
				DBDefinitions.MainDBBankCheckSeries.update({
					bankCheckSeries: req.body.bankCheckSeries,
					bankCheckSeriesDate: req.body.bankCheckSeriesDate,
					bankReference: req.body.bank,
					bankAccountReference: req.body.bankAccount,
					dateModified: APIMISC.dateToday()
				},{
					where: { bankCheckSeriesUid: req.body.checkSeriesUid }
				}).then(function() {
					response.success = true;
					res.send(response);
				}).catch(function(error) {
					console.log(error);
					response.errorMessage = "Unable to process request. Please try again.";
					res.send(response);
				});
			}
		} catch(error){
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getCheckSeries: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let checkSeries = await DBDefinitions.MainDBBankCheckSeries.findAll({
				where: {
					bankReference: req.params.bank,
					bankAccountReference: req.params.bankAccount,
					status: 1
				},
				order: [ ['bank_check_series_date', 'ASC'] ],
			});
			let output = { checkSeries: checkSeries }
			
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
	getCheckNumber: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let getCheckNumber = await DBDefinitions.MainDBBankCheckSeriesReports.findAll({
				where: { 
					checkSeriesReference: req.params.series,
					status: req.params.status
				},
				order: [ ['check_number', 'ASC'] ],
			});

			
			let output = { checkNumbers: getCheckNumber }

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

	//Departments
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

	// Suppliers
	getSuppliers: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let suppliers = await DBDefinitions.MainDBSuppliers.findAll({
				order: [ ['supplier', 'ASC'] ],
			});
			let output = { suppliers: suppliers }

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
	getSuppliersPaginated: async (req , res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let searchTerm       	 	= req.params.searchTerm;
			let pageNumber  	 		= req.params.pageNumber;
			let limit        	 		= 10;
			let offset      	 		= (pageNumber - 1) * limit;
			let suppliersArray	 	= [];
			let suppliersCount 	= 0;

			if(searchTerm) {			
				suppliersCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM suppliers WHERE supplier LIKE '%" + searchTerm + "%'", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
				suppliersArray = await apiDB.mainDBConnection.query("SELECT * FROM suppliers WHERE supplier LIKE '%" + searchTerm + "%' ORDER BY supplier DESC LIMIT " + offset + "," + limit + "", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			}else{
				suppliersCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM suppliers", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
				suppliersArray = await apiDB.mainDBConnection.query('SELECT * FROM suppliers ORDER BY supplier DESC LIMIT ' + offset + ',' + limit + '', { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			}

			let output = {
				count: suppliersCount[0].count,
				suppliers: suppliersArray
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
	newSupplier: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let checkSupplier = await DBDefinitions.MainDBSuppliers.findOne({
				where: { supplier: req.body.payee }
			});

			if(checkSupplier) {
				response.success = false;
				response.errorMessage = "Payee exists."
				res.send(response);
			}else{
				let getUser = await DBDefinitions.MainDBUsers.findOne({
					where: { username: req.body.createdBy }
				});

				DBDefinitions.MainDBSuppliers.create({
					supplierId : 'CSID-' + APIMISC.uniqID(),
					supplier: req.body.payee,
					status: 1,
					userIdReference: getUser.userUid,
					dateCreated: APIMISC.dateToday(),
					createdBy: req.body.createdBy,
				}).then(function() {
					response.success = true;
					res.send(response);
				}).catch(function(error) {
					response.success = false;
					response.errorMessage = "Something went wrong. Please try again.";
					res.send(response);
				});
			}
		}catch(error){
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	updateSupplier: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let checkSupplier = await DBDefinitions.MainDBSuppliers.findOne({
				where: {
					[Op.not]: [ { supplierId: req.body.supplierId } ],	
					supplier: req.body.supplier
				}
			});

			if(checkSupplier) {
				response.errorMessage = "Supplier exists."
				res.send(response);
			}else{
				DBDefinitions.MainDBSuppliers.update({
					supplier: req.body.supplier,
					dateModified: APIMISC.dateToday()
				},{
					where: { supplierId: req.body.supplierId }
				}).then(function() {
					response.success = true;
					res.send(response);
				}).catch(function(error) {
					response.errorMessage = "Unable to process request. Please try again.";
					res.send(response);
				});
			}
		} catch(error){
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},

	// Bank Checks
	getBankChecksPaginated: async (req , res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let searchTerm       	 	= req.params.searchTerm;
			let pageNumber  	 		= req.params.pageNumber;
			let limit        	 		= 10;
			let offset      	 		= (pageNumber - 1) * limit;
			let bankChecksArray	 	= [];
			let bankChecksCount 	= 0;

			if(searchTerm) {			
				bankChecksCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_checks WHERE bank_check_number LIKE '%" + searchTerm + "%'", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
				bankChecksArray = await apiDB.mainDBConnection.query("SELECT * FROM bank_checks WHERE bank_check_number LIKE '%" + searchTerm + "%' ORDER BY date_created DESC LIMIT " + offset + "," + limit + "", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			}else{
				bankChecksCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_checks", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
				bankChecksArray = await apiDB.mainDBConnection.query('SELECT * FROM bank_checks ORDER BY date_created DESC LIMIT ' + offset + ',' + limit + '', { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			}

			let output = {
				count: bankChecksCount[0].count,
				bankChecks: bankChecksArray
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
	newCheck: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let checkChecks = await DBDefinitions.MainDBBankChecks.findOne({
				where: {
					bankCheckNumber: req.body.checkNumber,
					bankCheckSeriesReference: req.body.checkSeries,
					bankReference: req.body.bank,
					bankAccountReference: req.body.bankAccount,
				}
			});


			if(checkChecks) {
				response.success = false;
				response.errorMessage = "Check exists."
				res.send(response);
			}else{
				let series = await DBDefinitions.MainDBBankCheckSeries.findOne({
					where: {
						bankCheckSeriesUid: req.body.checkSeries,
						status: 1
					}
				});
				
				let voucherSeries = await DBDefinitions.MainDBBankChecks.findOne({
					order: [ ['voucher_date', 'DESC'] ],
			        limit: 1
				});
				let lastSeries = parseInt(series.bankCheckSeries) + 99;
				let lastVoucher = '';
				let getUser = await DBDefinitions.MainDBUsers.findOne({
					where: { username: req.body.createdBy }
				});
				let departmentSeries = await DBDefinitions.MainDBDepartments.findOne({
					where: { departmentUid: req.body.department }
				});
				let genVoucherNo = new Date();
				let addZero = require('add-zero');
				let cType = "postdated";

				if(voucherSeries){
					lastVoucher = addZero(parseInt(voucherSeries.voucherNumber.slice(7)) + 1, 5);
				}else{
					lastVoucher = '00001';
				}

				if(moment(req.body.checkDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')){
					cType = "dated";
				}

				let checkRef = 'aisBC-' + APIMISC.uniqID();
				DBDefinitions.MainDBBankChecks.create({
					bankCheckUid : checkRef,
					bankCheckNumber: req.body.checkNumber,
					bankCheckDate: req.body.checkDate,
					bankCheckAmount: req.body.checkAmount,
					checkType: cType,
					voucherNumber: addZero(genVoucherNo.getMonth() + 1) + '' + (genVoucherNo.getFullYear().toString()).slice(2,4) + '-' + departmentSeries.seriesCode + '' + lastVoucher,
					voucherDate: genVoucherNo, 
					departmentReference: req.body.department,
					payeeReference: req.body.checkPayee,
					description: req.body.checkDesc,
					bankReference: req.body.bank,
					bankAccountReference: req.body.bankAccount,
					bankCheckSeriesReference: req.body.checkSeries,
					status: 1,
					userIdReference: getUser.userUid,
					dateCreated: APIMISC.dateToday(),
					createdBy: req.body.createdBy,
				}).then(function() {
					if(lastSeries == req.body.checkNumber){
						DBDefinitions.MainDBBankCheckSeries.update({
							status: 0,
							dateModified: APIMISC.dateToday()
						},{
							where: { bankCheckSeriesUid: req.body.checkSeries }
						});
					}
					for(var a = 0; a < req.body.particulars.length; a++){
						DBDefinitions.MainDBBankCheckParticulars.create({
							bankCheckParticularsUid : 'aisBCP-' + APIMISC.uniqID(),
							particular: req.body.particulars[a].particular,
							referenceNumber: req.body.particulars[a].referenceNumber,
							unitPrice: req.body.particulars[a].unitPrice,
							particularAmount: req.body.particulars[a].particularAmount,
							quantity: req.body.particulars[a].quantity,
							bankCheckReference: checkRef,
							userIdReference: getUser.userUid,
							status: 1,
							dateCreated: APIMISC.dateToday(),
							createdBy: req.body.createdBy,
						});
					}

					let checkStatus = DBDefinitions.MainDBBankCheckSeriesReports.findOne({
						where: {
							checkSeriesReference: req.body.checkSeries,
							checkNumber: req.body.checkNumber
						}
					});
					DBDefinitions.MainDBBankCheckSeriesReports.update({
						checkReference: checkRef,
						status: 'used',
						dateModified: APIMISC.dateToday(),
					},{
						where: {
							checkSeriesReference: req.body.checkSeries,
							checkNumber: req.body.checkNumber
						}
					});
					if(checkStatus.status == "current"){
						let cNumber = parseInt(req.body.checkNumber) + 1;

						DBDefinitions.MainDBBankCheckSeriesReports.update({
							status: 'current',
							dateModified: APIMISC.dateToday(),
						}, {
							where: {
								checkSeriesReference: req.body.checkSeries,
								checkNumber: cNumber
							}
						});
					}
					response.success = true;
					response.checkID = checkRef;
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
	statusCheckNumber: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			DBDefinitions.MainDBBankCheckSeriesReports.update({
				status: req.body.status,
				dateModified: APIMISC.dateToday(),
			},{
				where: {
					checkSeriesReference: req.body.checkSeries,
					checkNumber: req.body.checkNumber
				}
			});

			let cNumber = parseInt(req.body.checkNumber) + 1;

			DBDefinitions.MainDBBankCheckSeriesReports.update({
				status: 'current',
				dateModified: APIMISC.dateToday(),
			}, {
				where: {
					checkSeriesReference: req.body.checkSeries,
					checkNumber: cNumber
				}
			});
			response.success = true;
			res.send(response);
		}catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getCheckSeriesRecords: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let checkSeries = await DBDefinitions.MainDBBankCheckSeriesReports.findAll({
				where: { checkSeriesReference: req.params.checkSeries },
				order: [ ['check_number', 'ASC'] ],
			});

			let output = { checkSeries: checkSeries }

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
	getCheck: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let check = await DBDefinitions.MainDBBankChecks.findOne({
				where: { bankCheckUid: req.params.checkID }
			});
			let output = { check: check }

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
	updateCheck: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			// let checkCheck = await DBDefinitions.MainDBBankChecks.findOne({
			// 	where: {
			// 		[Op.not]: [ { bankCheckUid: req.body.checkUid } ],	
			// 		bankCheckNumber: req.body.checkNumber,
			// 		bankCheckSeriesReference: req.body.checkSeries,
			// 		bankReference: req.body.bank,
			// 		bankAccountReference: req.body.bankAccount
			// 	}
			// });

			// if(checkCheck) {
			// 	response.success = false;
			// 	response.errorMessage = "Check exists."
			// 	res.send(response);
			// }else{
				// let departmentSeries = await DBDefinitions.MainDBDepartments.findOne({
				// 	where: { departmentUid: req.body.department }
				// });
				// let check = await DBDefinitions.MainDBBankChecks.findOne({
				// 	where: { bankCheckUid: req.body.checkUid }
				// });
				// let genVoucherNo = new Date();
				// let addZero = require('add-zero');
				// let last = check.voucherNumber.slice(7); 

				DBDefinitions.MainDBBankChecks.update({
					description: req.body.checkDesc,
					dateModified: APIMISC.dateToday()
				},{
					where: { bankCheckUid: req.body.checkId }
				}).then(function() {
					response.success = true;
					res.send(response);
				}).catch(function(error) {
					console.log(error);
					response.errorMessage = "Unable to process request. Please try again.";
					res.send(response);
				});
			// }
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getCheckRecords: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let checks = await DBDefinitions.MainDBBankChecks.findAll({
				where: { bankCheckSeriesReference: req.params.checkSeries },
				order: [ ['bank_check_number', 'ASC'] ],
			});
			let output = { checks: checks }

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
	getCheckCount: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let bankChecksCount 	= 0;
			let postdatedCheckCount = 0;
			let datedCheckCount = 0;

			bankChecksCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_checks", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );

			let output = { count: bankChecksCount[0].count }

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
	getClearingCheckCount: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;
		let moment = require('moment');
		let getDate = moment().add(6, 'days').toDate();

		try {
			let postdatedCheckCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_checks WHERE check_type = 'postdated' AND bank_check_date BETWEEN '" + moment().format('YYYY-MM-DD') + "' AND '" + moment(getDate).format('YYYY-MM-DD') + "' ORDER BY bank_check_date ", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );

			if(postdatedCheckCount) {
				let checkAmount = 0;

				DBDefinitions.MainDBBankChecks.sum('bank_check_amount', { 
					where: { 
						bankCheckDate: {
							[Op.between]: [ moment().format('YYYY-MM-DD'), moment(getDate).format('YYYY-MM-DD')]
						} 
					}
				}).then(sum => {
					checkAmount = sum;
					let output = {
						count: postdatedCheckCount[0].count,
						amount: checkAmount
					}

					response = {
						success: true,
						output: output,
						errorMessage: "" 
					}
					res.send(response);
				});
			}else{
				response.success = false;
				response.errorMessage = "No clearing check."
				res.send(response);
			}
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getPostdatedCheckCount: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;
		let moment = require('moment');
		let getDate = moment().add(6, 'days').toDate();

		try {
			let postdatedCheckCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_checks WHERE check_type = 'postdated' AND bank_check_date > '" + moment(getDate).format('YYYY-MM-DD') + "' ORDER BY bank_check_date ", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );

			if(postdatedCheckCount) {
				let checkAmount = 0;

				DBDefinitions.MainDBBankChecks.sum('bank_check_amount', { 
					where: { 
						bankCheckDate: {
							[Op.gte]: moment(getDate).format('YYYY-MM-DD')
						} 
					}
				}).then(sum => {
					checkAmount = sum;
					let output = {
						count: postdatedCheckCount[0].count,
						amount: checkAmount
					}

					response = {
						success: true,
						output: output,
						errorMessage: "" 
					}
					res.send(response);
				});
			}else{
				response.success = false;
				response.errorMessage = "No postdated check."
				res.send(response);
			}
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getClearedCheckCount: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;
		let moment = require('moment');

		try {
			let clearedCheckCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_checks WHERE check_type = 'postdated' AND bank_check_date < '" + moment().format('YYYY-MM-DD') + "' ORDER BY bank_check_date ", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );

			if(clearedCheckCount) {
				let checkAmount = 0;

				DBDefinitions.MainDBBankChecks.sum('bank_check_amount', { 
					where: { 
						bankCheckDate: {
							[Op.lte]: moment().format('YYYY-MM-DD')
						} 
					}
				}).then(sum => {
					checkAmount = sum;
					let output = {
						count: clearedCheckCount[0].count,
						amount: checkAmount
					}

					response = {
						success: true,
						output: output,
						errorMessage: "" 
					}
					res.send(response);
				});
			}else{
				response.success = false;
				response.errorMessage = "No cleared check."
				res.send(response);
			}
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getClearingCheck: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;
		let moment = require('moment');
		let getDate = moment().add(6, 'days').toDate();

		try {
			let pageNumber  	 		= req.params.pageNumber;
			let limit        	 		= 10;
			let offset      	 		= (pageNumber - 1) * limit;
			let postdatedCheck = await apiDB.mainDBConnection.query("SELECT * FROM bank_checks WHERE check_type = 'postdated' AND bank_check_date BETWEEN '" + moment().format('YYYY-MM-DD') + "' AND '" + moment(getDate).format('YYYY-MM-DD') + "' ORDER BY bank_check_date LIMIT " + offset + ',' + limit, { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			let postdatedCheckCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_checks WHERE check_type = 'postdated' AND bank_check_date BETWEEN '" + moment().format('YYYY-MM-DD') + "' AND '" + moment(getDate).format('YYYY-MM-DD') + "' ORDER BY bank_check_date ", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );

			if(postdatedCheck) {
				let output = {
					count: postdatedCheckCount[0].count,
					clearingChecks: postdatedCheck
				}

				response = {
					success: true,
					output: output,
					errorMessage: "" 
				}
				res.send(response);
			}else{
				response.success = false;
				response.errorMessage = "No clearing check."
				res.send(response);
			}
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getPostdatedCheck: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;
		let moment = require('moment');
		let getDate = moment().add(6, 'days').toDate();

		try {
			let pageNumber  	 		= req.params.pageNumber;
			let limit        	 		= 10;
			let offset      	 		= (pageNumber - 1) * limit;
			let postdatedCheck = await apiDB.mainDBConnection.query("SELECT * FROM bank_checks WHERE check_type = 'postdated' AND bank_check_date > '" + moment(getDate).format('YYYY-MM-DD') + "' ORDER BY bank_check_date LIMIT " + offset + ',' + limit, { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			let postdatedCheckCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_checks WHERE check_type = 'postdated' AND bank_check_date > '" + moment(getDate).format('YYYY-MM-DD') + "' ORDER BY bank_check_date ", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );

			if(postdatedCheck) {
				let output = {
					count: postdatedCheckCount[0].count,
					postdatedChecks: postdatedCheck
				}

				response = {
					success: true,
					output: output,
					errorMessage: "" 
				}
				res.send(response);
			}else{
				response.success = false;
				response.errorMessage = "No postdated check."
				res.send(response);
			}
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getClearedCheck: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;
		let moment = require('moment');

		try {
			let pageNumber  	 		= req.params.pageNumber;
			let limit        	 		= 10;
			let offset      	 		= (pageNumber - 1) * limit;
			let clearedCheck = await apiDB.mainDBConnection.query("SELECT * FROM bank_checks WHERE check_type = 'postdated' AND bank_check_date < '" + moment().format('YYYY-MM-DD') + "'ORDER BY bank_check_date LIMIT " + offset + ',' + limit, { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			let clearedCheckCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_checks WHERE check_type = 'postdated' AND bank_check_date < '" + moment().format('YYYY-MM-DD') + "' ORDER BY bank_check_date ", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );

			if(clearedCheck) {
				let output = {
					count: clearedCheckCount[0].count,
					clearedChecks: clearedCheck
				}

				response = {
					success: true,
					output: output,
					errorMessage: "" 
				}
				res.send(response);
			}else{
				response.success = false;
				response.errorMessage = "No cleared check."
				res.send(response);
			}
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getChartData: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;
		let year = new Date().getFullYear();

		try {
			let output = { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0}

			output.jan = await DBDefinitions.MainDBBankChecks.count({ 
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), '01')},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					]
				}
			});
			output.feb = await DBDefinitions.MainDBBankChecks.count({ 
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), '02')},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					]
				}
			});
			output.mar = await DBDefinitions.MainDBBankChecks.count({ 
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), '03')},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					]
				}
			});
			output.apr = await DBDefinitions.MainDBBankChecks.count({ 
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), '04')},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					]
				}
			});
			output.may = await DBDefinitions.MainDBBankChecks.count({ 
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), '05')},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					]
				}
			});
			output.jun = await DBDefinitions.MainDBBankChecks.count({ 
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), '06')},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					]
				}
			});
			output.jul = await DBDefinitions.MainDBBankChecks.count({ 
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), '07')},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					]
				}
			});
			output.aug = await DBDefinitions.MainDBBankChecks.count({ 
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), '08')},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					]
				}
			});
			output.sep = await DBDefinitions.MainDBBankChecks.count({ 
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), '09')},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					]
				}
			});
			output.oct = await DBDefinitions.MainDBBankChecks.count({ 
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), '10')},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					]
				}
			});
			output.nov = await DBDefinitions.MainDBBankChecks.count({ 
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), '11')},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					]
				}
			});
			output.dec = await DBDefinitions.MainDBBankChecks.count({ 
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), '12')},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					]
				}
			});
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
	updateCheckStatus: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			DBDefinitions.MainDBBankChecks.update({
				status: req.body.status,
				dateModified: APIMISC.dateToday()
			},{
				where: { bankCheckUid: req.body.checkUid }
			}).then(function() {
				response.success = true;
				res.send(response);
			});
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getCheckParticularsPaginated: async (req , res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let pageNumber  	 		= req.params.pageNumber;
			let checkID                 = req.params.checkID;
			let limit        	 		= 10;
			let offset      	 		= (pageNumber - 1) * limit;
			let particularsArray	 	= [];
			let particularsCount 	= 0;

			particularsCount = await apiDB.mainDBConnection.query("SELECT COUNT(*) as count FROM bank_check_particulars WHERE bank_check_reference='" + checkID + "'", { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );
			particularsArray = await apiDB.mainDBConnection.query('SELECT * FROM bank_check_particulars WHERE bank_check_reference="' + checkID + '" ORDER BY date_created ASC LIMIT ' + offset + ',' + limit + '', { raw: true , type: apiDB.mainDBConnection.QueryTypes.SELECT } );

			let output = {
				count: particularsCount[0].count,
				particulars: particularsArray
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
	addParticular: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;
		try{
			let checkParticular = await DBDefinitions.MainDBBankCheckParticulars.findOne({
				where: {
					particular: req.body.particular,
					bankCheckReference: req.body.checkReference,
				}
			});

			if(checkParticular) {
				response.success = false;
				response.errorMessage = "Particular exists."
				res.send(response);
			}else{
				let getUser = await DBDefinitions.MainDBUsers.findOne({
					where: { username: req.body.createdBy }
				});

				DBDefinitions.MainDBBankCheckParticulars.create({
					bankCheckParticularsUid : 'aisBCP-' + APIMISC.uniqID(),
					particular: req.body.particular,
					referenceNumber: req.body.referenceNumber,
					unitPrice: req.body.unitPrice,
					particularAmount: req.body.particularAmount,
					quantity: req.body.quantity,
					bankCheckReference: req.body.checkReference,
					userIdReference: getUser.userUid,
					status: 1,
					dateCreated: APIMISC.dateToday(),
					createdBy: req.body.createdBy,
				}).then(function() {
					DBDefinitions.MainDBBankCheckParticulars.sum('particular_amount', { 
						where: { bankCheckReference: req.body.checkReference } 
					}).then(sum => {
						DBDefinitions.MainDBBankChecks.update({
							bankCheckAmount: sum,
						},{
							where: { bankCheckUid: req.body.checkReference }
						});
					});
					response.success = true;
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
	updateParticular: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			let checkParticular = await DBDefinitions.MainDBBankCheckParticulars.findOne({
				where: {
					[Op.not]: [ { bankCheckParticularsUid: req.body.particularUid } ],	
					particular: req.body.particular,
					bankCheckReference: req.body.checkReference
				}
			});

			if(checkParticular) {
				response.success = false;
				response.errorMessage = "Particular exists.";
				res.send(response);
			}else{
				DBDefinitions.MainDBBankCheckParticulars.update({
					particular: req.body.particular,
					referenceNumber: req.body.referenceNumber,
					unitPrice: req.body.unitPrice,
					particularAmount: req.body.particularAmount,
					quantity: req.body.quantity,
					bankCheckReference: req.body.checkReference,
					dateModified: APIMISC.dateToday()
				},{
					where: { bankCheckParticularsUid: req.body.particularUid }
				}).then(function() {
					DBDefinitions.MainDBBankCheckParticulars.sum('particular_amount', { 
						where: { bankCheckReference: req.body.checkReference } 
					}).then(sum => {
						DBDefinitions.MainDBBankChecks.update({
							bankCheckAmount: sum,
						},{
							where: { bankCheckUid: req.body.checkReference }
						});
					});
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
	deleteParticular: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {
			DBDefinitions.MainDBBankCheckParticulars.destroy({
				where: { bankCheckParticularsUid: req.body.particularUid }
			}).then(function() {
				DBDefinitions.MainDBBankCheckParticulars.sum('particular_amount', { 
					where: { bankCheckReference: req.body.checkReference } 
				}).then(sum => {
					DBDefinitions.MainDBBankChecks.update({
						bankCheckAmount: sum,
					},{
						where: { bankCheckUid: req.body.checkReference }
					});
				});
				response.success = true;
				res.send(response);
			}).catch(function(error) {
				response.errorMessage = "Unable to process request. Please try again.";
				res.send(response);
			});
		} catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getParticular: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let particulars = await DBDefinitions.MainDBBankCheckParticulars.findAll({
				where: { bankCheckReference: req.params.checkReference }
			});
			let output = { particulars: particulars }

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
	getParticularTotalAmount: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try {	
			DBDefinitions.MainDBBankCheckParticulars.sum('particular_amount', { 
				where: { bankCheckReference: req.params.checkReference } 
			}).then(sum => {
  				response.success = true;
  				response.output = sum;
				res.send(response);
			});
		}catch (error) {
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}

	},

	//Bank Reconciliation
	getBankRecon: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;
		let startDate = new Date(req.params.openingDate);
		let lastMonth = moment(startDate).subtract(1, 'months').toDate()
		let month = (startDate.getMonth() + 1);
		let year = startDate.getFullYear();
		try{
			let bankRecon = [];
			let lastBankRecon = [];

			bankRecon = await DBDefinitions.MainDBBankRecons.findOne({
				where: { 
					[Op.and]: [
						{ bankReconDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_recon_date')), month)},
						{ bankReconDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_recon_date')), year)}
					],
					bankReference: req.params.bank,
					bankAccountReference: req.params.account
				}
			});
			if(bankRecon == null){
				month = (lastMonth.getMonth() + 1);
				year = lastMonth.getFullYear();
				lastBankRecon = await DBDefinitions.MainDBBankRecons.findOne({
					where: { 
						[Op.and]: [
							{ bankReconDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_recon_date')), month)},
							{ bankReconDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_recon_date')), year)}
						],
						bankReference: req.params.bank,
						bankAccountReference: req.params.account
					}
				});
				bankRecon = "Not Close";
				if(lastBankRecon != null){
					let bankChecks = await DBDefinitions.MainDBBankChecks.findAll({
						where: { 
							[Op.and]: [
								{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), month)},
								{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
							],
							bankAccountReference: req.params.account,
							status: 1
						}
					});
					let reconCredits = await DBDefinitions.MainDBBankReconChecks.findAll({
						where: { 
							bankReconReference: lastBankRecon.bankReconId,
							status: 1
						}
					});

					if(bankChecks == null && reconCredits == null){
						let getUser = await DBDefinitions.MainDBUsers.findOne({
							where: { username: req.params.username }
						});

						DBDefinitions.MainDBBankRecons.create({
							bankReconId: 'BRID-' + APIMISC.uniqID(),
							startBalance: lastBankRecon.endBalance,
							bankReconDate: moment(startDate).format('YYYY-MM-DD'),
							bankReference: req.params.bank,
							bankAccountReference: req.params.account,
							userReference: getUser.userUid,
							status: 1,
							dateCreated: APIMISC.dateToday()
						});
						month = (startDate.getMonth() + 1);
						year = startDate.getFullYear();
						bankRecon = await DBDefinitions.MainDBBankRecons.findOne({
							where: { 
								[Op.and]: [
									{ bankReconDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_recon_date')), month)},
									{ bankReconDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_recon_date')), year)}
								],
								bankReference: req.params.bank,
								bankAccountReference: req.params.account
							}
						});
					}
				}
				let output = bankRecon;

				response = {
					success: true,
					output: output,
					errorMessage: ""
				}
				res.send(response);
			}
				let editBalance = 0;
				let difBalance = 0;
				let sumBalance = 0;

				month = (lastMonth.getMonth() + 1);
				year = lastMonth.getFullYear();
				lastBankRecon = await DBDefinitions.MainDBBankRecons.findOne({
					where: { 
						[Op.and]: [
							{ bankReconDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_recon_date')), month)},
							{ bankReconDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_recon_date')), year)}
						],
						bankReference: req.params.bank,
						bankAccountReference: req.params.account
					}
				});
				if(lastBankRecon != null){
					if(bankRecon.startBalance != lastBankRecon.endBalance){
						editBalance = lastBankRecon.endBalance;
						difBalance = parseFloat(lastBankRecon.endBalance) - parseFloat(bankRecon.startBalance);
						if(bankRecon.endBalance != null){
							sumBalance = parseFloat(bankRecon.endBalance) + parseFloat(difBalance);
						}else{
							sumBalance = bankRecon.endBalance;
						}
						DBDefinitions.MainDBBankRecons.update({
							startBalance: editBalance,
							endBalance: sumBalance
						}, {
							where: { bankReconId: bankRecon.bankReconId }
						});
						month = (startDate.getMonth() + 1);
						year = startDate.getFullYear();
						bankRecon = await DBDefinitions.MainDBBankRecons.findOne({
							where: { 
								[Op.and]: [
									{ bankReconDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_recon_date')), month)},
									{ bankReconDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_recon_date')), year)}
								],
								bankReference: req.params.bank,
								bankAccountReference: req.params.account
							}
						});
					}
				}
				let output = bankRecon;

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
	getReconSummary: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;
		let startDate = new Date(req.params.openingDate);
		let lastMonth = moment(startDate).subtract(1, 'months').toDate()
		let month = (startDate.getMonth() + 1);
		let year = startDate.getFullYear();

		try{
			let bankRecon = await DBDefinitions.MainDBBankRecons.findOne({
				where: { 
					[Op.and]: [
						{ bankReconDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_recon_date')), month)},
						{ bankReconDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_recon_date')), year)}
					],
					bankReference: req.params.bank,
					bankAccountReference: req.params.account
				}
			});
			let output = bankRecon;

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
	addBeginningBalance: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let getUser = await DBDefinitions.MainDBUsers.findOne({
				where: { username: req.body.createdBy }
			});

			DBDefinitions.MainDBBankRecons.create({
				bankReconId: 'BRID-' + APIMISC.uniqID(),
				startBalance: req.body.startBalance,
				bankReconDate: req.body.startDate,
				bankReference: req.body.bank,
				bankAccountReference: req.body.account,
				userReference: getUser.userUid,
				status: 1,
				dateCreated: APIMISC.dateToday()
			}).then(function() {
				response.success = true;
				res.send(response);
			}).catch(function(error){
				console.log(error);
				response.success = false;
				response.errorMessage = "Something went wrong. Please try again.";
				res.send(response);
			});
		}catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getAccountChecks: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;
		let startDate = new Date(req.params.openingDate);
		let month = (startDate.getMonth() + 1);
		let year = startDate.getFullYear();

		try{
			let bankChecks = await DBDefinitions.MainDBBankChecks.findAll({
				where: { 
					[Op.and]: [
						{ bankCheckDate: Sequelize.where(Sequelize.fn('month', Sequelize.col('bank_check_date')), month)},
						{ bankCheckDate: Sequelize.where(Sequelize.fn('year', Sequelize.col('bank_check_date')), year)}
					],
					bankAccountReference: req.params.account
				},
				order: [
		            ['bank_check_date', 'ASC']
		        ],
			});

			let output = bankChecks;

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
	addCredit: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let getUser = await DBDefinitions.MainDBUsers.findOne({
				where: { username : req.body.createdBy }
			});

			DBDefinitions.MainDBBankReconChecks.create({
				bankReconCheckId: 'BRCID-' + APIMISC.uniqID(),
				bankCheckDate: req.body.creditDate,
				details: req.body.details,
				credit: req.body.credit,
				bankReference: req.body.bank,
				bankAccountReference: req.body.account,
				bankReconReference: req.body.bankRecon,
				userReference: getUser.userUid,
				status: 1,
				dateCreated: APIMISC.dateToday()
			}).then(function() {
				response.success = true;
				res.send(response);
			}).catch(function(error){
				console.log(error);
				response.success = false;
				response.errorMessage = "Something went wrong. Please try again.";
				res.send(response);
			});
		}catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	getReconCredits: async (req, res) =>{
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			let reconCredits = await DBDefinitions.MainDBBankReconChecks.findAll({
				where: { bankReconReference: req.params.bankRecon }
			});

			let output = reconCredits;

			response = {
				success: true,
				output: output,
				errorMessage: ""
			}
			res.send(response);
		}catch(error){
			console.log(error);
			response.errorMessage= "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	updateReconCredit: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			DBDefinitions.MainDBBankReconChecks.update({
				bankCheckDate: req.body.creditDate,
				details: req.body.details,
				credit: req.body.credit,
				dateModified: APIMISC.dateToday()
			},{
				where: { bankReconCheckId: req.body.creditId }
			}).then(function(){
				response.success = true;
				res.send(response);
			}).catch(function(error){
				console.log(error);
				response.success = false;
				response.errorMessage = "Something went wrong. Please try again.";
				res.send(response);
			});
		}catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	changeReconCheckStatus: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			DBDefinitions.MainDBBankChecks.update({
				status: 2,
				dateModified: APIMISC.dateToday()
			},{
				where: { bankCheckUid: req.body.checkId }
			}).then(function(){
				DBDefinitions.MainDBBankRecons.update({
					endBalance: req.body.balance,
					dateModified: APIMISC.dateToday()
				},{
					where: { bankReconId: req.body.reconId }
				});
				response.success = true;
				res.send(response);
			}).catch(function(error){
				console.log(error);
				response.success = false;
				response.errorMessage = "Something went wrong. Please try again.";
				res.send(response);
			});
		}catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	},
	changeReconCreditStatus: async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		let response = module.exports.response;

		try{
			DBDefinitions.MainDBBankReconChecks.update({
				status: 2,
				dateModified: APIMISC.dateToday()
			},{
				where: { bankReconCheckId : req.body.creditId }
			}).then(function(){
				DBDefinitions.MainDBBankRecons.update({
					endBalance: req.body.balance,
					dateModified: APIMISC.dateToday()
				},{
					where: { bankReconId: req.body.reconId }
				});
				response.success = true;
				res.send(response);
			}).catch(function(error){
				console.log(error);
				response.success = false;
				response.errorMessage = "Something went wrong. Please try again.";
				res.send(response);
			})
		}catch(error){
			console.log(error);
			response.errorMessage = "Unable to process request. Please try again.";
			res.send(response);
		}
	}
}