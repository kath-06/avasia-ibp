let apiDB    = require('./db.js');
let Sequelize = require('sequelize');

const MainDBBanks = apiDB.mainDBConnection.define('banks', {
	bankUid: {
		field: 'bank_uid',
		type: Sequelize.STRING,
		allowNull: false
	},
	bank: {
		field: 'bank',
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		field: 'status',
		type: Sequelize.INTEGER,
		allowNull: false
	},
	userIdReference: {
		field: 'user_id_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	dateCreated: {
		field: 'date_created',
		type: Sequelize.DATE,
		allowNull: false
	},
	dateModified: {
		field: 'date_modified',
		type: Sequelize.DATE,
		allowNull: true
	},
	createdBy: {
		field: 'created_by',
		type: Sequelize.STRING,
		allowNull: false
	}
});

const MainDBBankAccounts = apiDB.mainDBConnection.define('bank_accounts', {
	bankAccountUid: {
		field: 'bank_account_uid',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankAccountName: {
		field: 'bank_account_name',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankAccountNumber: {
		field: 'bank_account_number',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankAccountDate: {
		field: 'bank_account_date',
		type: Sequelize.DATE,
		allowNull: false
	},
	userIdReference: {
		field: 'user_id_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankReference: {
		field: 'bank_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		field: 'status',
		type: Sequelize.INTEGER,
		allowNull: false
	},
	dateCreated: {
		field: 'date_created',
		type: Sequelize.DATE,
		allowNull: false
	},
	dateModified: {
		field: 'date_modified',
		type: Sequelize.DATE,
		allowNull: true
	},
	createdBy: {
		field: 'created_by',
		type: Sequelize.STRING,
		allowNull: false
	}
});

const MainDBDepartments = apiDB.mainDBConnection.define('departments', {
	departmentUid: {
		field: 'deparment_uid',
		type: Sequelize.STRING,
		allowNull: false
	},
	departmentName: {
		field: 'department_name',
		type: Sequelize.STRING,
		allowNull: false
	},
	seriesCode: {
		field: 'series_code',
		type: Sequelize.STRING,
		allowNull: false
	}
});

const MainDBSuppliers = apiDB.mainDBConnection.define('suppliers', {
	supplierId: {
		field: 'supplier_id',
		type: Sequelize.STRING,
		allowNull: false
	},
	supplier: {
		field: 'supplier',
		type: Sequelize.STRING,
		allowNull: false
	},
	userIdReference: {
		field: 'user_id_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		field: 'status',
		type: Sequelize.INTEGER,
		allowNull: false
	},
	dateCreated: {
		field: 'date_created',
		type: Sequelize.DATE,
		allowNull: false
	},
	dateModified: {
		field: 'date_modified',
		type: Sequelize.DATE,
		allowNull: true
	},
	createdBy: {
		field: 'created_by',
		type: Sequelize.STRING,
		allowNull: false
	}
});

const MainDBBankChecks = apiDB.mainDBConnection.define('bank_checks', {
	bankCheckUid: {
		field: 'bank_check_uid',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankCheckNumber: {
		field: 'bank_check_number',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankCheckDate: {
		field: 'bank_check_date',
		type: Sequelize.DATE,
		allowNull: false
	},
	bankCheckAmount: {
		field: 'bank_check_amount',
		type: Sequelize.DECIMAL(19, 2),
		allowNull: false
	},
	checkType: {
		field: 'check_type',
		type: Sequelize.STRING,
		allowNull: false
	},
	voucherNumber: {
		field: 'voucher_number',
		type: Sequelize.STRING,
		allowNull: false,
	},
	voucherDate: {
		field: 'voucher_date',
		type: Sequelize.DATE,
		allowNull: false
	},
	payeeReference: {
		field: 'payee_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	description: {
		field: 'description',
		type: Sequelize.STRING,
		allowNull: true
	},
	departmentReference: {
		field: 'department_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	userIdReference: {
		field: 'user_id_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankReference: {
		field: 'bank_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankAccountReference: {
		field: 'bank_account_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankCheckSeriesReference: {
		field: 'bank_check_series_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		field: 'status',
		type: Sequelize.INTEGER,
		allowNull: false
	},
	dateCreated: {
		field: 'date_created',
		type: Sequelize.DATE,
		allowNull: false
	},
	dateModified: {
		field: 'date_modified',
		type: Sequelize.DATE,
		allowNull: true
	},
	createdBy: {
		field: 'created_by',
		type: Sequelize.STRING,
		allowNull: false
	}
});

const MainDBBankCheckSeries = apiDB.mainDBConnection.define('bank_check_series', {
	bankCheckSeriesUid: {
		field: 'bank_check_series_uid',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankCheckSeries: {
		field: 'bank_check_series',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankCheckSeriesDate: {
		field: 'bank_check_series_date',
		type: Sequelize.STRING,
		allowNull: false
	},
	userIdReference: {
		field: 'user_id_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankReference: {
		field: 'bank_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankAccountReference: {
		field: 'bank_account_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		field: 'status',
		type: Sequelize.INTEGER,
		allowNull: false
	},
	dateCreated: {
		field: 'date_created',
		type: Sequelize.DATE,
		allowNull: false
	},
	dateModified: {
		field: 'date_modified',
		type: Sequelize.DATE,
		allowNull: true
	},
	createdBy: {
		field: 'created_by',
		type: Sequelize.STRING,
		allowNull: false
	}
});

const MainDBBankCheckParticulars = apiDB.mainDBConnection.define('bank_check_particulars', {
	bankCheckParticularsUid: {
		field: 'bank_check_particulars_uid',
		type: Sequelize.STRING,
		allowNull: false
	},
	particular: {
		field: 'particular',
		type: Sequelize.STRING,
		allowNull: false
	},
	referenceNumber: {
		field: 'reference_number',
		type: Sequelize.STRING,
		allowNull: false
	},
	unitPrice: {
		field: 'unit_price',
		type: Sequelize.STRING,
		allowNull: false
	},
	particularAmount: {
		field: 'particular_amount',
		type: Sequelize.STRING,
		allowNull: false
	},
	quantity: {
		field: 'quantity',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankCheckReference: {
		field: 'bank_check_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	userIdReference: {
		field: 'user_id_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		field: 'status',
		type: Sequelize.INTEGER,
		allowNull: false
	},
	dateCreated: {
		field: 'date_created',
		type: Sequelize.DATE,
		allowNull: false
	},
	dateModified: {
		field: 'date_modified',
		type: Sequelize.DATE,
		allowNull: true
	},
	createdBy: {
		field: 'created_by',
		type: Sequelize.STRING,
		allowNull: false
	}
});

const MainDBUsers = apiDB.mainDBConnection.define('users', {
	userUid: {
		field: 'user_uid',
		type: Sequelize.STRING,
		allowNull: false
	},
	firstname: {
		field: 'firstname',
		type: Sequelize.STRING,
		allowNull: false
	},
	middlename: {
		field: 'middle_name',
		type: Sequelize.STRING,
		allowNull: false
	},
	lastname: {
		field: 'lastname',
		type: Sequelize.STRING,
		allowNull: false
	},
	emailAddress: {
		field: 'email_address',
		type: Sequelize.STRING,
		allowNull: false
	},
	contactNumber: {
		field: 'contact_number',
		type: Sequelize.INTEGER,
		allowNull: false
	},
	username: {
		field: 'username',
		type: Sequelize.STRING,
		allowNull: false
	},
	password: {
		field: 'password',
		type: Sequelize.STRING,
		allowNull: false
	},
	userRoleReference: {
		field: 'user_role_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	userIDReference: {
		field: 'user_id_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	departmentReference: {
		field: 'department_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		field: 'status',
		type: Sequelize.INTEGER,
		allowNull: true
	},
	dateCreated: {
		field: 'date_created',
		type: Sequelize.DATE,
		allowNull: false
	},
	dateModified: {
		field: 'date_modified',
		type: Sequelize.DATE,
		allowNull: true
	},
	createdBy: {
		field: 'created_by',
		type: Sequelize.STRING,
		allowNull: false
	}
});

const MainDBUserRoles = apiDB.mainDBConnection.define('user_roles', {
	userRoleUid: {
		field: 'user_role_uid',
		type: Sequelize.STRING,
		allowNull: false
	},
	userRole: {
		field: 'user_role',
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		field: 'status',
		type: Sequelize.INTEGER,
		allowNull: false
	},
	dateCreated: {
		field: 'date_created',
		type: Sequelize.DATE,
		allowNull: false
	},
	dateModified: {
		field: 'date_modified',
		type: Sequelize.DATE,
		allowNull: true
	},
	createdBy: {
		field: 'created_by',
		type: Sequelize.STRING,
		allowNull: false
	}
});

const MainDBAccountKey = apiDB.mainDBConnection.define('account_keys', {
	accountKeyId: {
		field: 'account_key_id',
		type: Sequelize.STRING,
		allowNull: false
	},
	userReference: {
		field: 'user_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	secretKey: {
		field: 'secret_key',
		type: Sequelize.STRING,
		allowNull: false
	},
	dateCreated: {
		field: 'date_created',
		type: Sequelize.DATE,
		allowNull: false
	}
});

const MainDBBankRecons = apiDB.mainDBConnection.define('bank_reconciliations', {
	bankReconId: {
		field: 'bank_reconciliation_id',
		type: Sequelize.STRING,
		allowNull: false,
	},
	startBalance: {
		field: 'start_balance',
		type: Sequelize.DECIMAL,
		allowNull: false
	},
	endBalance: {
		field: 'end_balance',
		type: Sequelize.DECIMAL,
		allowNull: true
	},
	bankReconDate: {
		field: 'bank_recon_date',
		type: Sequelize.DATE,
		allowNull: false
	},
	bankReference: {
		field: 'bank_reference',
		type: Sequelize.STRING,
		allowNull: false
	}, 
	bankAccountReference: {
		field: 'bank_account_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	userReference: {
		field: 'user_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		field: 'status',
		type: Sequelize.INTEGER,
		allowNull: false
	},
	dateCreated: {
		field: 'date_created',
		type: Sequelize.DATE,
		allowNull: false
	},
	dateModified: {
		field: 'date_modified',
		type: Sequelize.DATE,
		allowNull: true
	}
});

const MainDBBankReconChecks = apiDB.mainDBConnection.define('bank_reconciliation_checks', {
	bankReconCheckId: {
		field: 'bank_reconciliation_check_id',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankCheckDate: {
		field: 'bank_check_date',
		type: Sequelize.DATE,
		allowNull: false
	},
	details: {
		field: 'details',
		type: Sequelize.STRING,
		allowNull: false
	},
	credit: {
		field: 'credit',
		type: Sequelize.DECIMAL,
		allowNull: true
	},
	bankReference: {
		field: 'bank_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankAccountReference: {
		field: 'bank_account_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankReconReference: {
		field: 'bank_reconciliation_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	userReference: {
		field: 'user_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		field: 'status',
		type: Sequelize.INTEGER,
		allowNull: false
	},
	dateCreated: {
		field: 'date_created',
		type: Sequelize.DATE,
		allowNull: false
	},
	dateModified: {
		field: 'date_modified',
		type: Sequelize.DATE,
		allowNull: true
	}
});

const MainDBBankCheckSeriesReports = apiDB.mainDBConnection.define('bank_check_series_reports', {
	checkReportId : {
		field: 'check_report_id',
		type: Sequelize.STRING,
		allowNull: false
	},
	checkNumber : {
		field: 'check_number',
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		field: 'status',
		type: Sequelize.STRING,
		allowNull: false
	},
	checkReference: {
		field: 'check_reference',
		type: Sequelize.STRING,
		allowNull: true
	},
	checkSeriesReference: {
		field: 'check_series_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankAccountReference: {
		field: 'bank_account_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	bankReference: {
		field: 'bank_reference',
		type: Sequelize.STRING,
		allowNull: false
	},
	dateCreated: {
		field: 'date_created',
		type: Sequelize.DATE,
		allowNull: false
	},
	dateModified: {
		field: 'date_modified',
		type: Sequelize.DATE,
		allowNull: true
	}
});

module.exports = {
	MainDBBanks,
	MainDBBankAccounts,
	MainDBDepartments,
	MainDBSuppliers,
	MainDBBankChecks,
	MainDBBankCheckSeries,
	MainDBBankCheckParticulars,
	MainDBUsers,
	MainDBUserRoles,
	MainDBBankRecons,
	MainDBBankReconChecks,
	MainDBBankCheckSeriesReports,
	MainDBAccountKey
}