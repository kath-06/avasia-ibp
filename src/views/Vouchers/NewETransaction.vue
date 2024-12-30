<template>
	<!-- New e transaction form -->
	<card>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>E Wallet:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>E Wallet Account:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-4 pl-5">
				<v-select id="inputStyle"
					:options="eWallets"
					:reduce="ew => ew.eWalletId"
					label="eWalletName"
					v-model="newEWallet"
					:clearable="false"
					@input="getEWAccounts(newEWallet)"></v-select>
				<i class="text-red"
					v-if="$v.newEWallet.$anyDirty && !$v.newEWallet.required">Field Required</i>
			</div>
			<div class="col-sm-2 pr-5">
				<base-button v-b-modal.new-e-wallet-modal
					id="darkBtn" block
					:disabled="requestProcessing">Add</base-button>
			</div>
			<div class="col-sm-4 pl-5"
				v-if="ewAccounts.length > 0">
				<v-select id="inputStyle"
					:options="ewAccounts"
					:reduce="ewa => ewa.eWalletAccountId"
					label="eWalletAccountNumber"
					v-model="newEWAccount"
					:clearable="false"></v-select>
				<i class="text-red"
					v-if="$v.newEWAccount.$anyDirty && !$v.newEWAccount.required">Field Required</i>
			</div>
			<div class="col-sm-4 pl-5"
				v-if="ewAccounts.length <= 0">
				<span class="text-red">No Account</span>
			</div>
			<div class="col-sm-2 pr-5">
				<base-button v-b-modal.new-ew-account-modal
					id="darkBtn" block
					:disabled="requestProcessing">Add</base-button>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Payee:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Payee Account No.:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newPayee"
					type="text"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newPayee.$anyDirty && !$v.newPayee.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newPayee.$anyDirty && !$v.newPayee.alphaNumCustomValidator">Field Required</i>
			</div>
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newPayeeAccount"
					type="text"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newPayeeAccount.$anyDirty && !$v.newPayeeAccount.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newPayeeAccount.$anyDirty && !$v.newPayeeAccount.alphaNumCustomValidator">Field Required</i>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Transaction No.:</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Transaction Date:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newTransactionNumber"
					type="text"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newTransactionNumber.$anyDirty && !$v.newTransactionNumber.alphaNumCustomValidator">Invalid Characters</i>
			</div>
			<div class="col-sm-6 pl-5 pr-6">
				<base-input v-model="newTransactionDate"
					type="date"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newTransactionDate.$anyDirty && !$v.newTransactionDate.required">Field Required</i>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Total Amount:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newTotalAmount"
					type="text"
					id="inputStyle" disabled></base-input>
				<i class="text-red"
					v-if="$v.newTotalAmount.$anyDirty && !$v.newTotalAmount.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newTotalAmount.$anyDirty && !$v.newTotalAmount.amountCustomValidator">Field Required</i>
			</div>
		</div>
		<hr class="mb-2 mt-2">
		<div class="text-right">
			<base-button v-b-modal.add-particular-modal
				class="col-md-2 ml-2"
				id="darkBtn"
				:disabled="requestProcessing">Add Particular</base-button>
		</div>
		<hr class="mb-2 mt-2">
		<div class="card-header bg-transparent pb-1">
			<div class="text-left">
				<h2
					class="display-5"
					id="sideBarTxt">Particulars</h2>
			</div>       
		</div>
		<div class="table-full-width">
			<vue-good-table :columns="columns"
				:rows="particulars"
				:search-options="{enabled: false}"
				:pagination-options="{
					enabled: true,
					perPageDropdown: [10, 15, 20],
				}"
				:sort-options="{enabled: true}"
				:line-numbers="true"
				:isLoading="loading">
				<template slot="table-row"
					slot-scope="props">
					<b><span v-if="props.column.field == 'particular'">
						<span>{{props.row.particular}}</span>
					</span>
					<span v-if="props.column.field == 'quantity'">
						<span>{{props.row.quantity}}</span>
					</span>
					<span v-if="props.column.field == 'unitPrice'">
						<span>₱ {{props.row.unitPrice}}</span>
					</span>
					<span v-if="props.column.field == 'referenceNumber'">
						<span>{{props.row.referenceNumber}}</span>
					</span>
					<span v-if="props.column.field == 'amount'">
						<span class="tableSpan">₱ {{props.row.amount}}</span>
					</span>
					<span v-if="props.column.field == 'action'">
						<span class="pointer ml-2 far fa-times-circle text-red"
							id="sideBarTxt"
							v-on:click="removeParticular(props.row)"
							title="Remove"></span>
					</span></b>
				</template>
			</vue-good-table>
		</div>
		<hr class="mb-2 mt-2">
		<div class="text-right">
			<base-button id="darkBtn"
				class="col-md-2 ml-2"
				@click.native="addETransaction"
				:disabled="requestProcessing">Save</base-button>
		</div>
		<!-- ADD E WALLET MODAL -->
		<b-modal size="md"
			id="new-e-wallet-modal"
			title="New E Wallet" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-12 col-form-label">
					<b>E Wallet:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-12 pl-5 pr-5">
					<base-input v-model="newWallet"
						id="inputStyle"
						type="text"
						placeholder="E Wallet"></base-input>
					<i class="text-red"
						v-if="$v.newWallet.$anyDirty && !$v.newWallet.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newWallet.$anyDirty && !$v.newWallet.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addEWallet"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('new-e-wallet-modal')"
							:disabled="requestProcessing">
							Close
						</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- ADD E WALLET ACCOUNT MODAL -->
		<b-modal size="lg"
			id="new-ew-account-modal"
			title="New E Wallet Account" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>E Wallet Account Name:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>E Wallet Account Number:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newEAccountName"
						type="text"
						id="inputStyle"
						placeholder="Account Name"></base-input>
					<i class="text-red"
						v-if="$v.newEAccountName.$anyDirty && !$v.newEAccountName.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newEAccountName.$anyDirty && !$v.newEAccountName.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newEAccountNumber"
						type="text"
						id="inputStyle"
						placeholder="Account Number"></base-input>
					<i class="text-red"
						v-if="$v.newEAccountNumber.$anyDirty && !$v.newEAccountNumber.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newEAccountNumber.$anyDirty && !$v.newEAccountNumber.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>E Wallet:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="eWallets"
						:reduce="ew => ew.eWalletId"
						label="eWalletName"
						v-model="newEWalletA"
						:clearable="false">
					</v-select>
					<i class="text-red"
						v-if="$v.newEWalletA.$anyDirty && !$v.newEWalletA.required">Field Required</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addEWalletAccount"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('new-ew-account-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- ADD PARTICULAR MODAL -->
		<b-modal size="lg"
			id="add-particular-modal"
			title="Add Particular" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Particular:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Quantity:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newParticular"
						type="text"
						id="inputStyle"
						placeholder="Particular"></base-input>
					<i class="text-red"
						v-if="$v.newParticular.$anyDirty && !$v.newParticular.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newParticular.$anyDirty && !$v.newParticular.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newQuantity"
						type="text"
						id="inputStyle"
						placeholder="Quantity"
						@input="computeAmount(newQuantity, newUnitPrice)"></base-input>
					<i class="text-red"
						v-if="$v.newQuantity.$anyDirty && !$v.newQuantity.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newQuantity.$anyDirty && !$v.newQuantity.numCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Unit Price:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Reference Number:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newUnitPrice"
						type="text"
						id="inputStyle"
						placeholder="Unit Price"
						@input="computeAmount(newQuantity, newUnitPrice)"></base-input>
					<i class="text-red"
						v-if="$v.newUnitPrice.$anyDirty && !$v.newUnitPrice.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newUnitPrice.$anyDirty && !$v.newUnitPrice.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newReferenceNumber"
						type="text"
						id="inputStyle"
						placeholder="Reference Number"></base-input>
					<i class="text-red"
						v-if="$v.newReferenceNumber.$anyDirty && !$v.newReferenceNumber.refNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Amount:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Type:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newAmount"
						type="text"
						id="inputStyle"
						placeholder="Amount" disabled></base-input>
					<i class="text-red"
						v-if="$v.newAmount.$anyDirty && !$v.newAmount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newAmount.$anyDirty && !$v.newAmount.amountCustomValidator">Invalid Characters</i>
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
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addParticular"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('add-particular-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
	</card>
</template>
<script>
	import {dbUsers, dbMains, dbExpense} from '@/main';
	import {helpers, required} from "vuelidate/lib/validators";
	import {upperCase} from "text-case";

	const moment = require('moment');
	const today = new Date();
	const addZero = require('add-zero');
	const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -./, A-Za-z0-9 ]*$/);
	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ ,. 0-9 ]*$/);
	const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
	const refNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ - 0-9 ]*$/);
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');

	export default {
		name: "new-e-transaction",
		components: {},
		data() {
			return {
				// E transaction particular table
				loading: false,
				particulars: [],
				columns: [{
						label: 'Particular',
						field: 'particular'
					},{
						label: 'Quantity',
						field: 'quantity'
					},{
						label: 'Unit Price',
						field: 'unitPrice'
					},{
						label: 'Reference No.',
						field: 'referenceNumber'
					},{
						label: 'Amount',
						field: 'amount'
					},{
						label: '',
						field: 'action',
						width: '50px'
					}
				],
				// Select data
				eWallets: [],
				ewAccounts: [],
				types: [
					{'type': 'Cash Advance'}
				],
				caTypes: [],
				// New e transaction
				newEWallet: '',
				newEWAccount: '',
				newPayee: '',
				newPayeeAccount: '',
				newTransactionNumber: '',
				newTransactionDate: moment().format('YYYY-MM-DD'),
				newTotalAmount: '',
				// Enable or disable buttons
				requestProcessing: false,
				// New e Wallet
				newWallet: '',
				// New e wallet account
				newEAccountName: '',
				newEAccountNumber: '',
				newEWalletA: '',
				// New e transaction particular
				newParticular: '',
				newQuantity: '',
				newUnitPrice: '',
				newReferenceNumber: '',
				newAmount: '',
				newType: '',
				newCAType: '',
			};
		},
		validations: {
			// New e transaction validations
			newEWallet: {required},
			newEWAccount: {required},
			newPayee: {
				required,
				alphaNumCustomValidator
			},
			newPayeeAccount: {
				required,
				alphaNumCustomValidator
			},
			newTransactionNumber: {alphaNumCustomValidator},
			newTransactionDate: {required},
			newTotalAmount: {
				required,
				amountCustomValidator
			},
			// New e wallet validations
			newWallet: {
				required,
				alphaNumCustomValidator
			},
			// New e wallet account validations
			newEAccountName: {
				required,
				alphaNumCustomValidator
			},
			newEAccountNumber: {
				required,
				alphaNumCustomValidator
			},
			newEWalletA: {required},
			// New e transaction particular validations
			newParticular: {
				required,
				alphaNumCustomValidator
			},
			newQuantity: {
				required,
				numCustomValidator
			},
			newUnitPrice: {
				required,
				amountCustomValidator
			},
			newReferenceNumber: {refNumCustomValidator},
			newAmount: {
				required,
				amountCustomValidator
			}
		},
		async mounted(){
			this.getEWallets();
			this.getCATypes();
		},
		methods: {
			// Get cash advance types details
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
			// Get e wallet details
			getEWallets(){
				let self = this;
				let ewData = dbMains.collection("eWallets")
					.orderBy("eWalletName", "asc");

				self.eWallets = [];
				ewData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.eWallets.push(doc.data());
					});
					self.newEWallet = self.eWallets[0].eWalletId;
					self.getEWAccounts(self.newEWallet);
				});
			},
			// Get e wallet account details
			getEWAccounts(ew){
				let self = this;
				let ewaData = dbMains.collection("eWalletAccounts")
					.where("eWalletReference","==",ew);

				self.ewAccounts = [];
				ewaData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.ewAccounts.push(doc.data());
					});
					if(self.ewAccounts.length > 0){
						self.newEWAccount = self.ewAccounts[0].eWalletAccountId;
					}
				});
			},
			// Add new e wallet details
			addEWallet(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newWallet.$touch();
				if(!self.$v.newEWallet.$error){
					let eWalletData = null;

					self.requestProcessing = true;
					eWalletData = dbMains.collection('eWallets')
						.where("eWalletName", "==", upperCase(self.newWallet));
					eWalletData.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) => {
								if(doc.exists){
									self.$swal({
										title: 'Invalid',
										text: 'E Wallet already exists.',
										icon: 'error',
										confirmButtonColor: '#f5365c',
										confirmButtonText: 'OK'
									});
									self.requestProcessing = false;
								}
							});
						}else if(querySnapshot){
							let getUserId = dbUsers.collection('users')
								.where("username", '==', localStorage.getItem('aisname'));
							let users = [];
							let dataId = 'EWI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

							getUserId.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									if(doc.exists){
										users.push(doc.data());
									}
								});
								try{
									dbMains.collection('eWallets').doc()
									.set({
										eWalletId: dataId,
										eWalletName: upperCase(self.newWallet),
										userReference: users[0].userId,
										status: 1,
										dateCreated: today,
										dateModified: today
									}).then(() => {
										self.newEWallet = '';
										self.requestProcessing = false;
										self.$v.newWallet.$reset();
										self.$bvModal.hide('new-e-wallet-modal');
										self.getEWallets();
										self.$swal({
											title: 'Success',
											text: 'New E Wallet added successfully!',
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
			},
			// Add new e wallet account details
			addEWalletAccount(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newEAccountName.$touch();
				self.$v.newEAccountNumber.$touch();
				self.$v.newEWallet.$touch();
				if(!self.$v.newEAccountName.$error && !self.$v.newEAccountNumber.$error && !self.$v.newEWallet.$error){
					self.requestProcessing = true;
					let ewAccountData = null;

					ewAccountData = dbMains.collection('eWalletAccounts')
						.where("eWalletAccountNumber", "==", self.newEAccountNumber)
						.where("eWalletReference","==",self.newEWalletA);
					ewAccountData.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) => {
								if(doc.exists){
									self.$swal({
										title: 'Invalid',
										text: 'E Wallet Account already exists.',
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
							let dataId = 'EWAI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

							getUserId.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									if(doc.exists){
										users.push(doc.data());
									}
								});
								try {
									dbMains.collection('eWalletAccounts').doc()
									.set({
										eWalletAccountId: dataId,
										eWalletAccountName: self.newEAccountName,
										eWalletAccountNumber: self.newEAccountNumber,
										eWalletReference: self.newEWalletA,
										userReference: users[0].userId,
										status: 1,
										dateCreated: today,
										dateModified: today
									}).then(() => {
										self.newEAccountName = '';
										self.newEAccountNumber = '';
										self.newEWallet = '';
										self.$v.newEAccountName.$reset();
										self.$v.newEAccountNumber.$reset();
										self.$v.newEWallet.$reset();
										self.requestProcessing = false;
										self.$bvModal.hide('new-ew-account-modal');
										self.getEWallets();
										self.$swal({
											title: 'Success',
											text: 'New E Wallet Account added successfully!',
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
			},
			// Compute e transaction total amount
			computeAmount(quantity, price){
				price  = price.replaceAll(',', '');
				this.newAmount = price * quantity;
				this.newAmount = format(parseFloat(this.newAmount).toFixed(2));
			},
			// Add e transaction particular details
			addParticular(){
				let self = this;

				self.$v.newParticular.$touch();
				self.$v.newQuantity.$touch();
				self.$v.newUnitPrice.$touch();
				self.$v.newReferenceNumber.$touch();
				self.$v.newAmount.$touch();
				if(!self.$v.newParticular.$error && !self.$v.newQuantity.$error && !self.$v.newUnitPrice.$error && !self.$v.newReferenceNumber.$error && !self.$v.newAmount.$error){
					self.requestProcessing = true;
					if(self.particulars.length == 0){
						self.particulars = [];
					}
					let newParts = {
						"rowNum": '',
						"particular": self.newParticular,
						"quantity": self.newQuantity,
						"unitPrice": format(self.newUnitPrice),
						"referenceNumber": self.newReferenceNumber,
						"amount": format(self.newAmount),
						"type": self.newType,
						"caType": self.newCAType
					}

					self.particulars.push(newParts);
					self.$swal({
						title: 'Success',
						text: 'New particular added successfully!',
						icon: 'success',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.newParticular = '';
						self.newQuantity = '';
						self.newUnitPrice = '';
						self.newReferenceNumber = '';
						self.newAmount = '';
						self.newType = '';
						self.$v.newParticular.$reset();
						self.$v.newQuantity.$reset();
						self.$v.newUnitPrice.$reset();
						self.$v.newReferenceNumber.$reset();
						self.$v.newAmount.$reset();
						self.$bvModal.hide('add-particular-modal');
						self.getParticulars();
					});
					self.requestProcessing = false;
				}
			},
			// Display e transaction particular details on table
			getParticulars(){
				let self = this;

				self.loading = false;
				if(self.particulars.length != 0){
					self.loading = true;
					self.newTotalAmount = 0;
					for(let a  = 0; a < self.particulars.length; a++){
						self.particulars[a].rowNum = a + 1;
						self.newTotalAmount = parseFloat(self.newTotalAmount) + parseFloat(self.particulars[a].amount.replaceAll(",",""));
					}
					self.newTotalAmount = format(parseFloat(self.newTotalAmount).toFixed(2));
					setTimeout(function() {
						self.loading = false;
						self.requestProcessing = false;
					}, 1000);
				}else if(self.particulars.length == 0){
					self.particulars = [];
					self.newTotalAmount = '';
				}
			},
			// Delete e transaction particular details
			removeParticular(row){
				let self = this;

				this.$swal({
					title: 'Are you sure?',
					text: "You want to remove this particular",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#f5c71a',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						self.requestProcessing = true;
						self.loading = true;
						self.particulars.splice((parseInt(row.rowNum - 1)), 1);
						self.$swal({
							title: 'Success',
							text: 'Particular remove successfully!',
							icon: 'success',
							confirmButtonColor: '#b80000',
							confirmButtonText: 'OK'
						}).then(() => {
							self.getParticulars();
							self.requestProcessing = false;
						});
					}
				});
			},
			// Save new e transaction details
			addETransaction(){
				let self = this;

				self.$v.newEWallet.$touch();
				self.$v.newEWAccount.$touch();
				self.$v.newPayee.$touch();
				self.$v.newPayeeAccount.$touch();
				self.$v.newTransactionDate.$touch();
				self.$v.newTotalAmount.$touch();
				if(!self.$v.newEWallet.$error && !self.$v.newEWAccount.$error && !self.$v.newPayee.$error && !self.$v.newPayeeAccount.$error && !self.$v.newTransactionDate.$error && !self.$v.newTotalAmount.$error){
					self.requestProcessing = true;
					let getUserId = dbUsers.collection("users")
						.where("username","==",localStorage.getItem("aisname"));
					let users = [], voucherSeries = [];
					let voucher = dbUsers.collection('eTransactions')
								.orderBy('voucherDate', 'desc');


					voucher.limit(1).get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							if(doc.exists){
								voucherSeries.push(doc.data());
							}
						});
						let lastVoucher = '';
						let genVoucherNo = new Date();

						if(voucherSeries.length != 0){
							lastVoucher = addZero(parseInt(voucherSeries[0].voucherNumber.slice(7)) + 1, 5);
							if(lastVoucher.toString() == '100000'){
								lastVoucher = '00001';
							}
						}else{
							lastVoucher = '00001';
						}
						getUserId.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								users.push(doc.data());
							});
							let dataId = 'ETI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
							
							dbUsers.collection("eTransactions").doc()
							.set({
								eTransactionId: dataId,
								voucherNumber: addZero(genVoucherNo.getMonth() + 1) + '' + (genVoucherNo.getFullYear().toString()).slice(2,4) + '-' + lastVoucher,
								voucherDate: genVoucherNo,
								payee: self.newPayee,
								payeeAccountNumber: self.newPayeeAccount,
								transactionNumber: self.newTransactionNumber,
								transactionDate: self.newTransactionDate,
								totalAmount: self.newTotalAmount.replaceAll(",",""),
								eWalletReference: self.newEWallet,
								eWalletAccountReference: self.newEWAccount,
								status: 1,
								userReference: users[0].userId,
								dateCreated: today,
								dateModified: today
							}).then(() => {
								if(self.particulars.length != 0){
									for(let a = 0; a < self.particulars.length; a++){
										let etpID = 'ETPI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
										let caID = 'CAI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

										dbUsers.collection("eTransactionParticulars").doc()
										.set({
											eTransactionParticularId: etpID,
											particular: self.particulars[a].particular,
											quantity: self.particulars[a].quantity,
											unitPrice: self.particulars[a].unitPrice,
											referenceNumber: self.particulars[a].referenceNumber,
											amount: self.particulars[a].amount,
											eTransactionReference: dataId,
											status: 1,
											userReference: users[0].userId,
											dateCreated: today,
											dateModified: today
										});
										if(self.particulars[a].type == "Cash Advance"){
											dbExpense.collection("cashAdvances").doc()
											.set({
												cashAdvanceId: caID,
												cashAdvanceName: self.particulars[a].particular,
												cashAdvanceAmount: self.particulars[a].amount,
												type: 'E Wallet',
												caTypeReference: self.particulars[a].caType,
												cashAdvanceDate: self.newTransactionDate,
												reference: '',
												description: '',
												status: 1,
												userReference: users[0].userId,
												dateCreated: today,
												dateModified: today
											});
										}
									}
								}
								self.newEWallet = "";
								self.newEWAccount = "";
								self.newPayee = "";
								self.newPayeeAccount = '';
								self.newTransactionNumber = '';
								self.newTransactionDate = '';
								self.newTotalAmount = '';
								self.particulars = [];
								self.$v.newEWallet.$reset();
								self.$v.newEWAccount.$reset();
								self.$v.newPayee.$reset();
								self.$v.newPayeeAccount.$reset();
								self.$v.newTransactionDate.$reset();
								self.$v.newTotalAmount.$reset();
								self.requestProcessing = false;
								self.$swal({
									title: 'Success',
									text: 'New e transaction created successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								}).then(() => {
									self.$router.push("/view/electronic/transaction/" + dataId);
								});
							});
						});
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