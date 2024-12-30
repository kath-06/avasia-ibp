<template>
	<card>
		<div id='textStyle'>
			<div class="card-header bg-transparent pb-2">
				<!-- Select bank and account number -->
				<div class="row pt-2 mb-1">
					<span class="col-sm-6">
						<b>Bank:</b>
					</span>
					<span class="col-sm-6">
						<b>Account Number:</b>
					</span>
				</div>
				<div class="row mb-2">
					<span class="col-sm-6 pl-5 pr-5">
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
					<div class="col-sm-6 pl-5 pr-5"
						v-if="activateBankAccounts == ''">
						<span class="text-red">No Bank Account</span>
					</div>
					<div class="col-sm-6 pl-5 pr-5" v-else>
						<v-select id="inputStyle"
							:options="activateBankAccounts"
							:reduce="activateBankAccount => activateBankAccount.bankAccountUid"
							label="bankAccountNumber"
							v-model="bankAccount"
							:clearable="false"
							@input="getAccountWithdrawals(1,'')"></v-select>
						<i class="text-danger"
							v-if="$v.bankAccount.$anyDirty && !$v.bankAccount.required">Field Required</i>
					</div>
				</div>
				<!-- Show bank account balance -->
				<div class="row mb-2">
					<span class="col-sm-6">
						<b>Account Balance: </b>
					</span>
				</div>
				<div class="row mb-2">
					<span class="col-sm-6 pl-5 pr-5">₱ {{bankAccountBalance}}</span>
				</div>
			</div>
			<!-- Filter records -->
			<div class="row mb-0 pt-2">
				<span class="col-2 pt-2 pl-2 text-right">
					<b>Date Range:</b>
				</span>
				<span class="col-sm-3 pl-0">
					<base-input class="pt-2"
						id="inputStyle"
						type="date"
						min="1997-01-01"
						v-model="transDateStart"
						style="width: 200px;"
						@input="getAccountWithdrawals(1,'')"></base-input>
				</span>
				<span class="col-sm-3 pl-0">
					<base-input class="pt-2"
						id="inputStyle"
						type="date"
						min="1997-01-01"
						v-model="transDateEnd"
						style="width: 200px;"
						@input="getAccountWithdrawals(1,'')"></base-input>
				</span>
			</div>
			<div class="table-full-width pt-2">
				<!-- Account withdrawal table -->
				<vue-good-table :columns="columns"
					:rows="accountWithdrawals"
					:search-options="{enabled: true}"
					:pagination-options="{
						enabled: true,
						perPageDropdown: [10, 15, 20],
					}"
					:sort-options="{
						enabled: true,
						initialSortBy: {
							field: 'transactionDate',
							type: 'asc'
						}
					}"
					:line-numbers="true"
					:isLoading="loading"
					ref="withdrawal-table">
					<template slot="table-row"
						slot-scope="props">
						<b><span v-if="props.column.field == 'transactionDate'">
							<span>{{props.row.transactionDate | moment("MMM DD, YYYY")}}</span>
						</span>
						<span v-if="props.column.field == 'description'">
							<span id="description">{{props.row.description}}</span>
						</span>
						<span v-if="props.column.field == 'amount'">
							<span>₱ {{props.row.amount}}</span>
						</span>
						<span v-if="props.column.field == 'action'">
							<span class="pointer ml-2 far fa-edit"
								id="sideBarTxt"
								title="Edit"
								v-on:click="openEditAccountWithdrawalModal(props.row)"></span>
							<span class="pointer ml-2 fa fa-file"
								id="sideBarTxt"
								v-on:click="openAttachments(props.row)"
								title="Attachment"></span>
						</span></b>
					</template>
				</vue-good-table>
				<hr class="mt-2 mb-2">
				<div class="row">
					<div class="col-sm-3"></div>
					<!-- Print button -->
					<div class="col-sm-3">
						<base-button block id="darkBtn"
							@click.native="printAccountWithdrawal()"
							v-if="accountWithdrawals.length > 0">Print</base-button>
					</div>
					<!-- Add withdrawal button -->
					<div class="col-sm-3">
						<base-button block @click.native="openAddAuthModal()"
							id="darkBtn">Add Withdrawal</base-button>
					</div>
					<!-- Account transaction button -->
					<div class="col-sm-3">
						<base-button block id="darkBtn"
							@click.native="accountTransView()">Account Transaction</base-button>
					</div>
				</div>
			</div>
			<!-- ADD WITHDRAWAL MODAL -->
			<b-modal size="lg"
				id="add-withdrawal-modal"
				title="Add Account Withdrawal" centered
				:hide-header-close="true"
				:no-close-on-backdrop="true"
				:no-close-on-esc="true">
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Transaction Date:</b>
						<b class="text-red">*</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>Description:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="newTransDate"
							type="date"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.newTransDate.$anyDirty && !$v.newTransDate.required">Field Required</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<textarea rows="2"
							cols="45"
							v-model="newDesc"
							id="inputStyle"
							class="pl-2"
							placeholder="Description"></textarea>
						<i class="text-red"
							v-if="$v.newDesc.$anyDirty && !$v.newDesc.required">Field Required</i>
					</div>
				</div>
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Amount:</b>
						<b class="text-red">*</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>Reference Number:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="newAmount"
							id="inputStyle"
							type="text"
							placeholder="Amount"></base-input>
						<i class="text-red"
							v-if="$v.newAmount.$anyDirty && !$v.newAmount.required">Field Required</i>
						<i class="text-red"
							v-if="$v.newAmount.$anyDirty && !$v.newAmount.amountCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="newRefNumber"
							id="inputStyle"
							type="text"
							placeholder="Reference Number"></base-input>
						<i class="text-red"
							v-if="$v.newRefNumber.$anyDirty && !$v.newRefNumber.required">Field Required</i>
						<i class="text-red"
							v-if="$v.newRefNumber.$anyDirty && !$v.newRefNumber.alphaNumCustomValidator">Invalid Characters</i>
					</div>
				</div>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="addWithdrawal"
								:disabled="requestProcessing">
								<i v-if="requestProcessing"
									class="fa fa-spinner fa-spin"></i>
								Add
							</base-button>
							<base-button id="darkInlineBtn"
								@click.native="$bvModal.hide('add-withdrawal-modal')"
								:disabled="requestProcessing">Close</base-button>
						</div>
					</div>
				</template>
			</b-modal>
			<!-- EDIT WITHDRAWAL MODAL -->
			<b-modal size="lg"
				id="edit-withdrawal-modal"
				title="Edit Account Withdrawal" centered
				:hide-header-close="true"
				:no-close-on-backdrop="true"
				:no-close-on-esc="true">
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Transaction Date:</b>
						<b class="text-red">*</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>Description:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="edit.transDate"
							type="date"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.transDate.$anyDirty && !$v.edit.transDate.required">Field Required</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<textarea rows="2"
							cols="45"
							v-model="edit.desc"
							id="inputStyle"
							class="pl-2"
							placeholder="Description"></textarea>
						<i class="text-red"
							v-if="$v.edit.desc.$anyDirty && !$v.edit.desc.required">Field Required</i>
					</div>
				</div>
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Amount:</b>
						<b class="text-red">*</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>Reference Number:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="edit.amount"
							id="inputStyle"
							type="text"
							placeholder="Amount"></base-input>
						<i class="text-red"
							v-if="$v.edit.amount.$anyDirty && !$v.edit.amount.required">Field Required</i>
						<i class="text-red"
							v-if="$v.edit.amount.$anyDirty && !$v.edit.amount.amountCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="edit.refNumber"
							id="inputStyle"
							type="text"
							placeholder="Reference Number"></base-input>
						<i class="text-red"
							v-if="$v.edit.refNumber.$anyDirty && !$v.edit.refNumber.required">Field Required</i>
						<i class="text-red"
							v-if="$v.edit.refNumber.$anyDirty && !$v.edit.refNumber.alphaNumCustomValidator">Invalid Characters</i>
					</div>
				</div>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="updateWithdrawal"
								:disabled="requestProcessing">
								<i v-if="requestProcessing"
									class="fa fa-spinner fa-spin"></i>
								Update
							</base-button>
							<base-button id="darkInlineBtn"
								@click.native="$bvModal.hide('edit-withdrawal-modal')"
								:disabled="requestProcessing">Close</base-button>
						</div>
					</div>
				</template>
			</b-modal>
			<!-- ATTACHMENT MODAL -->
			<b-modal size="lg"
				id="attachment-modal"
				title="Attachments" centered
				:hide-header-close="true"
				:no-close-on-backdrop="true"
				:no-close-on-esc="true">
				<input type="file"
					ref="attachmentFile"
					style="display: none"
					@change="previewImage"
					accept="image/*">
				<card shadow v-if="attachments.length > 0">
					<div class="row pl-4"
						v-if="attachments.length > 0"
						align="center">
						<span v-for="attachment in attachments"
							v-bind:key="attachment.rowNum">
							<span class="col-4">
								<div class="mt-1 mb--2 pr-2 text-right">
									<span class="pointer far fa-times-circle text-danger"
										v-on:click="removeAttachment(attachment.name)"
										title="Remove"
										style="z-index: 1; position: relative; left: 0px; top: 0px;"></span>
								</div>
								<span class="mt-0">
									<a target="_blank"
										:href="attachment.url">
										<img :src="attachment.url"
											style="width: 220px; height: 220px; border-style: solid; border-color: black; border-width: 2px;">
									</a>
								</span>
							</span>
						</span>
					</div>
				</card>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="addAttachments()"
								:disabled="requestProcessing">
								<i v-if="requestProcessing"
									class="fa fa-spinner fa-spin"></i>
								Add Attachment
							</base-button>
							<base-button id="darkInlineBtn"
								@click.native="$bvModal.hide('attachment-modal')"
								:disabled="requestProcessing">Close</base-button>
						</div>
					</div>
				</template>
			</b-modal>
			<!-- AUTHENTICATION MODAL -->
			<b-modal size="md"
				id="auth-withdrawal-modal"
				title="Authentication" centered
				:hide-header-close="true"
				:no-close-on-backdrop="true"
				:no-close-on-esc="true">
				<div class="form-group row mb-0">
					<label class="col-sm-12 col-form-label">
						<b>Password:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-12 pl-5 pr-5">
						<base-input v-model="withdrawalPassword"
							type="password"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.withdrawalPassword.$anyDirty && !$v.withdrawalPassword.required">Field Required</i>
					</div>
				</div>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="addWithdrawalAuth()"
								:disabled="requestProcessing">
								<i v-if="requestProcessing"
									class="fa fa-spinner fa-spin"></i>
								Submit
							</base-button>
							<base-button id="darkInlineBtn"
								@click.native="$bvModal.hide('auth-withdrawal-modal')"
								:disabled="requestProcessing">Close</base-button>
						</div>
					</div>
				</template>
			</b-modal>
		</div>
	</card>
</template>
<script>
	import {dbMains, dbUsers, storage} from '@/main';
	import {helpers, required} from "vuelidate/lib/validators";
	import {upperCase} from "text-case";
	import imageCompression from 'browser-image-compression';
	import printJS from 'print-js';

	let moment = require('moment');
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');

	const withdrawalColumns = ["#", "Transaction Date", "Decscription", "Amount", "Reference No.", "Actions"];
	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9,. ]*$/);
	const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -.A-Za-z0-9 ]*$/);
	const today = new Date();
	const addZero = require('add-zero');
	const hash = require("password-hash");

	export default {
		name: 'bank-account-withdrawal',
		components: {},
		data() {
			return {
				// Account withdrawal table
				columns: [{
						label: 'Transaction Date',
						field: 'transactionDate'
					},{
						label: 'Description',
						field: 'description'
					},{
						label: 'Amount',
						field: 'amount'
					},{
						label: '',
						field: 'action',
						sortable: false,
						width: '100px'
					}
				],
				activateBanks: [],
				bank: '',
				activateBankAccounts: [],
				bankAccount: '',
				transDateStart: moment().startOf('week').format('YYYY-MM-DD'),
				transDateEnd: moment().endOf('week').format('YYYY-MM-DD'),
				loading: false,
				loadError: false,
				searchTerm: '',
				searching: false,
				accountWithdrawalTable: {
					title: "Account Withdrawals",
					subTitle: "",
					columns: [...withdrawalColumns]
				},
				accountWithdrawals: [],
				accountWithdrawalsCount: 0,
				currentPage: 1,
				// New account withdrawal
				newTransDate: moment().format("YYYY-MM-DD"),
				newDesc: '',
				newAmount: '',
				newRefNumber: '',
				// Enable or disable button
				requestProcessing: false,
				// Edit account withdrawal
				edit: {	
					id: '',
					withdrawalId: '',
					transDate: '',
					desc: '',
					amount: '',
					oldAmount: '',
					refNumber: ''
				},
				// Account withdrawal attachment
				attachment: '',
				attachmentData: null,
				attachments: [],
				accountWithdrawalId: '',
				uploadValue: 0,
				// Print account withdrawal
				printWithdrawals: [],
				bankAccountBalance: '',
				// Account withdrawal authentication
				withdrawalPassword: '',
				type: ''
			}
		},
		async mounted(){
			this.getActivateBanks();
			this.getAccountWithdrawals(1,'');
		},
		validations: {
			// Withdrawal select validations
			bank: {required},
			bankAccount: {required},
			// New withdrawal validations
			newTransDate: {required},
			newDesc: {required},
			newAmount: {
				required,
				amountCustomValidator
			},
			newRefNumber: {
				required,
				alphaNumCustomValidator
			},
			// Edit withdrawal validations
			edit: {
				transDate: {required},
				desc: {required},
				amount: {
					required,
					amountCustomValidator
				},
				refNumber: {
					required,
					alphaNumCustomValidator
				}
			},
			// Authentication validations
			withdrawalPassword: {required}
		},
		methods: {
			// Show account transaction summary
			accountTransView(){
				this.$router.push('/account/transaction');
			},
			closePage(){
				this.$router.push('/check/dashboard');
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
					self.getActivateBankAccounts(self.activateBanks[0].bankUid);
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
					self.getAccountWithdrawals(1,'');
				});
			},
			// Display account withdrawal data on table
			getAccountWithdrawals(page, searchTerm){
				let self = this, ids =[];

				self.accountWithdrawals = [];
				self.printWithdrawals = [];
				self.$v.bank.$touch();
				self.$v.bankAccount.$touch();
				if(!self.$v.bank.$error && !self.$v.bankAccount.$error){
					let withdrawals = [], accounts = [];
					let withdrawalData = null;
					let start = moment(self.transDateStart).format('YYYY-MM-DD');
					let end = moment(self.transDateEnd).format('YYYY-MM-DD');
					let bankAccountData = dbMains.collection("bankAccounts")
						.where("bankAccountUid", "==", self.bankAccount);

					bankAccountData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							accounts.push(doc.data());
						});
						if(accounts[0].accountBalance != '' && accounts[0].accountBalance > 0){  
							self.bankAccountBalance = format(parseFloat(accounts[0].accountBalance).toFixed(2));
						}else{
							self.bankAccountBalance = '----------';
						}
					});
					if(searchTerm) {
						self.searching = true;
					}
					if(searchTerm){
						searchTerm = searchTerm.toString();
						withdrawalData = dbMains.collection("bankAccountWithdrawals")
							.where("referenceNumber", "==", searchTerm)
							.orderBy("transactionDate","desc");
					}else{
						withdrawalData = dbMains.collection("bankAccountWithdrawals")
							.where("bankReference", "==", self.bank)
							.where("bankAccountReference", "==", self.bankAccount)
							.where("transactionDate", ">=", start)
							.where("transactionDate", "<=", end)
							.orderBy("transactionDate","desc");
					}
					withdrawalData.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) => {
								withdrawals.push(doc.data());
								self.printWithdrawals.push(doc.data());
								ids.push(doc.id);
							});
							for(let a = 0; a < withdrawals.length; a++){
								withdrawals[a].["id"] = ids[a];
								withdrawals[a].amount = format(parseFloat(withdrawals[a].amount).toFixed(2));
							}
							withdrawals.sort(function (a, b) {
								return b.transactionDate - a. transactionDate
							});
							for(let c = 0; c < withdrawals.length; c++){
								withdrawals[c].["rowNum"] = c + 1;
							}
							let firstRow = (page - 1) * 10;
							let lastRow = (page * 10);

							for(let b = firstRow; b < lastRow; b++){
								if(withdrawals[b]){
									self.accountWithdrawals.push(withdrawals[b]);
								}
							}
							self.accountWithdrawalsCount = withdrawals.length;
							self.currentPage = page;
							setTimeout(function() {
								self.loading = false;
							}, 1000);
						}
					});
				}
				self.loading = false;
			},
			onPageChange (page) {
				let searchTerm = this.searchTerm;

				this.getAccountWithdrawals(page, searchTerm);
			},
			search() {
				let searchTerm = this.searchTerm;

				if(searchTerm) {
					this.getAccountWithdrawals(1, searchTerm);
				}
			},
			reloadData() {
				this.searchTerm = "";
				this.searching = false;
				this.getAccountWithdrawals(1, "");
			},
			resetData() {
				this.searching = false;
				if(this.searchTerm == "") {
					this.getAccountWithdrawals(1, "");
				}
			},
			// Show user authentication form
			openAddAuthModal(){
				this.$bvModal.show("auth-withdrawal-modal");
				this.type = 'add';
			},
			// Validate user credentials
			addWithdrawalAuth(){
				let self = this;
				let userData = dbUsers.collection("users")
					.where("username","==",localStorage.getItem('aisname'));
				let user = [], role = [];

				userData.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							user.push(doc.data());
						});
						let roleData = dbUsers.collection("userRoles")
							.where("userRoleId","==",user[0].userRoleReference);
						roleData.get().then((querySnapshot) => {
							if(!querySnapshot.empty){
								querySnapshot.forEach((doc) => {
									role.push(doc.data());
								});
								if(role[0].userRole == "Administrator"){
									if(hash.verify(self.withdrawalPassword, user[0].password)){
										if(self.type == 'add'){
											self.$bvModal.show('add-withdrawal-modal');	
										}else if(self.type == 'update'){
											self.$bvModal.show('edit-withdrawal-modal');
										}else if(self.type == 'attachment'){
											self.$bvModal.show('attachment-modal');
										}
										self.$bvModal.hide('auth-withdrawal-modal');
										self.withdrawalPassword = "";
										self.type = '';
									}else{
										self.$swal({
											title: 'Error',
											text: 'Invalid password.',
											icon: 'error',
											confirmButtonColor: '#b80000',
											confirmButtonText: 'OK'
										}).then(() => {
											self.withdrawalPassword = "";
										});
									}
								}else{
									self.$swal({
										title: 'Error',
										text: 'You are not authorize.',
										icon: 'error',
										confirmButtonColor: '#b80000',
										confirmButtonText: 'OK'
									}).then(() => {
										self.$bvModal.hide('auth-withdrawal-modal-modal');
										self.withdrawalPassword = "";
										self.type = '';
									});
								}
							}else if(querySnapshot.empty){
								self.$swal({
									title: 'Error',
									text: 'You are not authorize.',
									icon: 'error',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								}).then(() => {
									self.$bvModal.hide('auth-withdrawal-modal');
									self.withdrawalPassword = "";
									self.type = '';
								});
							}
						});
					}else if(querySnapshot.empty){
						self.$swal({
							title: 'Error',
							text: 'You are not authorize.',
							icon: 'error',
							confirmButtonColor: '#b80000',
							confirmButtonText: 'OK'
						}).then(() => {
							self.$bvModal.hide('auth-withdrawal-modal');
							self.withdrawalPassword = "";
							self.type = '';
						});
					}
				});
			},
			// Save new account withdrawal
			addWithdrawal(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newTransDate.$touch();
				self.$v.newDesc.$touch();
				self.$v.newAmount.$touch();
				self.$v.newRefNumber.$touch();
				self.$v.bank.$touch();
				self.$v.bankAccount.$touch();
				if(!self.$v.newTransDate.$error && !self.$v.newDesc.$error && !self.$v.newAmount.$error && !self.$v.newRefNumber.$error && !self.$v.bank.$error && !self.$v.bankAccount.$error){
					self.requestProcessing = true;
					let getUserId = dbUsers.collection("users")
						.where("username","==", localStorage.getItem("aisname"));
					let users = [], accountId = '', balance = '', total = 0;
					let dataId = 'AWI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
					let accountData = dbMains.collection('bankAccounts')
						.where("bankAccountUid","==", self.bankAccount);

					getUserId.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) =>{
							if(doc.exists){
								users.push(doc.data());
							}
							try{
								dbMains.collection("bankAccountWithdrawals").doc()
								.set({
									bankAccountWithdrawalId: dataId,
									transactionDate: self.newTransDate,
									description: self.newDesc,
									amount: self.newAmount,
									referenceNumber: upperCase(self.newRefNumber),
									bankReference: self.bank,
									bankAccountReference: self.bankAccount,
									userReference: users[0].userId,
									status: 1,
									dateCreated: today,
									dateModified: today
								}).then( () => {
									accountData.get().then((querySnapshot) => {
										querySnapshot.forEach((doc) => {
											accountId = doc.id;
											balance = parseFloat(doc.data().accountBalance.replaceAll(",",""));
										});
										if(balance > 0 && balance >= parseFloat(self.newAmount.replaceAll(",",""))){
											total = balance - parseFloat(self.newAmount.replaceAll(",",""));
										}else{
											total = balance;
										}
										dbMains.collection("bankAccounts")
										.doc(accountId)
										.update({
											accountBalance: parseFloat(total).toFixed(2),
											dateModified: today
										}).then(() => {
											if(total > 0){
												self.bankAccountBalance = format(parseFloat(total).toFixed(2));
											}else{
												self.bankAccountBalance = '----------';
											}
											self.newAmount = '';
										});
									});
									self.newTransDate = moment().format("YYYY-MM-DD");
									self.newDesc = '';
									self.newRefNumber = '';
									self.$v.newTransDate.$reset();
									self.$v.newDesc.$reset();
									self.$v.newAmount.$reset();
									self.$v.newRefNumber.$reset();
									self.requestProcessing = false;
									self.$bvModal.hide("add-withdrawal-modal");
									self.$refs['withdrawal-table'].reset();
									self.getAccountWithdrawals(1, "");
									self.$swal({
										title: 'Success',
										text: 'Account withdrawal added successfully!',
										icon: 'success',
										confirmButtonColor: '#b80000',
										confirmButtonText: 'OK'
									});
								});
							}catch(error){
								console.log(error);
								self.requestProcessing = false;
								self.$swal({
									title: 'Error',
									text: 'Something went wrong. Please try again.',
									icon: 'error',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								});
							}
						});
					});
				}
			},
			// Show edit account withdrawal form
			openEditAccountWithdrawalModal(withdraw){
				this.edit = {
					id: withdraw.id,
					withdrawId: withdraw.bankAccountWithdrawalId,
					transDate: withdraw.transactionDate,
					desc: withdraw.description,
					amount: withdraw.amount,
					oldAmount: withdraw.amount,
					refNumber: withdraw.referenceNumber
				};
				this.$bvModal.show("auth-withdrawal-modal");
				this.type = 'update';
			},
			// Change account withdrawal details
			updateWithdrawal(){
				let self = this;

				self.requestProcessing = false;
				self.$v.edit.$touch();
				self.$v.bank.$touch();
				self.$v.bankAccount.$touch();
				if(!self.$v.edit.$error){
					self.edit.amount = parseFloat(self.edit.amount.replaceAll(",", ""));
					try{
						let accountId = '', balance = '', total = 0;
						let accountData = dbMains.collection('bankAccounts')
							.where("bankAccountUid","==", self.bankAccount);

						dbMains.collection("bankAccountWithdrawals")
						.doc(self.edit.id)
						.update({
							transactionDate: self.edit.transDate,
							description: self.edit.desc,
							amount: parseFloat(self.edit.amount).toFixed(2).toString(),
							referenceNumber: upperCase(self.edit.refNumber),
							dateModified: today
						}).then(() => {
							accountData.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									accountId = doc.id;
									balance = parseFloat(doc.data().accountBalance.replaceAll(",",""));
								});
								balance = balance + parseFloat(self.edit.oldAmount.replaceAll(",",""));
								total = balance - self.edit.amount;
								dbMains.collection("bankAccounts")
								.doc(accountId)
								.update({
									accountBalance: parseFloat(total).toFixed(2),
									dateModified: today
								}).then(() => {
									if(total > 0){
										self.bankAccountBalance = format(parseFloat(total).toFixed(2));
									}else{
										self.bankAccountBalance = '----------';
									}
									self.edit = {};
								});
							});
							self.$v.edit.$reset();
							self.$bvModal.hide("edit-withdrawal-modal");
							self.requestProcessing = false;
							self.$refs['withdrawal-table'].reset();
							self.getAccountWithdrawals(1, "");
							self.$swal({
								title: 'Success',
								text: 'Account withdrawal updated successfully!',
								icon: 'success',
								confirmButtonColor: '#b80000',
								confirmButtonText: 'OK'
							});
						});
					}catch(error){
						console.log(error);
						self.requestProcessing = false;
						self.$swal({
							title: 'Error',
							text: 'Something went wrong. Please try again.',
							icon: 'error',
							confirmButtonColor: '#b80000',
							confirmButtonText: 'OK'
						});
					}
				}
			},
			// Save account withdrawal attachment
			openAttachments(fund){
				this.accountWithdrawalId = fund.bankAccountWithdrawalId;
				this.$bvModal.show("auth-withdrawal-modal");
				this.getAttachments(this.accountWithdrawalId);
				this.type = 'attachment';
			},
			addAttachments() {
				this.$refs.attachmentFile.click();
			},
			previewImage(event) {
				let self = this;
				const options = {
					maxSizeMB: 1,
					useWebWorker: true
				}

				self.uploadValue = 0;
				self.attachment = null;
				self.attachments = [];
				self.attachmentData = event.target.files[0];
				imageCompression(self.attachmentData, options)
				.then(function (compressedFile) {
					self.attachmentData = compressedFile;
					self.onUpload(self.attachmentData);
				});
			},
			onUpload(data){
				let self = this;
				const storageRef = storage.ref('bankAccountWithdrawal/' + self.accountWithdrawalId + '/' + data.name)
					.put(data);

				self.attachment = null;
				storageRef.on(`state_changed`, snapshot => {
					self.uploadValue = ( snapshot.bytesTransferred/snapshot.totalBytes ) * 100; 
				}, error=>{
					console.log(error.message)
				}, () => {
					self.uploadValue = 100;
					self.$swal({
						title: 'Success',
						text: 'Attachment uploaded successfully!',
						icon: 'success',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					});
					self.getAttachments(self.accountWithdrawalId);
				});
			},
			// Get account withdrawal attachment
			getAttachments(id){
				let self= this, rowNum = 0;
				let listRef = storage.ref('bankAccountWithdrawal/' + id);

				self.requestProcessing = false;
				self.attachments = [];
				listRef.listAll()
				.then((res) => {
					res.items.forEach((itemRef) => {
						storage.ref('bankAccountWithdrawal/' + id + '/' + itemRef.name)
						.getDownloadURL()
						.then((url)=>{
							rowNum = rowNum + 1;
							self.attachments.push({
								"rowNum": rowNum,
								"name" : itemRef.name,
								"url" : url,
								"path": itemRef.fullPath,
								"status" : 1
							});
						});
					});
				}).catch((error) => {
					console.log(error);
				});
			},
			// Delete account withdrawal attachment
			removeAttachment(name){
				let self = this;

				self.$swal({
					title: "Are you sure?",
					text: "You want to remove this attachment?",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#C72111',
					confirmButtonText: 'CONFIRM' ,
					cancelButtonText: 'CANCEL'
				}).then((result) => {
					if(result.value){
						let deleteRef = storage.ref('bankAccountWithdrawal/' + self.accountWithdrawalId + '/' + name);

						deleteRef.delete().then(() => {
							self.$swal({
								title: 'Success',
								text: 'Attachment remove successfully!',
								icon: 'success',
								confirmButtonColor: '#b80000',
								confirmButtonText: 'OK'
							});
							self.getAttachments(self.accountWithdrawalId);
						}).catch((error) => {
							console.log(error);
							self.$swal({
								title: 'Error',
								text: 'Something went wrong. Please try again.',
								icon: 'error',
								confirmButtonColor: '#b80000',
								confirmButtonText: 'OK'
							});
						});
					}
				});
			},
			// Print account withdrawal details
			printAccountWithdrawal(){
				let self = this, bankName = '', bankAccountNumber = '', bankAccountName = '';
				let dateRange = '';

				if(self.filter != 'all'){
					dateRange = '<h5>Date Range: ' + moment(self.transDateStart).format("MMM DD, YYYY") + ' to ' + moment(self.transDateEnd).format("MMM DD, YYYY") + '</h5>';
				}
				for(let a = 0; a < self.printWithdrawals.length; a++){
					self.printWithdrawals[a].amount = '₱ ' + format(parseFloat(self.printWithdrawals[a].amount).toFixed(2));
				}
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
					printable: self.printWithdrawals,
					properties: [{
							field: 'transactionDate',
							displayName: 'Transaction Date'
						},
						{
							field: 'description',
							displayName: 'Description'
						},
						{
							field: 'amount',
							displayName: 'Amount'
						},
						{
							field: 'referenceNumber',
							displayName: 'Reference No.'
					}],
					type: 'json',
					header: '<h2>' + bankName + ' ACCOUNT WITHDRAWALS</h2><h4>Account: ' + bankAccountNumber + ' (' + bankAccountName + ')</h4>' + dateRange,
					style: 'td {text-align: center;} body {font-family: "Calibri";}',
					documentTitle: bankName + ' Account Funds'
				});
			},
		}
	}
</script>