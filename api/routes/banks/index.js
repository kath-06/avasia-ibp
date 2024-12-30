let router = require('express').Router();
let controller = require('./banks.controller');

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

// Banks
router.get('/bank/paginated/get/:pageNumber/:searchTerm?' , controller.getBanksPaginated);
router.post('/bank/new/', controller.newBank);
router.post('/bank/update/', controller.updateBank);
router.post('/bank/status/update', controller.updateBankStatus);
router.get('/bank/get/all', controller.getBanks);
router.get('/bank/get/activate', controller.getActivateBanks);

// Bank Accounts
router.get('/account/paginated/get/:pageNumber/:searchTerm?' , controller.getBankAccountsPaginated);
router.post('/account/new/', controller.newBankAccount);
router.post('/account/update/', controller.updateBankAccount);
router.post('/account/status/update', controller.updateBankAccountStatus);
router.get('/account/get/all', controller.getBankAccounts);
router.get('/account/get/activate/:bank?', controller.getActivateBankAccounts);

// Bank Checks Series
router.get('/check/series/paginated/get/:pageNumber/:searchTerm?' , controller.getChecksSeriesPaginated);
router.post('/check/series/new/', controller.newCheckSeries);
router.post('/check/series/update/', controller.updateCheckSeries);
router.get('/check/get/all/:bank/:bankAccount?', controller.getCheckSeries);
router.get('/check/number/get/:bank/:bankAccount/:series/:status?', controller.getCheckNumber);
router.post('/check/number/status', controller.statusCheckNumber);
router.get('/check/series/records/:checkSeries?', controller.getCheckSeriesRecords);
router.get('/check/records/:checkSeries?', controller.getCheckRecords);

// Bank Checks
router.get('/check/paginated/get/:pageNumber/:searchTerm?' , controller.getBankChecksPaginated);
router.get('/check/get/departments', controller.getDepartments);
router.get('/check/get/suppliers', controller.getSuppliers);
router.get('/check/get/paginated/suppliers/:pageNumber/:searchTerm?', controller.getSuppliersPaginated);
router.post('/check/new/supplier', controller.newSupplier);
router.post('/check/update/supplier', controller.updateSupplier);
router.post('/check/new/', controller.newCheck);
router.get('/check/get/:checkID?', controller.getCheck);
router.post('/check/update/', controller.updateCheck);
router.get('/check/count/', controller.getCheckCount);
router.get('/check/clearing/count', controller.getClearingCheckCount);
router.get('/check/postdated/count', controller.getPostdatedCheckCount);
router.get('/check/cleared/count', controller.getClearedCheckCount);
router.get('/check/clearing/get/:pageNumber?', controller.getClearingCheck);
router.get('/check/postdated/get/:pageNumber?', controller.getPostdatedCheck);
router.get('/check/cleared/get/:pageNumber?', controller.getClearedCheck);
router.get('/check/chart/data', controller.getChartData);

//Bank Check Particulars
router.get('/check/particulars/paginated/get/:pageNumber/:checkID?', controller.getCheckParticularsPaginated);
router.post('/check/particular/add', controller.addParticular);
router.post('/check/particular/update/', controller.updateParticular);
router.post('/check/particular/delete/', controller.deleteParticular);
router.get('/check/particular/total/:checkReference?', controller.getParticularTotalAmount);
router.get('/check/get/particulars/:checkReference?', controller.getParticular);

//Bank Reconciliation
router.get('/recon/get/:openingDate/:bank/:account/:username?', controller.getBankRecon);
router.get('/recon/summary/get/:openingDate/:bank/:account?', controller.getReconSummary);
router.post('/add/recon/balance', controller.addBeginningBalance);
router.get('/account/recon/get/:openingDate/:account?', controller.getAccountChecks);
router.post('/recon/add/credit', controller.addCredit);
router.get('/recon/credit/get/:bankRecon', controller.getReconCredits);
router.post('/recon/credit/update', controller.updateReconCredit);
router.post('/recon/check/change/status', controller.changeReconCheckStatus);
router.post('/recon/credit/change/status', controller.changeReconCreditStatus);

module.exports = router;