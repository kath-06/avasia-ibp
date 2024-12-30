<template>
	<!-- New check form -->
	<card>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Department:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Bank:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<v-select id="inputStyle"
					:options="departments"
					:reduce="department => department.departmentUid"
					label="departmentName"
					v-model="newDepartment"
					:clearable="false"></v-select>
				<i class="text-red"
					v-if="$v.newDepartment.$anyDirty && !$v.newDepartment.required">Field Required</i>
			</div>
			<div class="col-sm-6 pl-5 pr-5">
				<v-select id="inputStyle"
					:options="activateBanks"
					:reduce="activateBank => activateBank.bankUid"
					label="bank"
					v-model="newBank"
					@input="getActivateBankAccounts(newBank)"
					:clearable="false"></v-select>
				<i class="text-red"
					v-if="$v.newBank.$anyDirty && !$v.newBank.required">Field Required</i>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Account Number:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Check Series:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5"
				v-if="activateBankAccounts == ''">
				<span class="text-red">No Bank Account</span>
			</div>
			<div class="col-sm-6 pl-5 pr-5" v-else>
				<v-select id="inputStyle"
					:options="activateBankAccounts"
					:reduce="activateBankAccount => activateBankAccount.bankAccountUid"
					label="bankAccountNumber"
					v-model="newBankAccount"
					@input="getCheckSeries(newBank, newBankAccount)"
					:clearable="false"></v-select>
				<i class="text-red"
					v-if="$v.newBankAccount.$anyDirty && !$v.newBankAccount.required">Field Required</i>
			</div>
			<div class="col-sm-6 pl-5 pr-5"
				v-if="checkSeries == '' || activateBankAccounts == ''">
				<span class="text-red">No Check Series</span>
			</div>
			<div class="col-sm-6 pl-5 pr-5" v-else>
				<v-select input="inputStyle"
					:options="checkSeries"
					:reduce="series => series.bankCheckSeriesUid"
					label="bankCheckSeries"
					v-model="newCheckSeries"
					@input="getCheckNumber(newBank, newBankAccount, newCheckSeries, 'current')"
					:clearable="false"></v-select>
				<i class="text-red"
					v-if="$v.newCheckSeries.$anyDirty && !$v.newCheckSeries.required">Field Required</i>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Check Number:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5"
				v-if="checkSeries == '' || activateBankAccounts == '' || checkNumbers == ''">
				<span class="text-red">No Check Number</span>
			</div>
			<div class="col-sm-6 pl-5 pr-5" v-else>
				<v-select id="inputStyle"
					:options="checkNumbers"
					:reduce="checkNumber => checkNumber.checkNumber"
					label="checkNumber"
					v-model="newCheckNumber"
					:clearable="false"></v-select>
				<i class="text-red"
					v-if="$v.newCheckNumber.$anyDirty && !$v.newCheckNumber.required">Field Required</i>
			</div>
			<div class="col-sm-6 pl-5">
				<base-button id="darkBtn"
					class="pl-3 pr-3 pt-2 pb-2"
					@click.native="statusCheckNumber(newBank, newBankAccount, 'skip')"
					v-if="newCheckNumber != ''">Skip</base-button>
				<base-button id="darkInlineBtn"
					class="pt-1 pb-1"
					v-if="checkSeries != '' || activateBankAccounts != '' || checkNumbers != ''"
					@click="getCheckNumber(newBank, newBankAccount, newCheckSeries, 'current')">Current</base-button>
				<base-button id="darkInlineBtn"
					class="pt-1 pb-1"
					v-if="checkSeries != '' || activateBankAccounts != '' || checkNumbers != ''"
					@click="getCheckNumber(newBank, newBankAccount, newCheckSeries, 'skip')">Skipped</base-button>
				<base-button id="darkInlineBtn"
					class="pt-1 pb-1"
					v-if="checkSeries != '' || activateBankAccounts != '' || checkNumbers != ''"
					@click="getCheckNumber(newBank, newBankAccount, newCheckSeries, 'unused')">Unused</base-button>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label for="checkPayee"
				class="col-sm-6 col-form-label">
				<b>Payee:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-9 pl-5">
				<v-select id="inputStyle"
					:options="suppliers"
					:reduce="supplier => supplier.supplierId"
					label="supplier"
					v-model="newCheckPayee"
					@input="clearDesc()"
					:clearable="false"></v-select>
				<i class="text-red"
					v-if="$v.newCheckPayee.$anyDirty && !$v.newCheckPayee.required">Field Required</i>
			</div>
			<div class="col-sm-3 pr-5">
				<base-button block id="darkBtn"
					title="Add Payee"
					v-b-modal.new-payee-modal>Add Payee</base-button>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Description:</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Check Date:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<textarea rows="4"
					cols="60"
					v-model="newDesc"
					id="inputStyle"
					class="pl-2"
					placeholder="Description"></textarea>
				<i class="text-red"
					v-if="$v.newDesc.$anyDirty && !$v.newDesc.required">Field Required</i>
			</div>
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newCheckDate"
					id="inputStyle"
					type="date"
					placeholder="Check Date"
					class="mb-0"></base-input>
				<i class="text-red"
					v-if="$v.newCheckDate.$anyDirty && !$v.newCheckDate.required">Field Required</i><br>
				<input class="mr-1"
					type="radio"
					value="7"
					v-on:click="editDate(7)"
					v-model="dateDays">
				<label class="mr-1">7 Days</label>
				<input class="mr-1"
					type="radio"
					value="15"
					v-on:click="editDate(15)"
					v-model="dateDays">
				<label class="mr-1" >15 Days</label>
				<input class="mr-1"
					type="radio"
					value="30"
					v-on:click="editDate(30)"
					v-model="dateDays">
				<label class="mr-1">30 Days</label>
				<input class="mr-1"
					type="radio"
					value="45"
					v-on:click="editDate(45)"
					v-model="dateDays">
				<label class="mr-1">45 Days</label>
				<input class="mr-1"
					type="radio"
					value=""
					v-on:click="editDate('')"
					v-model="dateDays">
				<label class="mr-1">Choose Date</label>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label for="amount"
				class="col-sm-3 col-form-label">
				<b>Amount:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-5">
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newAmount"
					id="inputStyle"
					type="text"
					placeholder="Amount"
					readonly></base-input>
				<i class="text-red"
					v-if="$v.newAmount.$anyDirty && !$v.newAmount.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newAmount.$anyDirty && !$v.newAmount.amountCustomValidator">Invalid Characters</i>
			</div>
		</div>
		<hr>
		<div class="card-header bg-transparent pb-2">
			<div class="text-left">
				<h2 class="display-5"
					id="sideBarTxt">
					Particulars
				</h2>
			</div>       
		</div>
		<card class="pl-2 pr-2">
			<div class="form-group row mb-0">
				<label class="col-sm-12 col-form-label">
					<b>Particular:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-9 pl-5 pb-0">
					<v-select id="inputStyle"
						:options="particulars"
						:reduce="particular => particular.particularId"
						label="particular"
						v-model="newParticular"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.newParticular.$anyDirty && !$v.newParticular.required">Field Required</i>
				</div>
				<div class="col-sm-3 pr-5 pb-0">
					<base-button block id="darkBtn"
						title="Add Payee"
						v-b-modal.new-voucher-particular-modal>Add Particular</base-button>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Description:</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Reference Number:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5 pb-0">
					<base-input v-model="newDescription"
						type="text"
						id="inputStyle"
						placeholder="Description"></base-input>
				</div>
				<div class="col-sm-6 pl-5 pr-5 pb-0">
					<base-input v-model="newReferenceNumber"
						type="text"
						id="inputStyle"
						placeholder="Reference Number"></base-input>
					<i class="text-red"
						v-if="$v.newReferenceNumber.$anyDirty && !$v.newReferenceNumber.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Unit Price:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Quantity:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newUnitPrice"
						type="text"
						id="inputStyle"
						placeholder="Unit Price"
						@input="computeAmount(newUnitPrice, newQuantity, 'add')"></base-input>
					<i class="text-red"
						v-if="$v.newUnitPrice.$anyDirty && !$v.newUnitPrice.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newUnitPrice.$anyDirty && !$v.newUnitPrice.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newQuantity"
						type="text"
						id="inputStyle"
						placeholder="Quantity"
						@input="computeAmount(newUnitPrice, newQuantity, 'add')"></base-input>
					<i class="text-red"
						v-if="$v.newQuantity.$anyDirty && !$v.newQuantity.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newQuantity.$anyDirty && !$v.newQuantity.numCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Amount:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Type:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newParticularAmount"
						type="text"
						id="inputStyle"
						placeholder="Amount" readonly></base-input>
					<i class="text-red"
						v-if="$v.newParticularAmount.$anyDirty && !$v.newParticularAmount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newParticularAmount.$anyDirty && !$v.newParticularAmount.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="types"
						:reduce="type => type.type"
						label="type"
						v-model="newType"
						:clearable="true"></v-select>
				</div>
			</div>
			<div class="form-group row mb-0"
				v-if="newType == 'Cash Advance'">
				<label class="col-sm-6 col-form-label">
					<b>Cash Advance Type:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="caTypes"
						:reduce="caType => caType.cashAdvanceTypeId"
						label="type"
						v-model="newCAType"
						:clearable="false"
						v-if="newType == 'Cash Advance'"></v-select>
				</div>
			</div>
			<div class="form-group row mb-0 mt-3">
				<div class="col-sm-6 pl-5 pr-5"></div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-button block id="darkBtn"
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
				:data="checkParticulars"
				:columns="particularsTable.columns">
				<template slot-scope="{row}">
					<td>{{row.rowNum}}</td>
					<td>{{row.particular}}</td>
					<td>{{row.description || '------'}}</td>
					<td>{{row.unitPrice}}</td>
					<td>{{row.quantity}}</td>
					<td>{{row.particularAmount}}</td>
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
				@click.native="addCheck"
				v-if="activateBankAccounts != '' &&  checkSeries != '' && checkParticulars.length != 0">Save</base-button>
		</div>
		<!-- ADD PAYEE MODAL -->
		<b-modal size="md"
			id="new-payee-modal"
			title="Add Payee" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-12 col-form-label">
					<b>Payee Name:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-12 pl-5 pr-5">
					<base-input v-model="newPayee"
						type="text"
						id="inputStyle"
						placeholder="Payee"></base-input>
					<i class="text-red"
						v-if="$v.newPayee.$anyDirty && !$v.newPayee.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newPayee.$anyDirty && !$v.newPayee.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addPayee"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('new-payee-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- ADD VOUCHER PARTICULAR MODAL -->
		<new-check-voucher-particular
			id="new-voucher-particular-modal"
			@successSubmit="getVoucherParticulars()">
		</new-check-voucher-particular>
	</card>
</template>
<script>
	import {db, dbUsers, dbMains, dbExpense} from '@/main';
	import {helpers, required} from "vuelidate/lib/validators";
	import {upperCase} from "text-case";
	import {mapGetters} from "vuex";

	const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9₱ ,. ]*$/);
	const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
	const tableColumns = ["#", "Particular", "Description", "Unit Price", "Quantity", "Amount",  "Actions"];
	const moment  = require('moment');
	const today = new Date();
	const addZero = require('add-zero');
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');

	export default {
		name: "new-check",
		components: {},
		data() {
			return {
				// New check
				banks: [],
				activateBanks: [],
				activateBankAccounts: [],
				departments: [],
				suppliers: [],
				checkSeries: [],
				checkNumbers: [],
				newCheckNumber: '',
				newCheckDate: moment().format("YYYY-MM-DD"),
				newAmount: '',
				newCheckPayee: '',
				newDesc: '',
				newDepartment : '',
				newBank: '',
				newBankAccount: '',
				newCheckSeries: '',
				newPayee: '',
				loading: true,
				loadError: false,
				particularsTable: {
					title: "Particulars Table",
					subTitle: "",
					columns: [...tableColumns]
				},
				checkParticulars: [],
				requestProcessing: false,
				newParticular: '',
				newDescription: '',
				newReferenceNumber: '',
				newUnitPrice: '',
				newParticularAmount: '',
				newQuantity: '',
				totalAmount: '',
				dateDays: '',
				types: [
					{'type': 'Cash Advance'}
				],
				caTypes: [],
				newType: '',
				newCAType: '',
			};
		},
		validations: {
			// New check validation
			newCheckDate: {required},
			newCheckNumber: {required},
			newAmount: {
				required,
				amountCustomValidator
			},
			newCheckPayee: {required},
			newDepartment: {required},
			newBank: {required},
			newBankAccount: {required},
			newCheckSeries: {required},
			newPayee: {
				required,
				alphaNumCustomValidator
			},
			newDesc: {required},
			newParticular: {required},
			newReferenceNumber: {alphaNumCustomValidator},
			newUnitPrice: {
				required,
				amountCustomValidator
			},
			newParticularAmount: {
				required,
				amountCustomValidator
			},
			newQuantity: {
				required,
				numCustomValidator
			},
		},
		computed: {
			...mapGetters({
				particulars: 'VoucherParticulars/allParticulars'
			})
		},
		async mounted(){
			this.getVoucherParticulars();
			this.getActivateBanks();
			this.getDepartments();
			this.getSuppliers();
			this.getParticulars();
			this.getCATypes();
		},
		methods: {
			// Get all check voucher particulars
			async getVoucherParticulars() {
				let self = this;

				await self.$store.dispatch('VoucherParticulars/getAllParticulars');
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
					self.newBank = self.activateBanks[0].bankUid;
					self.getActivateBankAccounts(self.activateBanks[0].bankUid);
				});
			},
			// Get bank account data
			getActivateBankAccounts(bank){
				let self = this;
				let bankAccountData = dbMains.collection("bankAccounts")
					.where("bankReference", "==", bank)
					.orderBy("bankAccountNumber", "asc");

				self.activateBankAccounts = [];
				bankAccountData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.activateBankAccounts.push(doc.data());
					});
					self.newBankAccount = self.activateBankAccounts[0].bankAccountUid;
					self.getCheckSeries(self.newBank, self.newBankAccount);
				});
			},
			// Get bank check series data
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
					self.newCheckSeries = self.checkSeries[0].bankCheckSeriesUid;
					self.getCheckNumber(self.newBank, self.newBankAccount, self.newCheckSeries, 'current');
				});
			},
			// Get bank check number
			getCheckNumber(bank, bankAccount, series, status){
				let self = this;
				let bankCheckNumberData = db.collection("bankCheckSeriesReports")
					.where("bankReference", "==", bank)
					.where("bankAccountReference", "==", bankAccount)
					.where("checkSeriesReference", "==", series)
					.where("status", "==", status)
					.orderBy("checkNumber", "asc");

				self.checkNumbers = [];
				self.newCheckNumber = '';
				bankCheckNumberData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							self.checkNumbers.push(doc.data());
						}
					});
					if(self.checkNumbers.length != 0){
						self.newCheckNumber = self.checkNumbers[0].checkNumber;
					}
				});
			},
			// Get department data
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
				});
			},
			// Get check payee data
			getSuppliers(){
				let self = this;
				let supplierData = db.collection("suppliers")
					.orderBy("supplier", "asc");

				self.suppliers = [];
				supplierData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.suppliers.push(doc.data());
					});
					self.newCheckPayee = self.suppliers[0].supplierId;
				});
			},
			// Get cash advance types
			getCATypes(){
				let self = this;
				let caTypeData = dbExpense.collection("cashAdvanceTypes");

				self.caTypes = [];
				caTypeData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.caTypes.push(doc.data());
					});
					self.newCAType = self.caTypes[0].cashAdvanceTypeId;
				});
			},
			cancelNewCheck(){
				this.$router.push("/check/dashboard");
			},
			// Add new check payee
			addPayee(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newPayee.$touch();
				if(!self.$v.newPayee.$error){
					let checkSupplierData = null;

					self.requestProcessing = true;
					checkSupplierData = db.collection('suppliers')
						.where("supplier", "==", upperCase(self.newPayee));
					checkSupplierData.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) => {
								if(doc.exists){
									self.$swal({
										title: 'Invalid',
										text: 'Payee already exists.',
										icon: 'error',
										confirmButtonColor: '#b80000',
										confirmButtonText: 'OK'
									});
									self.requestProcessing = false;
								}
							});
						}else if(querySnapshot){
							let username = localStorage.getItem('aisname');
							let getUserId = dbUsers.collection('users')
								.where("username", '==', localStorage.getItem('aisname'));
							let users = [];
							let dataId = 'SID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

							getUserId.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									if(doc.exists){
										users.push(doc.data());
									}
									try {
										db.collection('suppliers').doc()
										.set({
											supplierId : dataId,
											supplier: upperCase(self.newPayee),
											status: 1,
											userReference: users[0].userId,
											dateCreated: today,
											createdBy: username
										}).then(() => {
											self.newPayee = '';
											self.$v.newPayee.$reset();
											self.requestProcessing = false;
											self.$bvModal.hide('new-payee-modal');
											self.getSuppliers();
											self.$swal({
												title: 'Success',
												text: 'New Payee added successfully!',
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
							});
						}
					});
				}
			},
			// Get check particular
			getParticulars() {
				let self = this;

				self.loading = false;
				if(localStorage.getItem("checkPart") && self.checkParticulars.length == 0){
					self.checkParticulars = JSON.parse(localStorage.getItem("checkPart"));
				}
				if(self.checkParticulars.length != 0){
					let commaNumber = require('comma-number');
					let format = commaNumber.bindWith(',', '.');
					let compute = 0, amount = 0;

					self.loading = true;
					self.loadError = false;
					for(let j = 0; j < self.checkParticulars.length; j++){
						self.checkParticulars[j].rowNum = j + 1;
						amount = self.checkParticulars[j].particularAmount.replaceAll("₱ ","");
						compute += parseFloat(amount.replaceAll(",",""));
					}
					self.newAmount = '₱ ' + format(parseFloat(compute).toFixed(2));
					setTimeout(function() {
						self.loading = false;
					}, 1500);						
				}else if(self.checkParticulars == 0){
					self.newAmount = '';
					self.checkParticulars = [];
				}
			},
			reloadData() {
				this.getParticulars();
			},
			// Compute particular amount
			computeAmount(price, quantity, type){
				price  = price.replaceAll('₱ ', '');
				this.newUnitPrice = '₱ ' + price;
				price  = price.replaceAll(',', '');
				if (type == 'add') {
					this.newParticularAmount = price * quantity;
					this.newParticularAmount = '₱ ' + format(parseFloat(this.newParticularAmount).toFixed(2));
				}else if (type == 'update') {
					this.edit.particularAmount = price * quantity;
				}
			},
			// Add check particular
			addParticular(){
				let self = this, addError = true, particularName = '';

				self.requestProcessing = false;
				self.$v.newParticular.$touch();
				self.$v.newReferenceNumber.$touch();
				self.$v.newUnitPrice.$touch();
				self.$v.newParticularAmount.$touch();
				self.$v.newQuantity.$touch();
				if(!self.$v.newParticular.$error && !self.$v.newUnitPrice.$error && !self.$v.newParticularAmount.$error && !self.$v.newQuantity.$error && !self.$v.newReferenceNumber.$error){
					addError = false;
				}
				if(!addError){
					self.requestProcessing = true;
					if(self.checkParticulars.length == 0){
						self.checkParticulars = [];
					}
					for(let a = 0; a < self.particulars.length; a++){
						if(self.particulars[a].particularId == self.newParticular){
							particularName = self.particulars[a].particular;
						}
					}
					let newParticular = {
						"rowNum": "",
						"particularReference": self.newParticular,
						"particular": particularName,
						"description": self.newDescription,
						"referenceNumber": self.newReferenceNumber,
						"unitPrice": self.newUnitPrice,
						"particularAmount": self.newParticularAmount,
						"quantity": self.newQuantity,
						"type": self.newType,
						"caType": self.newCAType,
						"status": 1
					}

					self.checkParticulars.push(newParticular);
					self.$swal({
						title: 'Success',
						text: 'New Particular added successfully!',
						icon: 'success',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.newParticular = '';
						self.newDescription = '';
						self.newReferenceNumber = '';
						self.newUnitPrice = '';
						self.newParticularAmount = '';
						self.newQuantity = '';
						self.newType = '';
						self.$v.newParticular.$reset();
						self.$v.newReferenceNumber.$reset();
						self.$v.newUnitPrice.$reset();
						self.$v.newParticularAmount.$reset();
						self.$v.newQuantity.$reset();
						self.$bvModal.hide('add-particular-modal');
						self.getParticulars();
					});
					self.requestProcessing = false;
				}
			},
			// Change check date
			editDate(date){
				if(date != ""){
					this.newCheckDate = moment().add(date, 'day').format('YYYY-MM-DD');
				}else{
					this.newCheckDate = '';
				}
			},
			// Clear check description data
			clearDesc(){
				this.$v.newDesc.$reset();
			},
			// Validate check details
			addCheck(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newCheckDate.$touch();
				self.$v.newCheckNumber.$touch();
				self.$v.newAmount.$touch();
				self.$v.newCheckPayee.$touch();
				self.$v.newDepartment.$touch();
				self.$v.newBank.$touch();
				self.$v.newBankAccount.$touch();
				self.$v.newCheckSeries.$touch();
				self.newAmount = self.newAmount.replaceAll(',', '');
				self.newAmount = self.newAmount.replaceAll('₱ ', '');
				if(!self.$v.newCheckDate.$error && !self.$v.newCheckNumber.$error && !self.$v.newAmount.$error && !self.$v.newCheckPayee.$error && !self.$v.newDepartment.$error && !self.$v.newBank.$error && !self.$v.newBankAccount.$error && !self.$v.newCheckSeries.$error){
					let payeeData = db.collection("suppliers")
						.where("supplierId","==", self.newCheckPayee);
					let payee = [];

					payeeData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							payee.push(doc.data());
						});
						if(payee[0].supplier == "CASH"){
							self.$v.newDesc.$touch();
							if(!self.$v.newDesc.$error){
								self.newCheck();
							}else{
								self.$swal({
									title: 'Error',
									text: 'Description is required',
									icon: 'error',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								});
							}
						}else{
							self.newCheck();
						}
					});
				}
			},
			// Save new check details
			newCheck(){
				let self = this;

				console.log(self.checkParticulars);

				self.requestProcessing = true;
				this.$swal({
					title: 'Are you sure?',
					text: "You want to save this check",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#f5c71a',
					confirmButtonText: 'CONFIRM',
				}).then((result) => {
					if(result.value){
						let checkBankCheckData = null;

						checkBankCheckData = db.collection('bankChecks')
							.where("bankCheckNumber", "==", self.newCheckNumber)
							.where("bankCheckSeriesReference", "==", self.newCheckSeries)
							.where("bankReference", "==", self.newBank)
							.where("bankAccountReference", "==", self.newBankAccount);
						checkBankCheckData.get().then((querySnapshot) => {
							if(!querySnapshot.empty){
								querySnapshot.forEach((doc) => {
									if(doc.exists){
										self.$swal({
											title: 'Invalid',
											text: 'Check already exists.',
											icon: 'error',
											confirmButtonColor: '#b80000',
											confirmButtonText: 'OK'
										});
										self.requestProcessing = false;
									}
								});
							}else if(querySnapshot){
								let series = dbMains.collection('bankCheckSeries')
									.where("bankCheckSeriesUid", "==", self.newCheckSeries);
								let voucher = db.collection('bankChecks')
									.orderBy('voucherDate', 'desc');
								let getUserId = dbUsers.collection('users')
									.where("username", '==', localStorage.getItem('aisname'));
								let departmentData = dbUsers.collection('departments')
									.where("departmentUid", "==", self.newDepartment);
								let users = [], getSeries = [], seriesId = '', voucherSeries = [], departmentSeries = [];

								series.get().then((querySnapshot) => {
									querySnapshot.forEach((doc) => {
										if(doc.exists){
											getSeries.push(doc.data());
											seriesId = doc.id;
										}
									});
									voucher.limit(1).get().then((querySnapshot) => {
										querySnapshot.forEach((doc) => {
											if(doc.exists){
												voucherSeries.push(doc.data());
											}
										});
										let lastSeries = parseInt(getSeries.bankCheckSeries) + 99;
										let lastVoucher = '';

										getUserId.get().then((querySnapshot) => {
											querySnapshot.forEach((doc) =>{
												users.push(doc.data());
											});
											departmentData.get().then((querySnapshot) =>{
												querySnapshot.forEach((doc) => {
													departmentSeries.push(doc.data());
												});
												let genVoucherNo = new Date();
												let cType = "postdated";
												let dataId = 'BCI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

												if(voucherSeries.length != 0){
													lastVoucher = addZero(parseInt(voucherSeries[0].voucherNumber.slice(7)) + 1, 5);
													if(lastVoucher.toString() == '100000'){
														lastVoucher = '00001';
													}
												}else{
													lastVoucher = '00001';
												}
												if(moment(self.newCheckDate).format('YYYY-MM-DD') == moment(today).format('YYYY-MM-DD')){
													cType = "dated";
												}
												try{
													db.collection('bankChecks').doc()
													.set({
														bankCheckUid: dataId,
														bankCheckNumber: self.newCheckNumber,
														bankCheckDate: self.newCheckDate,
														bankCheckAmount: self.newAmount,
														checkType: cType,
														voucherNumber: addZero(genVoucherNo.getMonth() + 1) + '' + (genVoucherNo.getFullYear().toString()).slice(2,4) + '-' + departmentSeries[0].seriesCode + '' + lastVoucher,
														voucherDate: genVoucherNo, 
														departmentReference: self.newDepartment,
														payeeReference: self.newCheckPayee,
														description: self.newDesc,
														bankReference: self.newBank,
														bankAccountReference: self.newBankAccount,
														bankCheckSeriesReference: self.newCheckSeries,
														status: 3,
														userReference: users[0].userId,
														dateCreated: today,
														dateModified: today,
														createdBy: users[0].username,
													}).then(() => {
														if(lastSeries == self.newCheckNumber){
															dbMains.collection("bankCheckSeries")
															.doc(seriesId)
															.update({
																status: 0,
																dateModified: today
															});
														}
														for(let a = 0; a < self.checkParticulars.length; a++){
															let pID = 'BCPI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

															self.checkParticulars[a].unitPrice = self.checkParticulars[a].unitPrice.replaceAll(",","");
															self.checkParticulars[a].unitPrice = self.checkParticulars[a].unitPrice.replaceAll("₱ ","");
															self.checkParticulars[a].particularAmount = self.checkParticulars[a].particularAmount.replaceAll(",","");
															self.checkParticulars[a].particularAmount = self.checkParticulars[a].particularAmount.replaceAll("₱ ","");
															db.collection("bankCheckParticulars").doc()
															.set({
																bankCheckParticularsUid: pID,
																particularReference: self.checkParticulars[a].particularReference,
																particular: self.checkParticulars[a].particular,
																description: self.checkParticulars[a].description,
																referenceNumber: self.checkParticulars[a].referenceNumber,
																unitPrice: self.checkParticulars[a].unitPrice,
																particularAmount: self.checkParticulars[a].particularAmount,
																quantity: self.checkParticulars[a].quantity,
																bankCheckReference: dataId,
																userReference: users[0].userId,
																status: 1,
																dateCreated: today,
																dateModified: today,
																createdBy: users[0].username,
															}).then(() => {
																if(self.checkParticulars[a].type == 'Cash Advance'){
																	let caId = 'CAI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

																	dbExpense.collection("cashAdvances").doc()
																	.set({
																		cashAdvanceId: caId,
																		cashAdvanceName: self.checkParticulars[a].particular,
																		cashAdvanceAmount: self.checkParticulars[a].particularAmount,
																		type: 'Check',
																		caTypeReference: self.checkParticulars[a].caType,
																		cashAdvanceDate: self.newCheckDate,
																		reference: dataId,
																		description: self.checkParticulars[a].description,
																		status: 1,
																		userReference: users[0].userId,
																		dateCreated: today,
																		dateModified: today
																	});
																}
																let idData = db.collection("bankCheckSeriesReports")
																	.where("checkSeriesReference", "==", self.newCheckSeries)
																	.where("checkNumber", "==", self.newCheckNumber);
																let getId = '', checkNums = [];

																idData.get().then((querySnapshot) => {
																	querySnapshot.forEach((doc) =>{
																		getId = doc.id;
																		checkNums.push(doc.data());
																	});
																	db.collection("bankCheckSeriesReports")
																	.doc(getId)
																	.update({
																		checkReference: dataId,
																		status: "used",
																		dateModified: today
																	});
																	if(checkNums[0].status == "current"){
																		let cNumber = parseInt(self.newCheckNumber);
																		let nxtData = db.collection("bankCheckSeriesReports")
																			.where("checkSeriesReference", "==", self.newCheckSeries)
																			.where("status", "==", "unused")
																			.orderBy("checkNumber", "asc")
																			.startAfter(cNumber);
																		let nxtId = '';

																		nxtData.limit(1).get().then((querySnapshot) => {
																			querySnapshot.forEach((doc) => {
																				nxtId = doc.id;
																			});
																			db.collection("bankCheckSeriesReports")
																			.doc(nxtId)
																			.update({
																				status: "current", dateModified: today
																			});
																		});
																	}
																	self.newCheckNumber = '';
																	self.newCheckDate = '';
																	self.newAmount = '';
																	self.newCheckPayee = '';
																	self.newDesc = '';
																	self.checkParticulars = [];
																	self.$v.newCheckDate.$reset();
																	self.$v.newAmount.$reset();
																	self.$v.newCheckPayee.$reset();
																	self.$v.newDepartment.$reset();
																	self.$v.newBank.$reset();
																	self.$v.newBankAccount.$reset();
																	self.$v.newDesc.$reset();
																	self.requestProcessing = false;
																	self.$swal({
																		title: 'Success',
																		text: 'New Check added successfully!',
																		icon: 'success',
																		confirmButtonColor: '#b80000',
																		confirmButtonText: 'OK'
																	}).then(() => {
																		if(localStorage.getItem("checkPart")){
																			let data = [];

																			data = JSON.parse(localStorage.getItem("checkPart"));
																			for(let b = 0; b < data.length; b++){
																				dbExpense.collection("reimbursements")
																				.doc(data[b].reimId)
																				.update({
																					checkReference: dataId,
																					status: 3,
																					dateModified: today,
																				}).then(() => {
																					localStorage.removeItem("checkPart");
																				});
																			}
																		}
																		self.$router.push("/check/voucher/" + dataId + "/check");
																	});
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
										});
									})									
								});
							}
						});
					}else{
						self.requestProcessing = false;
					}
				});
			},
			// Delete check particular
			removeParticular(particular){
				let self = this;

				this.$swal({
					title: 'Are you sure?',
					text: "You want to remove this Particular",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#f5c71a',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						self.checkParticulars.splice((parseInt(particular.rowNum) - 1) , 1);
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
			// Change check number status
			statusCheckNumber(bank, account, status){
				let self = this;

				this.$swal({
					title: 'Are you sure?',
					text: "You want to " + status + " this Check Number",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#f5c71a',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						if(status == 'cancel'){
							status = 'cancelled';
						}
						let idData = db.collection("bankCheckSeriesReports")
							.where("bankReference", "==", bank)
							.where("bankAccountReference", "==", account)
							.where("checkSeriesReference", "==", self.newCheckSeries)
							.where("checkNumber", "==", self.newCheckNumber);
						let getId = '', checkStat = [];

						idData.get().then((querySnapshot) => {
							if(!querySnapshot.empty){
								querySnapshot.forEach((doc) => {
									getId = doc.id;
									checkStat.push(doc.data());
								});
								db.collection("bankCheckSeriesReports")
								.doc(getId)
								.update({
									status: status,
									dateModified: today
								}).then(() => {
									if(checkStat[0].status == "current"){
										let cNumber = parseInt(self.newCheckNumber);
										let nxtData = db.collection("bankCheckSeriesReports")
											.where("checkSeriesReference", "==", self.newCheckSeries)
											.where("status", "==", "unused")
											.orderBy("checkNumber", "asc")
											.startAfter(cNumber);
										let nxtId = '';

										nxtData.limit(1).get().then((querySnapshot) => {
											if(!querySnapshot.empty){
												querySnapshot.forEach((doc) => {
													nxtId = doc.id;
												});
												db.collection("bankCheckSeriesReports")
												.doc(nxtId)
												.update({
													status: 'current',
													dateModified: today
												}).then(() => {
													self.getCheckSeries(bank, account);
													self.requestProcessing = false;
													self.$swal({
														title: 'Success',
														text: 'Check number ' + status + ' successfully',
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
											}
										});
									}else{
										self.getCheckSeries(bank, account);
										self.requestProcessing = false;
										self.$swal({
											title: 'Success',
											text: 'Check number ' + status + ' successfully',
											icon: 'success',
											confirmButtonColor: '#b80000',
											confirmButtonText: 'OK'
										});
									}
								});
							}
						});
					}
				});
			},
		}
	};
</script>
<style type="text/css">
	.form-control {height: calc(1.5em + 0.50rem + 2px);}
	.form-group {margin-bottom: 0rem}
</style>