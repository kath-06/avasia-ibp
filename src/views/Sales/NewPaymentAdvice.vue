<template>
	<card>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Distributors:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Date:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-4 pl-5">
				<v-select id="inputStyle"
					:options="distributors"
					:reduce="distri => distri.distributorId"
					label="distributorName"
					v-model="newDistributor"
					:clearable="false"></v-select>
				<i class="text-red"
					v-if="$v.newDistributor.$anyDirty && !$v.newDistributor.required">Field Required</i>
			</div>
			<div class=" col-sm-2 pr-5">
				<base-button block id="darkBtn"
					v-b-modal.add-distributor-modal>Add</base-button>
			</div>
			<div class=" col-sm-6 pl-5 pr-5">
				<base-input v-model="newDate"
					id="inputStyle"
					type="date"
					placeholder="Date"
					class="mb-0"></base-input>
				<i class="text-red"
					v-if="$v.newDate.$anyDirty && !$v.newDate.required">Field Required</i>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>CR Number:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Check Number:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class=" col-sm-6 pl-5 pr-5">
				<base-input v-model="newCRNumber"
					id="inputStyle"
					type="text"
					placeholder="CR Number"
					class="mb-0"></base-input>
				<i class="text-red"
					v-if="$v.newCRNumber.$anyDirty && !$v.newCRNumber.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newCRNumber.$anyDirty && !$v.newCRNumber.alphaNumCustomValidator">Invalid Characters</i>
			</div>
			<div class=" col-sm-4 pl-5">
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
			<div class=" col-sm-2 pr-5">
				<base-button block id="darkBtn"
					v-b-modal.choose-check-number-modal>Choose</base-button>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Payment Amount:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class=" col-sm-6 pl-5 pr-5">
				<base-input v-model="newPaymentAmount"
					id="inputStyle"
					type="text"
					placeholder="Payment Amount"
					class="mb-0"
					readonly></base-input>
				<i class="text-red"
					v-if="$v.newPaymentAmount.$anyDirty && !$v.newPaymentAmount.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newPaymentAmount.$anyDirty && !$v.newPaymentAmount.amountCustomValidator">Invalid Characters</i>
			</div>
		</div>
		<hr>
		<div class="card-header bg-transparent pb-2">
			<div class="text-left">
				<h2 class="display-5"
					id="sideBarTxt">Particulars</h2>
			</div>
		</div>
		<card class="pl-2 pr-2 shadow">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>PO Number:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Invoice Number:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5 pb-0">
					<base-input v-model="newPONumber"
						type="text"
						id="inputStyle"
						placeholder="PO Number"></base-input>
					<i class="text-red"
						v-if="$v.newPONumber.$anyDirty && !$v.newPONumber.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newPONumber.$anyDirty && !$v.newPONumber.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5 pb-0">
					<base-input v-model="newInvoiceNumber"
						type="text"
						id="inputStyle"
						placeholder="Invoice Number"></base-input>
					<i class="text-red"
						v-if="$v.newInvoiceNumber.$anyDirty && !$v.newInvoiceNumber.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newInvoiceNumber.$anyDirty && !$v.newInvoiceNumber.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Invoice Date:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Invoice Amount:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5 pb-0">
					<base-input v-model="newInvoiceDate"
						type="date"
						id="inputStyle"
						placeholder="Invoice Date"></base-input>
					<i class="text-red"
						v-if="$v.newInvoiceDate.$anyDirty && !$v.newInvoiceDate.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5 pb-0">
					<base-input v-model="newInvoiceAmount"
						type="text"
						id="inputStyle"
						placeholder="Invoice Amount"></base-input>
					<i class="text-red"
						v-if="$v.newInvoiceAmount.$anyDirty && !$v.newInvoiceAmount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newInvoiceAmount.$anyDirty && !$v.newInvoiceAmount.amountCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Withholding Tax:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5 pb-0">
					<v-select id="inputStyle"
						:options="wths"
						:reduce="wth => wth.withholdingTaxCodeId"
						label="withholdingTaxCode"
						v-model="newWTH"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.newWTH.$anyDirty && !$v.newWTH.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-button block
						id="darkBtn"
						@click.native="addParticular"
						:disabled="requestProcessing">
						<i v-if="requestProcessing"
							class="fa fa-spinner fa-spin"></i>
						Add
					</base-button>
				</div>
			</div>
		</card>
		<div class="table-full-width pt-2">
			<paper-table type="hover"
				:loading="false"
				:loadError="loadError"
				@reloadData="reloadData"
				:title="particularsTable.title"
				:sub-title="particularsTable.subTitle"
				:data="particulars"
				:columns="particularsTable.columns">
				<template slot-scope="{ row }">
					<td>{{row.rowNum}}</td>
					<td>{{row.poNumber}}</td>
					<td>{{row.invoiceNumber}}</td>
					<td>{{row.invoiceDate}}</td>
					<td>₱ {{row.invoiceAmount}}</td>
					<td>{{row.wht}}</td>
					<td>₱ {{row.amountPaid}}</td>
					<td align="right">
						<span class="pointer ml-2 far fa-times-circle text-red"
							v-on:click="removeParticular(row)"
							v-if="row.rowNum != ''"
							title="Remove"></span>
					</td>
				</template>
			</paper-table>
		</div>
		<hr>
		<div class="text-center">
			<base-button id="darkBtn"
				class="col-md-2 ml-2"
				@click.native="addPaymentAdvice"
				v-if="distributors != '' &&  particulars != '' && wths.length != 0">Save</base-button>
		</div>
		<!-- ADD DISTRIBUTOR MODAL -->
		<b-modal size="lg"
			id="add-distributor-modal"
			title="New Distributor" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Distributor Name:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Tin Number:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newDistriName"
						id="inputStyle"
						type="text"
						placeholder="Distributor Name"></base-input>
					<i class="text-red"
						v-if="$v.newDistriName.$anyDirty && !$v.newDistriName.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newDistriName.$anyDirty && !$v.newDistriName.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newTinNumber"
						id="inputStyle"
						type="text"
						placeholder="Tin Number"></base-input>
					<i class="text-red"
						v-if="$v.newTinNumber.$anyDirty && !$v.newTinNumber.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newTinNumber.$anyDirty && !$v.newTinNumber.tinNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-12 col-form-label">
					<b>Address:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-12 pl-5 pr-5">
					<textarea rows="4"
						cols="39"
						v-model="newAddress"
						id="inputStyle"
						class="pl-2"
						placeholder="Address"></textarea>
					<i class="text-red"
						v-if="$v.newAddress.$anyDirty && !$v.newAddress.required">Field Required</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addDistributor"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('add-distributor-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
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
	import {dbMains, dbUsers, db, dbSales} from '@/main';
	import {helpers, required} from "vuelidate/lib/validators";
	import {upperCase} from "text-case";

	const moment  = require('moment');
	const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -./, A-Za-z0-9 ]*$/);
	const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9₱ ,. ]*$/);
	const tinNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -. 0-9 ]*$/);
	const tableColumns = ["#", "PO Number", "Invoice No.", "Invoice Date", "Invoice Amount", "WHT", "Amount Paid",  "Actions"];
	const today = new Date();
	const addZero = require('add-zero');
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');

	export default {
		name: "new-payment-advice",
		components: {},
		data() {
			return {
				distributors: [],
				newDistributor: '',
				newDate: moment().format("YYYY-MM-DD"),
				newCRNumber: '',
				newCheckNumber: '',
				newCheckReference: '',
				newPaymentAmount: '',
				newPONumber: '',
				newInvoiceNumber: '',
				newInvoiceDate: moment().format("YYYY-MM-DD"),
				newInvoiceAmount: '',
				wths: [],
				newWTH: '',
				loading: true,
				loadError: false,
				particularsTable: {
					title: "Particulars Table",
					subTitle: "",
					columns: [...tableColumns]
				},
				particulars: [],
				requestProcessing: false,
				newDistriName: '',
				newTinNumber: '',
				newAddress: '',
				banks: [],
				bank: '',
				bankAccounts: [],
				bankAccount: '',
				checkSeries: [],
				series: '',
				checkNumbers: [],
				checkNumber: ''
			};
		},
		validations: {
			newDistributor: {required},
			newDate: {required},
			newCRNumber: {
				required,
				alphaNumCustomValidator
			},
			newCheckNumber: {
				required,
				numCustomValidator
			},
			newPaymentAmount: {
				required,
				amountCustomValidator
			},
			newPONumber: {
				required,
				alphaNumCustomValidator
			},
			newInvoiceNumber: {
				required,
				alphaNumCustomValidator
			},
			newInvoiceDate: {required},
			newInvoiceAmount: {
				required,
				amountCustomValidator
			},
			newWTH: {required},
			newDistriName: {
				required,
				alphaNumCustomValidator
			},
			newTinNumber: {
				required,
				tinNumCustomValidator
			},
			newAddress: {required},
			bank: {required},
			bankAccount: {required},
			series: {required},
			checkNumber: {required}
		},
		async mounted(){
			this.getDistributors();
			this.getWTH();
			this.getBanks();
		},
		methods: {
			getDistributors(){
				let self = this;
				let distriData = dbMains.collection("distributors")
					.orderBy("distributorName", "asc");

				self.distributors = [];
				distriData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.distributors.push(doc.data());
					});
					self.newDistributor = self.distributors[0].distributorId;
				});
			},
			getWTH(){
				let self = this;
				let wthData = dbMains.collection("withholdingTaxCode")
					.orderBy("withholdingTaxCode","asc");

				self.wths = [];
				wthData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.wths.push(doc.data());
					});
					self.newWTH = self.wths[0].withholdingTaxCodeId;
				});
			},
			addDistributor(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newDistriName.$touch();
				self.$v.newTinNumber.$touch();
				self.$v.newAddress.$touch();
				if(!self.$v.newDistriName.$error && !self.$v.newTinNumber.$error && !self.$v.newAddress.$error){
					let distriData = null, tinData = null;

					self.requestProcessing = true;
					distriData = dbMains.collection('distributors')
						.where("distributorName", "==", upperCase(self.newDistriName));
					tinData = dbMains.collection('distributors')
						.where("tinNumber","==",self.newTinNumber);
					distriData.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) => {
								if(doc.exists){
									self.$swal({
										title: 'Invalid',
										text: 'Distributor already exists.',
										icon: 'error',
										confirmButtonColor: '#b80000',
										confirmButtonText: 'OK'
									});
									self.requestProcessing = false;
								}
							});
						}else if(querySnapshot){
							tinData.get().then((querySnapshot) => {
								if(!querySnapshot.empty){
									querySnapshot.forEach((doc) => {
										if(doc.exists){
											self.$swal({
												title: 'Invalid',
												text: 'Tin number already exists.',
												icon: 'error',
												confirmButtonColor: '#b80000',
												confirmButtonText: 'OK'
											});
											self.requestProcessing = false;
										}
									})
								}else if(querySnapshot){
									let getUserId = dbUsers.collection('users')
										.where("username", '==', localStorage.getItem('aisname'));
									let users = [];
									let dataId = 'WTC-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

									getUserId.get().then((querySnapshot) => {
										querySnapshot.forEach((doc) => {
											if(doc.exists){
												users.push(doc.data());
											}
										});
										try{
											dbMains.collection('distributors').doc()
											.set({
												distributorId: dataId,
												distributorName: upperCase(self.newDistriName),
												tinNumber: self.newTinNumber,
												address: self.newAddress,
												userReference: users[0].userId,
												status: 1,
												dateCreated: today,
												dateModified: today
											}).then(() => {
												self.newDistriName = '';
												self.newTinNumber = '';
												self.newAddress = '';
												self.requestProcessing = false;
												self.$v.newDistriName.$reset();
												self.$v.newTinNumber.$reset();
												self.$v.newAddress.$reset();
												self.$bvModal.hide('add-distributor-modal');
												self.getDistributors();
												self.$swal({
													title: 'Success',
													text: 'New distributor added successfully!',
													icon: 'success',
													confirmButtonColor: '#b80000',
													confirmButtonText: 'OK'
												});
											}).catch((error) => {
												console.log(error);
												self.requestProcessing = false;
												self.$swal({
													title: 'Error',
													text: 'Something went wrong. Please try again.',
													icon: 'error',
													confirmButtonColor: '#b80000',
													confirmButtonText: 'OK'
												});
											});
										}catch(error) {
											console.log(error);
										}
									});
								}
							});
						}
					});
				}
			},
			clearCheck(){
				this.checkReference = '';
			},
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
			getParticulars() {
				let self = this;

				self.loading = false;
				if(self.particulars.length != 0){
					let commaNumber = require('comma-number');
					let format = commaNumber.bindWith(',', '.');
					let compute = 0, amount = 0;

					self.loading = true;
					self.loadError = false;
					for(let j = 0; j < self.particulars.length; j++){
						amount = self.particulars[j].amountPaid.replaceAll(",","");
						compute += parseFloat(amount.replaceAll(",",""));
					}
					self.newPaymentAmount = '₱ ' + format(parseFloat(compute).toFixed(2));
					setTimeout(function() {
						self.loading = false;
					}, 1500);						
				}
			},
			reloadData() {
				this.getParticulars();
			},
			addParticular(){
				let self = this, addError = true;

				self.requestProcessing = false;
				self.$v.newPONumber.$touch();
				self.$v.newInvoiceNumber.$touch();
				self.$v.newInvoiceDate.$touch();
				self.$v.newInvoiceAmount.$touch();
				self.$v.newWTH.$touch();
				if(!self.$v.newPONumber.$error && !self.$v.newInvoiceNumber.$error && !self.$v.newInvoiceDate.$error && !self.$v.newInvoiceAmount.$error && !self.$v.newWTH.$error){
					addError = false;
				}
				if(!addError){
					self.requestProcessing = true;
					if(self.particulars.length == 0){
						self.particulars = [];
					}
					self.newInvoiceAmount.replaceAll(",","");
					self.newInvoiceAmount.replaceAll("₱","");
					self.newInvoiceAmount.replaceAll(" ","");
					let taxRate = '', computeWht = 0, amountPaid = 0;

					for(let a = 0; a < self.wths.length; a++){
						if(self.newWTH == self.wths[a].withholdingTaxCodeId){
							taxRate = parseFloat(self.wths[a].withholdingTaxRate).toFixed(2);
						}
					}
					computeWht = (parseFloat(self.newInvoiceAmount) / 1.12) * parseFloat(taxRate);
					amountPaid = parseFloat(self.newInvoiceAmount) - parseFloat(computeWht);
					let newParticular = {
						"rowNum": self.particulars.length + 1,
						"poNumber": self.newPONumber,
						"invoiceNumber": self.newInvoiceNumber,
						"invoiceDate": moment(self.newInvoiceDate).format('MM DD, YYYYY'),
						"invoiceAmount": format(parseFloat(self.newInvoiceAmount).toFixed(2)),
						"whtReference": self.newWTH,
						"wht": format(parseFloat(computeWht).toFixed(2)),
						"amountPaid": format(parseFloat(amountPaid).toFixed(2)),
						"status": 1
					}

					self.particulars.push(newParticular);
					self.$swal({
						title: 'Success',
						text: 'New Particular added successfully!',
						icon: 'success',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.newPONumber = '';
						self.newInvoiceNumber = '';
						self.newInvoiceDate = moment().format("YYYY-MM-DD");
						self.newInvoiceAmount = '';
						self.newWTH = '';
						self.$v.newPONumber.$reset();
						self.$v.newInvoiceNumber.$reset();
						self.$v.newInvoiceDate.$reset();
						self.$v.newInvoiceAmount.$reset();
						self.$v.newWTH.$reset();
						self.getParticulars();
						self.getWTH();
					});
					self.requestProcessing = false;
				}
			},
			removeParticular(particular){
				let self = this;

				this.$swal({
					title: 'Are you sure?',
					text: "You want to remove this Particular",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#C72111',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						self.particulars.splice((parseInt(particular.rowNum) - 1) , 1);
						self.$swal({
							title: 'Success',
							text: 'Particular delete successfully!',
							icon: 'success',
							confirmButtonColor: '#b80000',
							confirmButtonText: 'OK'
						});
						self.requestProcessing = false;
						self.getParticulars();
					}
				});
			},
			addPaymentAdvice(){
				let self = this;

				self.requestProcessing = true;
				this.$swal({
					title: 'Are you sure?',
					text: "You want to save this payment advice",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#C72111',
					confirmButtonText: 'CONFIRM',
				}).then((result) => {
					if(result.value){
						self.requestProcessing = false;
						self.$v.newDate.$touch();
						self.$v.newCRNumber.$touch();
						self.$v.newCheckNumber.$touch();
						self.$v.newPaymentAmount.$touch();
						self.$v.newDistributor.$touch();
						if(!self.$v.newDate.$error && !self.$v.newCRNumber.$error && !self.$v.newCheckNumber.$error && !self.$v.newPaymentAmount.$error && !self.$v.newDistributor.$error){
							let paymentAdviceData = null;

							paymentAdviceData = db.collection('paymentAdvice')
								.where("crNumber", "==", self.newCRNumber);
							paymentAdviceData.get().then((querySnapshot) => {
								if(!querySnapshot.empty){
									querySnapshot.forEach((doc) => {
										if(doc.exists){
											self.$swal({
												title: 'Invalid',
												text: 'CR Number already exists.',
												icon: 'error',
												confirmButtonColor: '#b80000',
												confirmButtonText: 'OK'
											});
											self.requestProcessing = false;
										}
									});
								}else if(querySnapshot){
									let getUserId = dbUsers.collection('users')
										.where("username", '==', localStorage.getItem('aisname'));
									let users = [];

									getUserId.get().then((querySnapshot) => {
										querySnapshot.forEach((doc) =>{
											users.push(doc.data());
										});
										let dataId = 'PAI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

										self.newPaymentAmount = self.newPaymentAmount.replaceAll(',',"");
										self.newPaymentAmount = self.newPaymentAmount.replaceAll('₱',"");
										try{
											dbSales.collection('paymentAdvice').doc()
											.set({
												paymentAdviceId: dataId,
												paymentAdviceDate: self.newDate,
												crNumber: self.newCRNumber,
												checkNumber: self.newCheckNumber,
												paymentAmount: self.newPaymentAmount,
												checkReference: self.newCheckReference,
												distributorReference: self.newDistributor,
												status: 1,
												userReference: users[0].userId,
												dateCreated: today,
												dateModified: today
											}).then(() => {
												for(let a = 0; a < self.particulars.length; a++){
													let pID = 'PAPI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

													self.particulars[a].invoiceAmount = self.particulars[a].invoiceAmount.replaceAll(",","");
													dbSales.collection("paymentAdviceParticulars").doc()
													.set({
														paymentAdviceParticularId: pID,
														invoiceDate: moment(self.particulars[a].invoiceDate).format('YYYY-MM-DD'),
														invoiceAmount: self.particulars[a].invoiceAmount,
														poReference: self.particulars[a].poNumber,
														invoiceReference: self.particulars[a].invoiceNumber,
														whtReference: self.particulars[a].whtReference,
														paymentAdviceReference: dataId,
														dateCreated: today,
														dateModified: today
													}).then(() => {
														self.newDate = '';
														self.newCRNumber = '';
														self.newCheckNumber = '';
														self.newPaymentAmount = '';
														self.newCheckReference = '';
														self.newDistributor = '';
														self.particulars = [];
														self.$v.newDate.$reset();
														self.$v.newCRNumber.$reset();
														self.$v.newPaymentAmount.$reset();
														self.$v.newDistributor.$reset();
														self.$v.newCheckNumber.$reset();
														self.requestProcessing = false;
														self.$swal({
															title: 'Success',
															text: 'New Payment Advice added successfully!',
															icon: 'success',
															confirmButtonColor: '#b80000',
															confirmButtonText: 'OK'
														}).then(() => {
															self.$router.push("/sales/payment/advice/print/" + dataId);
														});
													});
												}
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
								}
							});
						}
					}else{
						self.requestProcessing = false;
					}
				});

			},
		}
	};
</script>
<style type="text/css">
	.nav-pills .nav-link.active,
	.nav-pills .show > .nav-link {
		background-color: #b80000;
		color: #f5c71a;
		border-color: #b80000;
	}
	.nav-pills .nav-link.active:hover,
	.nav-pills .show > .nav-link {
		background-color: #b80000;
		color: #f5c71a;
		border-color: #b80000;
	}
	.nav-pills .nav-link {color: #b80000;}
	.nav-pills .nav-link:hover {
		color: #b80000;
		background-color: #f5c71a;
	}
	.form-control {height: calc(1.5em + 0.50rem + 2px);}
	.form-group {margin-bottom: 0rem}
	.nav-pills .nav-item:hover {
		border-bottom-width: 0px;
		border-top-width: 0px;
		border-right-width: 0px; 
		border-left-width: 0px;
	}
</style>