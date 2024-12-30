<template>
	<div>
		<base-header type="gradient-success"
			class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-10 container-fluid mt--7" >
			<card>
				<div class="card-header bg-transparent pb-5">
					<div class="text-right"></div>
				</div>
				<div class="form-group row">
					<label class="col-sm-4 col-form-label">Department</label>
					<label class="col-sm-4 col-form-label">Check Status</label>
					<label class="col-sm-4 col-form-label">Check Date Type</label>
					<div class="col-sm-4">
						<v-select class="form-control-plaintext"
							:options="departments"
							:reduce="department => department.departmentUid"
							label="departmentName"
							v-model="department"></v-select>
						<i class="text-danger"
							v-if="$v.department.$anyDirty && !$v.department.required">Field Required</i>
					</div>
					<div class="col-sm-4">
						<v-select class="form-control-plaintext"
							:options="checkStatus"
							:reduce="checkStatus => checkStatus.status"
							label="status"
							v-model="checkStat"></v-select>
						<i class="text-danger"
							v-if="$v.checkStat.$anyDirty && !$v.checkStat.required">Field Required</i>
					</div>
					<div class="col-sm-2">
						<base-radio name="dated"
							class="mb-3"
							v-model="radioCheckDateType">Dated</base-radio>
					</div>
					<div class="col-sm-2">
						<base-radio name="postdated"
							class="mb-3"
							v-model="radioCheckDateType">Postdated</base-radio>
					</div>
				</div>
				<div class="form-group row">
					<label for="bank"
						class="col-sm-3 col-form-label">Bank</label>
					<div class="col-sm-8">
						<v-select class="form-control-plaintext"
							:options="activateBanks"
							:reduce="activateBank => activateBank.bankUid"
							label="bank"
							v-model="bank"
							@input="getActivateBankAccounts(bank, 'yes')"></v-select>
						<i class="text-danger"
							v-if="$v.bank.$anyDirty && !$v.bank.required">Field Required</i>
					</div>
					<label for="bankAccount"
						class="col-sm-3 col-form-label">Bank Account</label>
					<div class="col-sm-8"
						v-if="activateBankAccounts == ''" >
						<span class="text-danger"> No Bank Account </span>
					</div>
					<div class="col-sm-8" v-else>
						<v-select class="form-control-plaintext"
							:options="activateBankAccounts"
							:reduce="activateBankAccount => activateBankAccount.bankAccountUid"
							label="bankAccountName"
							v-model="bankAccount"
							@input="getCheckSeries(bank, bankAccount, 'yes')"></v-select>
						<i class="text-danger"
							v-if="$v.bankAccount.$anyDirty && !$v.bankAccount.required">Field Required</i>
					</div>
					<label for="checkSeries"
						class="col-sm-3 col-form-label">Check Series</label>
					<div class="col-sm-8"
						v-if="checkSeries == ''">
						<span class="text-danger"> No Check Series </span>
					</div>
					<div class="col-sm-8" v-else>
						<v-select class="form-control-plaintext"
							:options="checkSeries"
							:reduce="cSeries => cSeries.bankCheckSeriesUid"
							label="bankCheckSeries"
							v-model="series"></v-select>
						<i class="text-danger"
							v-if="$v.series.$anyDirty && !$v.series.required">Field Required</i>
					</div>
					<label for="checkNumber"
						class="col-sm-3 col-form-label"
						v-if="series != ''">Check Number</label>
					<div class="col-sm-8"
						v-if="checkSeries != ''">
						<base-input v-model="checkNumber"
							id="checkNumber"
							type="text"
							class="form-control-plaintext"
							placeholder="Check Number" readonly></base-input>
					</div>
					<label for="clientName"
						class="col-sm-3 col-form-label">Client Name</label>
					<div class="col-sm-8">
						<base-input v-model="clientName"
							id="clientName"
							type="text"
							class="form-control-plaintext"
							placeholder="Client Name"></base-input>
						<i class="text-danger"
							v-if="$v.clientName.$anyDirty && !$v.clientName.required">Field Required</i>
						<i class="text-danger"
							v-if="$v.clientName.$anyDirty && !$v.clientName.alphaCustomValidator">Invalid Characters</i>
					</div>
					<label for="checkPayee"
						class="col-sm-3 col-form-label">Check Payee</label>
					<div class="col-sm-8">
						<base-input v-model="checkPayee"
							id="checkPayee"
							type="text"
							class="form-control-plaintext"
							placeholder="Check Payee"></base-input>
						<i class="text-danger"
							v-if="$v.checkPayee.$anyDirty && !$v.checkPayee.required">Field Required</i>
						<i class="text-danger"
							v-if="$v.checkPayee.$anyDirty && !$v.checkPayee.alphaCustomValidator">Invalid Characters</i>
					</div>
					<label for="referenceNumber"
						class="col-sm-3 col-form-label">Reference Number</label>
					<div class="col-sm-8">
						<base-input v-model="referenceNumber"
							id="referenceNumber"
							type="text"
							class="form-control-plaintext"
							placeholder="Reference Number"></base-input>
						<i class="text-danger"
							v-if="$v.referenceNumber.$anyDirty && !$v.referenceNumber.required">Field Required</i>
						<i class="text-danger"
							v-if="$v.referenceNumber.$anyDirty && !$v.referenceNumber.numCustomValidator">Invalid Characters</i>
					</div>
					<label for="checkDate"
						class="col-sm-3 col-form-label">Check Date</label>
					<div class="col-sm-8">
						<base-input v-model="checkDate"
							id="checkDate"
							type="date"
							class="form-control-plaintext"
							placeholder="Check Date"></base-input>
						<i class="text-danger"
							v-if="$v.checkDate.$anyDirty && !$v.checkDate.required">Field Required</i>
					</div>
					<label for="amount"
						class="col-sm-3 col-form-label">Amount</label>
					<div class="col-sm-8">
						<base-input v-model="amount"
							id="amount"
							type="text"
							class="form-control-plaintext"
							placeholder="Amount"></base-input>
						<i class="text-danger"
							v-if="$v.amount.$anyDirty && !$v.amount.required">Field Required</i>
						<i class="text-danger"
							v-if="$v.amount.$anyDirty && !$v.amount.amountCustomValidator">Invalid Characters</i>
					</div>
				</div><hr>
				<div class="text-center">
					<base-button type="danger" outline
						class="col-md-2 ml-2"
						@click.native="cancelUpdateCheck">Cancel</base-button>
					<base-button type="success"
						class="col-md-2 ml-2"
						@click.native="updateCheck"
						v-if="activateBankAccounts != '' &&  checkSeries != ''">Save</base-button>
				</div>
			</card>
		</div>
	</div>
</template>
<script>
	import {api} from '@/main';
	import {helpers, required} from "vuelidate/lib/validators";

	const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9. ]*$/);
	const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z ]*$/);

	export default {
		components: {},
		data() {
			return {
				banks: [],
				activateBanks: [],
				activateBankAccounts: [],
				departments: [],
				checkStatus: [
					{"status": 'Pending'},
					{"status": 'Bank-In'},
					{"status": 'Bounced'},
					{"status": 'Cancelled'}
				],
				checkSeries: [],
				userRole: '',
				checkNumber: '',
				referenceNumber: '',
				checkDate: '',
				amount: '',
				clientName: '',
				checkPayee: '',
				radioCheckDateType: "",
				department : '',
				checkStat: '',
				bank: '',
				bankAccount: '',
				series: '',
				requestProcessing: false,
			};
		},
		validations: {
			referenceNumber: {
				required,
				numCustomValidator
			},
			checkDate: {required},
			amount: {
				required,
				amountCustomValidator
			},
			clientName: {
				required,
				alphaCustomValidator
			},
			checkPayee: {
				required, alphaCustomValidator
			},
			department: {required},
			checkStat: {required},
			bank: {required},
			bankAccount: {required},
			series: {required},
		},
		async mounted(){
			this.getCheck(this.$router.currentRoute.params.id);
			this.checkToken();
			this.getDepartments();
		},
		methods: {
			checkToken(){
				let self = this;

				if(!localStorage.getItem('aistoken')){
					self.$router.push("/login");
					localStorage.removeItem('aisname');
				}else{
					fetch(api + '/users/check/account/token/' + localStorage.getItem('aisname'))
					.then(function(response) {
						return response.json();
					}).then(function(response) {
						if(response.success) {
							let getToken = response.output.username + '' + response.output.key;

							if(getToken != localStorage.getItem('aistoken')){
								localStorage.removeItem('aistoken');
								localStorage.removeItem('aisname');
								self.$router.push("/login");
							}
						}else if(!response.success){
							localStorage.removeItem('aistoken');
							localStorage.removeItem('aisname');
							self.$router.push("/login");
						}
					});
				}
			},
			getActivateBanks(change){
				let self = this;

				self.activateBanks = [];
				fetch(api + '/banks/bank/get/activate').then(function(response) {
					return response.json();
				}).then(function(response) {
					if(response.success) {
						self.activateBanks = response.output.banks;
						self.getActivateBankAccounts(self.bank, change);
					}
				}).catch(function(error) {
					console.log(error);
					self.loadError = true;
				});
			},
			getActivateBankAccounts(bank, change){
				let self = this;

				self.activateBankAccounts = [];
				fetch(api + '/banks/account/get/activate/' + bank).then(function(response) {
					return response.json();
				}).then(function(response) {
					if(response.success) {
						self.activateBankAccounts = response.output.bankAccounts;
						self.bankAccount = response.output.bankAccounts[0].bankAccountUid;
						self.getCheckSeries(self.bank, self.bankAccount, change);
					}
				}).catch(function(error) {
					console.log(error);
					self.loadError = true;
				});
			},
			getCheckSeries(bank, bankAccount, change){
				let self = this;

				self.checkSeries = [];
				fetch(api + '/banks/check/get/all/' + bank + '/' + bankAccount).then(function(response){
					return response.json();
				}).then(function(response) {
					if(response.success) {
						self.checkSeries = response.output.checkSeries;
						self.series = response.output.checkSeries[0].bankCheckSeriesUid;
						if(change == 'yes'){
							self.getCheckNumber(self.bank, self.bankAccount, self.series);
						}
					}
				}).catch(function(error) {
					console.log(error);
					self.loadError = true;
				});
			},
			getCheckNumber(bank, bankAccount, series){
				let self = this;

				fetch(api + '/banks/check/number/get/' + bank + '/' + bankAccount + '/' + series).then(function(response) {
					return response.json();
				}).then(function(response) {
					if(response.success) {
						self.checkNumber = parseInt(response.output.checkNumber) + 1;
					}
				}).catch(function(error) {
					console.log(error);
					self.loadError = true;
				});
			},
			getCheck(checkID){
				if(checkID == ''){
					self.$swal({title: 'Warning', text: 'The check ID is missing.', icon: 'warning', confirmButtonColor: '#096b85', confirmButtonText: 'OK'})
					.then(() => {
						self.cancelUpdateCheck();
					});
				}else if (checkID != '') {
					let self = this;

					fetch(api + '/banks/check/get/' + checkID).then(function(response){
						return response.json();
					}).then(function(response) {
						if(response.success) {
							self.checkNumber = response.output.check.bankCheckNumber;
							self.referenceNumber = response.output.check.referenceNumber;
							self.checkDate = response.output.check.bankCheckDate;
							self.amount = response.output.check.bankCheckAmount;
							self.clientName = response.output.check.clientName;
							self.checkPayee = response.output.check.checkPayee;
							self.radioCheckDateType = response.output.check.bankCheckDateType;
							self.department = response.output.check.departmentReference;
							self.checkStat = response.output.check.checkStatus;
							self.bank = response.output.check.bankReference;
							self.bankAccount = response.output.check.bankAccountReference;
							self.series = response.output.check.bankCheckSeriesReference;
							self.getActivateBanks('no');
						}
					}).catch(function(error) {
						console.log(error);
						self.loadError = true;
					});
				}
			},
			getDepartments(){
				let self = this;

				self.departments = [];
				fetch(api + '/banks/check/get/departments').then(function(response) {
					return response.json();
				}).then(function(response) {
					if(response.success) {
						self.departments = response.output.departments;
					}
				}).catch(function(error) {
					console.log(error);
				});
			},
			cancelUpdateCheck(){
				this.$router.push("/view/check/" + this.$router.currentRoute.params.id);
			},
			updateCheck(){
				let self = this;   
				let addError = true;

				self.requestProcessing = false;
				self.$v.referenceNumber.$touch();
				self.$v.checkDate.$touch();
				self.$v.amount.$touch();
				self.$v.clientName.$touch();
				self.$v.checkPayee.$touch();
				self.$v.department.$touch();
				self.$v.checkStat.$touch();
				self.$v.bank.$touch();
				self.$v.bankAccount.$touch();
				self.$v.series.$touch();
				if(!self.$v.referenceNumber.$error && !self.$v.checkDate.$error && !self.$v.amount.$error && !self.$v.clientName.$error && !self.$v.checkPayee.$error && !self.$v.department.$error && !self.$v.checkStat.$error && !self.$v.bank.$error && !self.$v.bankAccount.$error && !self.$v.series.$error){
					addError = false;
				}
				if(!addError){
					self.requestProcessing = true;
					let updateCheck = {
						checkUid: self.$router.currentRoute.params.id,
						checkNumber: self.checkNumber,
						referenceNumber: self.referenceNumber,
						checkDate: self.checkDate,
						checkAmount: self.amount,
						clientName: self.clientName,
						checkPayee: self.checkPayee,
						checkDateType: self.radioCheckDateType,
						department: self.department,
						checkStatus: self.checkStat,
						bank: self.bank,
						bankAccount: self.bankAccount,
						checkSeries: self.series
					}

					fetch(api + '/banks/check/update/',{
						method: 'post',
						body: JSON.stringify(updateCheck),
						headers: { 'Content-Type': 'application/json' }
					}).then( response => {
						return response.json();
					}).then(data => {
						if(data.success) {
							self.$swal({title: 'Success', text: 'Check updated successfully!', icon: 'success', confirmButtonColor: '#096b85', confirmButtonText: 'OK'})
							.then(() => {
								self.$router.push("/view/check/" + self.$router.currentRoute.params.id);
							});
						} else {
							self.requestProcessing = false;
							self.$swal({title: 'Error', text: data.errorMessage, icon: 'error', confirmButtonColor: '#f5365c', confirmButtonText: 'OK'});
						}
					}).then(function() {
						self.requestProcessing = false;
					});
				}
			},
		}
	};
</script>