<template>
	<div id="textStyle">
		<base-header class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-12 container-fluid mt--7">
			<div class="card-header bg-transparent pb-2">
				<!-- Select bank and account number -->
				<div class="row mb-0 pl-2 pr-2 pt-4"
					id="redBg">
					<div class="col-xl-4 col-lg-4">
						<stats-card :title="'Bank'"
							:sub-title="bankA"
							class="mb-4 mb-xl-0"></stats-card>
					</div>
					<div class="col-xl-8 col-lg-4 pb-2">
						<stats-card :title="'Account Name'"
							:sub-title="accountName"
							class="mb-4 mb-xl-0"></stats-card>
					</div>
				</div>
				<!-- Select bank account number -->
				<div class="row mb-0 pl-2 pr-2 pb-2"
					id="redBg">
					<div class="col-xl-4 col-lg-4">
						<stats-card :title="'Account Number'"
							:sub-title="accountNumber"
							class="mb-4 mb-xl-0"></stats-card>
					</div>
					<div class="col-xl-8 col-lg-4">
						<stats-card :title="'Account Balance'"
							:sub-title="'₱ ' + bankAccountBalance"
							class="mb-4 mb-xl-0"></stats-card>
					</div>
				</div>
				<!-- Display bank account total deposit and total withdrawals -->
				<div class="row mb-0 pl-2 pr-2 pb-4"
					id="redBg">
					<div class="col-xl-6 col-lg-4">
						<stats-card :title="'Total Deposits'"
							:sub-title="'₱ ' + totalDeposits"
							class="mb-4 mb-xl-0"></stats-card>
					</div>
					<div class="col-xl-6 col-lg-4">
						<stats-card :title="'Total Withdrawals'"
							type="gradient-default"
							:sub-title="'₱ ' + totalWithdrawals"
							class="mb-4 mb-xl-0"></stats-card>
					</div>
				</div>
				<!-- Filter records by bank, account number and date -->
				<hr class="mb-2 mt-3">
				<div class="row pt-2 mb-1">
					<span class="col-sm-4"><b>Bank:</b></span>
					<span class="col-sm-4"><b>Account Number:</b></span>
					<span class="col-sm-4"><b>Choose Date:</b></span>
				</div>
				<div class="row">
					<span class="col-sm-4 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="activateBanks"
							:reduce="activateBank => activateBank.bankUid"
							label="bank"
							v-model="bank"
							:clearable="false"
							@input="getActivateBankAccounts(bank)"></v-select>
						<i class="text-red"
							v-if="$v.bank.$anyDirty && !$v.bank.required">Field Required</i>
					</span>
					<div class="col-sm-4 pl-5 pr-5"
						v-if="activateBankAccounts == ''" >
						<span class="text-red">No Bank Account</span>
					</div>
					<div class="col-sm-4 pl-5 pr-5"
						v-else>
						<v-select id="inputStyle"
							:options="activateBankAccounts"
							:reduce="activateBankAccount => activateBankAccount.bankAccountUid"
							label="bankAccountNumber"
							v-model="bankAccount"
							:clearable="false"
							@input="getAccountDetails(1,'')"></v-select>
						<i class="text-danger"
							v-if="$v.bankAccount.$anyDirty && !$v.bankAccount.required">Field Required</i>
					</div>
					<span class="col-sm-4 pl-5 pr-5">
						<base-input class="pt-1"
							id="inputStyle"
							type="month"
							min="1997-01"
							v-model="chooseDate"
							@input="getCashPosition(1,'')"></base-input>
					</span>
				</div>
				<hr class="mb-2 mt-3">
				<div class="table full-width pt-2">
					<!--Account transaction table -->
					<vue-good-table :columns="columns"
						:rows="transactions"
						:search-options="{enabled: true}"
						:pagination-options="{
							enabled: true,
							perPageDropdown: [10, 15, 20],
						}"
						:sort-options="{enabled: true}"
						:line-numbers="true"
						:isLoading="loading">
						<template slot="table-row" slot-scope="props">
							<b><span v-if="props.column.field == 'dateNegotiated'">
								<span>{{props.row.dateNegotiated == '' ? '---------' : props.row.dateNegotiated | moment("MMMM DD, YYYY")}}</span>
							</span>
							<span v-if="props.column.field == 'type'">
								<span>{{props.row.type}}</span>
							</span>
							<span v-if="props.column.field == 'amount'">
								<span>{{props.row.amount}}</span>
							</span>
							<span v-if="props.column.field == 'number'">
								<span>{{props.row.number}}</span>
							</span></b>
						</template>
					</vue-good-table>
					<hr class="mt-2 mb-2">
					<div class="row">
						<div class="col-sm-6"></div>
						<!-- Print button -->
						<div class="col-sm-3">
							<base-button block id="darkBtn"
								@click.native="printAccountTrans()"
								v-if="transactions.length > 0">Print</base-button>
						</div>
						<!-- Close button -->
						<div class="col-sm-3">
							<base-button block id="darkBtn"
								@click.native="closePage()">Close</base-button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import {db, dbMains, dbUsers} from '@/main';
	import {required} from "vuelidate/lib/validators";
	import {upperCase} from "text-case";
	import printJS from 'print-js';

	const transColumns = ["#", "Transaction Date", "Type", "Amount", "Reference/Check No."];

	let moment = require('moment');
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');

	export default{
		name: 'bank-account-balance',
		components: {},
		data() {
			return {
				// Account transaction table
				columns: [{
						label: 'Transaction Date',
						field: 'dateNegotiated'
					},{
						label: 'Type',
						field: 'type'
					},{
						label: 'Amount',
						field: 'amount'
					},{
						label: 'Reference/Check No',
						field: 'number'
					}
				],
				loading: false,
				loadError: false,
				searchTerm: '',
				searching: false,
				transactionTable: {
					title: "Transaction",
					subTitle: "",
					columns: [...transColumns]
				},
				transactions: [],
				transactionsCount: 0,
				currentPage: 1,
				activateBanks: [],
				bank: '',
				activateBankAccounts: [],
				bankAccount: '',
				chooseDate: moment().format('YYYY-MM'),
				// Account transactions widgets
				bankA: '',
				bankName: '',
				accountName:  '',
				accountNumber: '',
				availableBalance: '0.00',
				startingBalance: '0.00',
				totalDeposits: '0.00',
				totalWithdrawals: '0.00',
				endingBalance: '0.00',
				dateYear: '',
				bankAccountBalance: '0.00',
				// Print transaction
				printTrans: [],
			}
		},
		// Check if the user role
		beforeRouteEnter(to, from, next){
			let username = localStorage.getItem('aisname');
			let userAccount = dbUsers.collection("users")
				.where("username", "==", username);
			let accounts = [];

			userAccount.get().then((querySnapshot) => {
				if(!querySnapshot.empty){
					querySnapshot.forEach((doc) => {
						accounts.push(doc.data());
					});
					let userRoleData = dbUsers.collection("userRoles")
						.where("userRoleId", "==", accounts[0].userRoleReference);
					let roles = [];

					userRoleData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							roles.push(doc.data());
						});
						if(roles[0].userRole == 'User'){     
							next("/main/home");
						}else if(roles[0].userRole == 'Manager' || roles[0].userRole == 'Administrator'){
							next();
						}
					});
				}
			});
		},
		async mounted(){
			this.getActivateBanks();
			// this.getAccountDetails(1,"");
			// this.getCashPosition(1,"");
		},
		validations: {
			bank: {required},
			bankAccount: {required},
		},
		methods: {
			// Go back to transaction page
			closePage(){
				this.$router.push('/transaction');
			},
			// Get bank data
			getActivateBanks(){
				let self = this;
				let bankData = dbMains.collection("banks")
					.orderBy("bank", "asc");

				self.activateBanks = [];
				bankData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.activateBanks.push(doc.data());
					});
					self.bank = self.activateBanks[0].bankUid;
					if(self.bank != ''){
						self.getActivateBankAccounts(self.activateBanks[0].bankUid);
					}
				});
			},
			// Get bank account data
			getActivateBankAccounts(bank){
				let self = this;
				let bankAccountData = dbMains.collection("bankAccounts")
					.where("bankReference", "==", bank);

				self.activateBankAccounts = [];
				self.bankAccount = "";
				bankAccountData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.activateBankAccounts.push(doc.data());
					});
					if(self.activateBankAccounts.length != 0){
						self.bankAccount = self.activateBankAccounts[0].bankAccountUid;
					}
					self.getAccountDetails(1,"");
				});
			},
			// Get bank account details
			getAccountDetails(page, searchTerm){
				let self = this;

				self.$v.bank.$touch();
				self.$v.bankAccount.$touch();
				if(!self.$v.bank.$error && !self.$v.bankAccount.$error){
					let bankData = dbMains.collection("banks")
						.where("bankUid","==", self.bank);
					let banks = [];

					bankData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							banks.push(doc.data());
						});
						self.bankA = banks[0].bank;
						self.bankName = banks[0].bankName;
					});
					self.getCashPosition(page, searchTerm);
				}
			},
			getCashPosition(page, searchTerm){
				let self = this;

				self.$v.bank.$touch();
				self.$v.bankAccount.$touch();
				self.transactions = [];
				self.printTrans = [];
				self.bankAccountBalance = '0.00';
				if(!self.$v.bank.$error && !self.$v.bankAccount.$error){
					let start = moment(self.chooseDate)
						.startOf('month')
						.format('YYYY-MM-DD');
					let end = moment(self.chooseDate)
						.endOf('month')
						.format('YYYY-MM-DD');
					let checkData = null, fundData = null, withdrawData = null;
					let checks = [], withdrawals = 0, funds = [], deposits = 0, trans = [], withdraws = [], accounts = [];
					let accountData = dbMains.collection("bankAccounts")
						.where("bankReference","==", self.bank)
						.where("bankAccountUid","==", self.bankAccount);

					accountData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							accounts.push(doc.data());
						});
						self.accountName = accounts[0].bankAccountName;
						self.accountNumber = accounts[0].bankAccountNumber;
						if(parseFloat(accounts[0].accountBalance.replaceAll(",","")) > 0){
							self.bankAccountBalance = format(parseFloat(accounts[0].accountBalance).toFixed(2));
						}
					});
					if(searchTerm) {
						self.searching = true;
					}
					if(searchTerm){
						searchTerm = searchTerm.toString();
						checkData = db.collection("bankChecks")
							.where("bankCheckNumber","==",searchTerm)
							.where("status","in",[2])
							.orderBy("dateNegotiated","desc");
						fundData = dbMains.collection("bankAccountFunds")
							.where("referenceNumber","==",searchTerm)
							.orderBy("transactionDate","desc");
						withdrawData = dbMains.collection("bankAccountWithdrawals")
							.where("referenceNumber","==",searchTerm)
							.orderBy("transactionDate","desc");
					}else{
						checkData = db.collection("bankChecks")
							.where("bankReference","==",self.bank)
							.where("bankAccountReference","==",self.bankAccount)
							.where("dateNegotiated", ">=", start)
							.where("dateNegotiated", "<=", end)
							.where("status","in",[2])
							.orderBy("dateNegotiated","desc");
						fundData = dbMains.collection("bankAccountFunds")
							.where("bankReference","==",self.bank)
							.where("bankAccountReference","==",self.bankAccount)
							.where("transactionDate", ">=", start)
							.where("transactionDate", "<=", end)
							.orderBy("transactionDate","desc");
						withdrawData = dbMains.collection("bankAccountWithdrawals")
							.where("bankReference","==",self.bank)
							.where("bankAccountReference","==",self.bankAccount)
							.where('transactionDate',">=",start)
							.where('transactionDate',"<=",end)
							.orderBy("transactionDate","desc");
					}
					self.dateYear = upperCase(moment(self.chooseDate).format("MMMM YYYY").toString());
					checkData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							checks.push(doc.data());
						});
						for(let a = 0; a < checks.length; a++){
							withdrawals += parseFloat(checks[a].bankCheckAmount);
							trans.push({
								"dateNegotiated": checks[a].dateNegotiated,
								"amount": '₱ ' + format(parseFloat(checks[a].bankCheckAmount).toFixed(2)),
								"number": checks[a].bankCheckNumber,
								"type": "Withdrawal"
							});
						}
						fundData.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								funds.push(doc.data());
							});
							for(let b = 0; b < funds.length; b++){
								deposits += parseFloat(funds[b].amount);
								trans.push({
									"dateNegotiated": funds[b].transactionDate,
									"amount": '₱ ' + format(parseFloat(funds[b].amount).toFixed(2)),
									"number": funds[b].referenceNumber,
									"type": "Deposit"
								});
							}
							withdrawData.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									withdraws.push(doc.data());
								});
								for(let c = 0; c < withdraws.length; c++){
									withdrawals += parseFloat(withdraws[c].amount);
									trans.push({
										"dateNegotiated": withdraws[c].transactionDate,
										"amount": '₱ ' + format(parseFloat(withdraws[c].amount).toFixed(2)),
										"number": withdraws[c].referenceNumber,
										"type": "Withdrawal"
									});
								}
								self.totalWithdrawals = format(parseFloat(withdrawals).toFixed(2));
								self.totalDeposits = format(parseFloat(deposits).toFixed(2));
								trans.sort(function(a,b) {
									return new Date(b.dateNegotiated) - new Date(a.dateNegotiated);
								});
								self.printTrans = trans;
								for(let d = 0; d < trans.length; d++){
									trans[d]["rowNum"] = d + 1;
									self.transactions.push(trans[d]);
								}
								self.transactionsCount = trans.length;
								self.currentPage = page;
								setTimeout(function() {
									self.loading = false;
								}, 1000);
							});
						});
					});
				}
			},
			onPageChange (page) {
				let searchTerm = this.searchTerm;

				this.getAccountDetails(page, searchTerm);
			},
			search() {
				let searchTerm = this.searchTerm;

				if(searchTerm) {
					this.getAccountDetails(1, searchTerm);
				}
			},
			reloadData() {
				this.searchTerm = "";
				this.searching = false;
				this.getAccountDetails(1, "");
			},
			resetData() {
				this.searching = false;
				if(this.searchTerm == "") {
					this.getAccountDetails(1, "");
				}
			},
			// Print account transaction
			printAccountTrans(){
				let self = this, bankName = '', bankAccountNumber = '', bankAccountName = '';
				let month = moment(self.chooseDate).format("MMMM YYYY");
				let total = '<h5><b>Total Withdrawals:</b> ₱' + self.totalWithdrawals + '<br><b>Total Deposits:</b> ₱' + self.totalDeposits + '</h5>';

				for(let b = 0; b < self.activateBanks.length; b++){
					if(self.activateBanks[b].bankUid == self.bank){
						bankName = self.activateBanks[b].bank;
					}
				}
				for(let c = 0; c < self.activateBankAccounts.length; c++){
					if(self.activateBankAccounts[c].bankAccountUid == self.bankAccount){
						bankAccountNumber = self.activateBankAccounts[c].bankAccountNumber;
						bankAccountName = self.activateBankAccounts[c].bankAccountName;
					}
				}
				printJS({
					printable: self.printTrans,
					properties: [{
							field: 'dateNegotiated',
							displayName: 'Transaction/Check Date'
						},
						{
							field: 'type',
							displayName: 'Type'
						},
						{
							field: 'amount',
							displayName: 'Amount'
						},
						{
							field: 'number',
							displayName: 'Reference/Check No.'
					}],
					type: 'json',
					header: '<h2>' + bankName + ' ACCOUNT TRANSACTIONS (' + month + ')</h2><h4>Account: ' + bankAccountNumber + ' (' + bankAccountName + ')</h4>' + total,
					style: 'td {text-align: center;} body {font-family: "Calibri";}',
					documentTitle: bankName + ' Account Transaction'
				});
			},
		}
	}
</script>