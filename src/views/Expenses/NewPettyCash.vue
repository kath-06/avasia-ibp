<template>
	<!-- New petty cash form -->
	<card>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Date:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Departments:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newDate"
					type="date"
					id="inputStyle"
					:max="maxDate"></base-input>
				<i class="text-red"
					v-if="$v.newDate.$anyDirty && !$v.newDate.required">Field Required</i>
			</div>
			<div class="col-sm-6 pl-5 pr-5">
				<v-select id="inputStyle"
					:options="departments"
					:reduce="department => department.departmentUid"
					label="departmentName"
					v-model="newDepartment"
					:clearable="false"
					@input="getNames(newDepartment)"></v-select>
				<i class="text-red"
					v-if="$v.newDepartment.$anyDirty && !$v.newDepartment.required">Field Required</i>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>To:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>From:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5"
				v-if="names.length != 0">
				<v-select id="inputStyle"
					:options="names"
					:reduce="name => name.userId"
					label="name"
					v-model="newTo"
					:clearable="false"></v-select>
				<i class="text-red"
					v-if="$v.newTo.$anyDirty && !$v.newTo.required">Field Required</i>
			</div>
			<div class="col-sm-6 pl-5 pr-5"
				v-if="names.length == 0">
				<span class="text-red">No Employee</span>
			</div>
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newFrom"
					type="text"
					placeholder="From"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newFrom.$anyDirty && !$v.newFrom.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newFrom.$anyDirty && !$v.newFrom.alphaCustomValidator">Invalid Characters</i>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Amount Received:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Total Petty Cash:</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newAmount"
					type="text"
					placeholder="Amount Received"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newAmount.$anyDirty && !$v.newAmount.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newAmount.$anyDirty && !$v.newAmount.amountCustomValidator">Invalid Characters</i>
			</div>
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newTotalPetty"
					type="text"
					placeholder="Total Petty Cash"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newTotalPetty.$anyDirty && !$v.newTotalPetty.amountCustomValidator">Invalid Characters</i>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Type:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Received by:</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<v-select id="inputStyle"
					:options="types"
					:reduce="type => type.typeId"
					label="typeName"
					v-model="newType"
					:clearable="false"></v-select>
				<i class="text-red"
					v-if="$v.newType.$anyDirty && !$v.newType.required">Field Required</i>
			</div>
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newReceivedBy"
					type="text"
					placeholder="Received by"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newReceivedBy.$anyDirty && !$v.newReceivedBy.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newReceivedBy.$anyDirty && !$v.newReceivedBy.alphaCustomValidator">Invalid Characters</i>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label"
				v-if="newType == 'check'">
				<b>Check No:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class=" col-sm-4 pl-5"	
				v-if="newType == 'check'">
				<base-input v-model="newCheckNumber"
					id="inputStyle"
					type="text"
					placeholder="Check Number"
					class="mb-0"
					@input="clearCheck"></base-input>
				<i class="text-red"
					v-if="$v.newCheckNumber.$anyDirty && !$v.newCheckNumber.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newCheckNumber.$anyDirty && !$v.newCheckNumber.numCustomValidator">Invalid Characters</i>
			</div>
			<div class=" col-sm-2 pr-5"
				v-if="newType == 'check'">
				<base-button block id="darkBtn"
					v-b-modal.choose-check-number-modal
					:disabled="requestProcessing">Choose</base-button>
			</div>
		</div>
		<hr>
		<div class="text-right">
			<base-button id="darkBtn"
				class="col-md-2 ml-2"
				@click.native="addPettyCash"
				:disabled="requestProcessing">Save</base-button>
		</div>
		<!-- CHOOSE CHECK NUMBER MODAL -->
		<b-modal size="lg"
			id="choose-check-number-modal"
			title="Choose Check Number" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Bank Name:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Bank Account:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="banks"
						:reduce="bank => bank.bankUid"
						label="bank"
						v-model="bank"
						@input="getBankAccounts(bank)"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.bank.$anyDirty && !$v.bank.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5"
					v-if="bankAccounts == ''">
					<span class="text-red">No Bank Account</span>
				</div>
				<div class="col-sm-6 pl-5 pr-5" v-else>
					<v-select id="inputStyle"
						:options="bankAccounts"
						:reduce="bankAccount => bankAccount.bankAccountUid"
						label="bankAccountNumber"
						v-model="bankAccount"
						@input="getCheckSeries(bank, bankAccount)"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.bankAccount.$anyDirty && !$v.bankAccount.required">Field Required</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Check Series:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Check Number:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5"
					v-if="checkSeries == '' || bankAccounts == ''">
					<span class="text-red">No Check Series</span>
				</div>
				<div class="col-sm-6 pl-5 pr-5" v-else>
					<v-select input="inputStyle"
						:options="checkSeries"
						:reduce="series => series.bankCheckSeriesUid"
						label="bankCheckSeries"
						v-model="series"
						@input="getCheckNumber(bank, bankAccount, series, 'used')"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.series.$anyDirty && !$v.series.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5"
					v-if="checkSeries == '' || bankAccounts == '' || checkNumbers == ''">
					<span class="text-red">No Check Number</span>
				</div>
				<div class="col-sm-6 pl-5 pr-5" v-else>
					<v-select id="inputStyle"
						:options="checkNumbers"
						:reduce="checkNumber => checkNumber.checkNumber"
						label="checkNumber"
						v-model="checkNumber"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.checkNumber.$anyDirty && !$v.checkNumber.required">Field Required</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="chooseCheckNumber"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							OK
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('choose-check-number-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
	</card>
</template>
<script>
	import {dbUsers, db, dbMains, dbExpense} from '@/main';
	import {helpers, required} from "vuelidate/lib/validators";

	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ,. ]*$/);
	const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ -.A-Za-z ]*$/);
	const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
	const moment  = require('moment');
	const today = new Date();
	const addZero = require('add-zero');

	export default {
		name: "new-petty-cash",
		components: {},
		data() {
			return {
				// New petty cash
				newDate: moment().format("YYYY-MM-DD"),
				maxDate: moment().format("YYYY-MM-DD"),
				departments: [],
				names: [],
				newDepartment: '',
				newTo: '',
				newFrom: '',
				newAmount: '',
				newTotalPetty: '',
				types: [
					{"typeId": 'cash', "typeName": 'Cash'},
					{"typeId": 'check', "typeName": 'Check'}
				],
				newType: 'cash',
				newReceivedBy: '',
				newCheckNumber: '',
				newCheckReference: '',
				banks: [],
				bank: '',
				bankAccounts: [],
				bankAccount: '',
				checkSeries: [],
				series: '',
				checkNumbers: [],
				checkNumber: '',
				requestProcessing: false
			};
		},
		validations: {
			// New petty cash validations
			newDate: {required},
			newDepartment: {required},
			newTo: {required},
			newFrom: {
				required,
				alphaCustomValidator
			},
			newAmount: {
				required,
				amountCustomValidator
			},
			newTotalPetty: {amountCustomValidator},
			newType: {required},
			newReceivedBy: {
				required,
				alphaCustomValidator
			},
			newCheckNumber: {
				required,
				numCustomValidator
			},
			bank: {required},
			bankAccount: {required},
			series: {required},
			checkNumber: {required}
		},
		async mounted(){
			this.getDepartments();
			this.getBanks();
		},
		methods: {
			// Get department details
			getDepartments(){
				let self = this;
				let departmentData = dbUsers.collection("departments")
					.orderBy("departmentName", "asc");

				self.departments = [];
				departmentData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.departments.push(doc.data());
					});
					self.newDepartment = self.departments[0].departmentUid;
					this.getNames(self.departments[0].departmentUid);
				});
			},
			// Get employee names
			getNames(department){
				let self = this;
				let nameData = dbUsers.collection("users")
					.where("status","==",1)
					.where("departmentReference","==",department)
					.orderBy("lastname", "asc");

				self.names = [];
				nameData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.names.push(doc.data());
					});
					for(let a = 0; a < self.names.length; a++){
						self.names[a]["name"] = self.names[a].lastname + ', ' + self.names[a].firstname;
					}
					if(self.names.length != 0){
						self.newTo = self.names[0].userId;
					}
				});
			},
			// Clear check input value
			clearCheck(){
				this.checkReference = '';
			},
			// Get bank details
			getBanks(){
				let self = this;
				let bankData = dbMains.collection("banks")
					.orderBy("bank", "asc");

				self.banks = [];
				bankData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.banks.push(doc.data());
					});
					self.bank = self.banks[0].bankUid;
					self.getBankAccounts(self.banks[0].bankUid);
				});
			},
			// Get bank account details
			getBankAccounts(bank){
				let self = this;
				let bankAccountData = dbMains.collection("bankAccounts")
					.where("bankReference", "==", bank)
					.orderBy("bankAccountNumber", "asc");

				self.bankAccounts = [];
				bankAccountData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.bankAccounts.push(doc.data());
					});
					self.bankAccount = self.bankAccounts[0].bankAccountUid;
					self.getCheckSeries(self.bank, self.bankAccount);
				});
			},
			// Get check series details
			getCheckSeries(bank, bankAccount){
				let self = this;
				let bankCheckSeriesData = dbMains.collection("bankCheckSeries")
					.where("bankReference", "==", bank)
					.where("bankAccountReference", "==", bankAccount)
					.orderBy("bankCheckSeries", "asc");

				self.checkSeries = [];
				bankCheckSeriesData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.checkSeries.push(doc.data());
					});
					self.series = self.checkSeries[0].bankCheckSeriesUid;
					self.getCheckNumber(self.bank, self.bankAccount, self.series, 'used');
				});
			},
			// Get check number details
			getCheckNumber(bank, bankAccount, series, status){
				let self = this;
				let bankCheckNumberData = db.collection("bankCheckSeriesReports")
					.where("bankReference", "==", bank)
					.where("bankAccountReference", "==", bankAccount)
					.where("checkSeriesReference", "==", series)
					.where("status", "==", status)
					.orderBy("checkNumber", "asc");

				self.checkNumbers = [];
				self.checkNumber = '';
				bankCheckNumberData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							self.checkNumbers.push(doc.data());
						}
					});
					if(self.checkNumbers.length != 0){
						self.checkNumber = self.checkNumbers[0].checkNumber;
					}
				});
			},
			// Select check number
			chooseCheckNumber(){
				let self = this;

				self.newCheckNumber = self.checkNumber;
				for(let a = 0; a < self.checkNumbers.length; a++){
					if(self.checkNumber == self.checkNumbers[a].checkNumber){
						self.newCheckReference = self.checkNumbers[a].checkReference;
					}
				}
				self.$bvModal.hide('choose-check-number-modal');
			},
			// Save new petty cash details
			addPettyCash(){
				let self = this;

				try{
					self.requestProcessing = false;
					self.$v.newDate.$touch();
					self.$v.newDepartment.$touch();
					self.$v.newTo.$touch();
					self.$v.newFrom.$touch();
					self.$v.newAmount.$touch();
					self.$v.newTotalPetty.$touch();
					self.$v.newType.$touch();
					self.$v.newCheckNumber.$touch();
					let addError = false;

					if(self.newType == 'cash'){
						if(self.$v.newDate.$error && self.$v.newDepartment.$error && self.$v.newTo.$error && self.$v.newFrom.$error && self.$v.newAmount.$error && self.$v.newTotalPetty.$error){
							addError = true;
						}
					}else if(self.newType == 'check'){
						if(self.$v.newDate.$error && self.$v.newDepartment.$error && self.$v.newTo.$error && self.$v.newFrom.$error && self.$v.newAmount.$error && self.$v.newTotalPetty.$error && self.$v.newCheckNumber.$error){
							addError = true;
						}
					}
					if(!addError){
						self.requestProcessing = true;
						let getUserData = dbUsers.collection("users")
							.where("username","==",localStorage.getItem("aisname"));
						let pettyCashData = dbExpense.collection("pettyCash")
							.orderBy("pettyCashDate","desc");
						let users = [], petty = [], prevPetty = [];
						let dataId = "PCID-" + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
						let checkPetty =dbExpense.collection("pettyCash")
							.where("departmentReference","==",self.newDepartment)
							.orderBy("pettyCashNumber","desc");

						checkPetty.limit(1).get().then((querySnapshot) => {
							if(!querySnapshot.empty){
								querySnapshot.forEach((doc) => {
									prevPetty.push(doc.data());
								});
								if(prevPetty[0].status == 1 || prevPetty[0].status == 2){
									self.requestProcessing = false;
									self.$swal({
										title: 'Not valid',
										text: 'You have current petty cash.',
										icon: 'error',
										confirmButtonColor: '#b80000',
										confirmButtonText: 'OK'
									});
								}else if(prevPetty[0].status == 3){
									getUserData.get().then((querySnapshot) => {
										querySnapshot.forEach((doc) => {
											if(doc.exists){
												users.push(doc.data());
											}
										});
										pettyCashData.limit(1).get().then((querySnapshot) => {
											querySnapshot.forEach((doc) => {
												if(doc.exists){
													petty.push(doc.data());
												}
											});
											let lastPetty = '';
											let genPettyNo = new Date();
											let cash = parseFloat(self.newAmount.replaceAll(",","") + parseFloat(prevPetty[0].cashOnHand.replaceAll(",","")));

											cash = parseFloat(cash).toFixed(2);
											if(petty.length != 0){
												lastPetty = addZero(parseInt(petty[0].pettyCashNumber.slice(5)) + 1, 2);
												if(lastPetty.toString() == '100'){
													lastPetty = '01';
												}
											}else{
												lastPetty = '01';
											}
											dbExpense.collection("pettyCash").doc()
											.set({
												pettyCashId: dataId,
												pettyCashNumber: addZero(genPettyNo.getMonth() + 1) + '' + (genPettyNo.getFullYear().toString()).slice(2,4) + '-' + lastPetty,
												pettyCashDate: self.newDate,
												amountReceive: self.newAmount,
												totalPetty: self.newTotalPetty,
												type: self.newType,
												cashOnHand: cash,
												departmentReference: self.newDepartment,
												nameToReference: self.newTo,
												from: self.newFrom,
												receivedBy: self.newReceivedBy,
												checkReference: self.newCheckReference,
												status: 1,
												userReference: users[0].userId,
												dateCreated: today,
												dateModified: today
											}).then(() => {
												self.newDate = moment().format("YYYY-MM-DD");
												self.newAmount = '';
												self.newTotalPetty = '';
												self.newType = 'cash';
												self.newDepartment = '';
												self.newTo = '';
												self.newFrom = '';
												self.newReceivedBy = '';
												self.newCheckNumber = '';
												self.newCheckReference = '';
												self.$v.newDate.$reset();
												self.$v.newDepartment.$reset();
												self.$v.newAmount.$reset();
												self.$v.newTotalPetty.$reset();
												self.$v.newType.$reset();
												self.$v.newTo.$reset();
												self.$v.newFrom.$reset();
												self.$v.newCheckNumber.$reset();
												self.requestProcessing = false;
												self.$swal({
													title: 'Success',
													text: 'New Petty Cash added successfully!',
													icon: 'success',
													confirmButtonColor: '#b80000',
													confirmButtonText: 'OK'
												}).then(() => {
													self.$router.push("/view/petty/cash/" + dataId);
												});
											});
										});
									});
								}
							}else if(querySnapshot){
								getUserData.get().then((querySnapshot) => {
									querySnapshot.forEach((doc) => {
										if(doc.exists){
											users.push(doc.data());
										}
									});
									pettyCashData.limit(1).get().then((querySnapshot) => {
										querySnapshot.forEach((doc) => {
											if(doc.exists){
												petty.push(doc.data());
											}
										});
										let lastPetty = '';
										let genPettyNo = new Date();

										if(petty.length != 0){
											lastPetty = addZero(parseInt(petty[0].pettyCashNumber.slice(5)) + 1, 2);
											if(lastPetty.toString() == '100'){
												lastPetty = '01';
											}
										}else{
											lastPetty = '01';
										}
										dbExpense.collection("pettyCash").doc()
										.set({
											pettyCashId: dataId,
											pettyCashNumber: addZero(genPettyNo.getMonth() + 1) + '' + (genPettyNo.getFullYear().toString()).slice(2,4) + '-' + lastPetty,
											pettyCashDate: self.newDate,
											amountReceive: self.newAmount,
											type: self.newType,
											cashOnHand: self.newAmount,
											departmentReference: self.newDepartment,
											nameToReference: self.newTo,
											from: self.newFrom,
											receivedBy: self.newReceivedBy,
											checkReference: self.newCheckReference,
											status: 1,
											userReference: users[0].userId,
											dateCreated: today,
											dateModified: today
										}).then(() => {
											self.newDate = moment().format("YYYY-MM-DD");
											self.newAmount = '';
											self.newType = 'cash';
											self.newDepartment = '';
											self.newTo = '';
											self.newFrom = '';
											self.newReceivedBy = '';
											self.newCheckNumber = '';
											self.newCheckReference = '';
											self.$v.newDate.$reset();
											self.$v.newDepartment.$reset();
											self.$v.newAmount.$reset();
											self.$v.newType.$reset();
											self.$v.newTo.$reset();
											self.$v.newFrom.$reset();
											self.$v.newCheckNumber.$reset();
											self.requestProcessing = false;
											self.$swal({
												title: 'Success',
												text: 'New Petty Cash added successfully!',
												icon: 'success',
												confirmButtonColor: '#b80000',
												confirmButtonText: 'OK'
											}).then(() => {
												self.$router.push("/view/petty/cash/" + dataId);
											});
										});
									});
								});
							}
						});
					}
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
			},
		}
	};
</script>
<style type="text/css">
	.form-control {height: calc(1.5em + 0.50rem + 2px);}
	.form-group {margin-bottom: 0rem}
</style>