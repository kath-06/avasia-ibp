<template>
	<card>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Distributor:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>PO Date:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-4 pl-5">
				<v-select id="inputStyle"
					:options="distributors"
					:reduce="distributor => distributor.distributorId"
					label="distributorName"
					v-model="newDistributor"
					:clearable="false"
					@input="getItems(newDistributor)"></v-select>
				<i class="text-red"
					v-if="$v.newDistributor.$anyDirty && !$v.newDistributor.required">Field Required</i>
			</div>
			<div class="col-sm-2 pr-5">
				<base-button v-b-modal.new-distributor-modal
					id="darkBtn" block
					:disabled="requestProcessing">Add</base-button>
			</div>
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newPODate"
					type="date"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newPODate.$anyDirty && !$v.newPODate.required">Field Required</i>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Terms:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Expected Delivery Date:</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newTerms"
					type="text"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newTerms.$anyDirty && !$v.newTerms.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newTerms.$anyDirty && !$v.newTerms.alphaNumCustomValidator">Invalid Characters</i>
			</div>
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newExDeliveryDate"
					type="date"
					id="inputStyle"></base-input>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Delivery Address:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Total Amount:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<textarea rows="2"
					cols="49"
					v-model="newDeliveryAddress"
					id="inputStyle"
					class="pl-2"
					placeholder="Delivery Address"></textarea><br>
				<i class="text-red"
					v-if="$v.newDeliveryAddress.$anyDirty && !$v.newDeliveryAddress.required">Field Required</i>
			</div>
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newTotalAmount"
					type="text"
					id="inputStyle" disabled></base-input>
				<i class="text-red"
					v-if="$v.newTotalAmount.$anyDirty && !$v.newTotalAmount.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newTotalAmount.$anyDirty && !$v.newTotalAmount.amountCustomValidator">Invalid Characters</i>
			</div>
		</div>
		<hr class="mb-2 mt-2">
		<div class="text-right">
			<base-button v-b-modal.new-po-item-modal
				class="col-md-2 ml-2"
				id="darkBtn"
				:disabled="requestProcessing">Add Item</base-button>
		</div>
		<hr class="mb-2 mt-2">
		<div class="card-header bg-transparent pb-1">
			<div class="text-left">
				<h2 class="display-5"
					id="sideBarTxt">Items</h2>
			</div>       
		</div>
		<div class="table-full-width">
			<vue-good-table :columns="columns"
				:rows="poItems"
				:search-options="{enabled: false}"
				:pagination-options="{
					enabled: true,
					perPageDropdown: [10, 15, 20],
				}"
				:sort-options="{enabled: true}"
				:line-numbers="true"
				:isLoading="loading">
				<template slot="table-row" slot-scope="props">
					<b><span v-if="props.column.field == 'itemReference'">
						<span v-for="item in items"
							v-bind:key="item.productId">
							<span v-if="item.productId == props.row.itemReference">{{item.productName}}</span>
						</span>
					</span>
					<span v-if="props.column.field == 'description'">
						<span>{{props.row.description == '' ? '----------' : props.row.description}}</span>
					</span>
					<span v-if="props.column.field == 'quantity'">
						<span>{{props.row.quantity}}</span>
					</span>
					<span v-if="props.column.field == 'unitPrice'">
						<span class="tableSpan">₱ {{props.row.unitPrice}}</span>
					</span>
					<span v-if="props.column.field == 'amount'">
						<span class="tableSpan">₱ {{props.row.amount}}</span>
					</span>
					<span v-if="props.column.field == 'action'">
						<span class="pointer ml-2 far fa-times-circle text-red"
							id="sideBarTxt"
							v-on:click="removeItem(props.row)"
							title="Remove"></span>
					</span></b>
				</template>
			</vue-good-table>
		</div>
		<hr class="mb-2 mt-2">
		<div class="text-right">
			<base-button id="darkBtn"
				class="col-md-2 ml-2"
				@click.native="addPurchaseOrder"
				:disabled="requestProcessing">Save</base-button>
		</div>
		<!-- NEW DISTRIBUTOR MODAL -->
		<b-modal size="lg"
			id="new-distributor-modal"
			title="New Distributor" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Distributor:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Address:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newDistributorName"
						id="inputStyle"
						type="text"
						placeholder="Distributor"></base-input>
					<i class="text-red"
						v-if="$v.newDistributorName.$anyDirty && !$v.newDistributorName.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newDistributorName.$anyDirty && !$v.newDistributorName.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
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
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Tin Number:</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Contact Number:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newTinNumber"
						id="inputStyle"
						type="text"
						placeholder="Tin Number"></base-input>
					<i class="text-red"
						v-if="$v.newTinNumber.$anyDirty && !$v.newTinNumber.numCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newContactNumber"
						id="inputStyle"
						type="text"
						placeholder="Contact Number"></base-input>
					<i class="text-red"
						v-if="$v.newContactNumber.$anyDirty && !$v.newContactNumber.numCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Contact Person:</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Email Address:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newContactPerson"
						id="inputStyle"
						type="text"
						placeholder="Contact Person"></base-input>
					<i class="text-red"
						v-if="$v.newContactPerson.$anyDirty && !$v.newContactPerson.alphaCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newEmailAddress"
						id="inputStyle"
						type="text"
						placeholder="Email Address"></base-input>
					<i class="text-red"
						v-if="$v.newEmailAddress.$anyDirty && !$v.newEmailAddress.email">Invalid Characters</i>
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
							@click.native="$bvModal.hide('new-distributor-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- ADD PO ITEM MODAL -->
		<b-modal size="xl"
			id="new-po-item-modal"
			title="Add PO Item" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Items:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Description:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="items"
						:reduce="item => item.productId"
						label="productName"
						v-model="newPOItem"
						:clearable="false"
						@input="changeItem(newPOItem)"></v-select>
					<i class="text-red"
						v-if="$v.newPOItem.$anyDirty && !$v.newPOItem.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<textarea rows="2"
						cols="59"
						v-model="newPODescription"
						id="inputStyle"
						class="pl-2"
						placeholder="Description"></textarea>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Quantity:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Unit Price:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newPOQuantity"
						id="inputStyle"
						type="text"
						placeholder="Quantity"
						@input="computeAmount(newPOQuantity, newPOUnitPrice, 'add')"></base-input>
					<i class="text-red"
						v-if="$v.newPOQuantity.$anyDirty && !$v.newPOQuantity.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newPOQuantity.$anyDirty && !$v.newPOQuantity.numCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newPOUnitPrice"
						id="inputStyle"
						type="text"
						placeholder="Unit Price"
						@input="computeAmount(newPOQuantity, newPOUnitPrice, 'add')"></base-input>
					<i class="text-red"
						v-if="$v.newPOUnitPrice.$anyDirty && !$v.newPOUnitPrice.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newPOUnitPrice.$anyDirty && !$v.newPOUnitPrice.amountCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Amount:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newPOAmount"
						id="inputStyle"
						type="text"
						placeholder="Amount" disabled></base-input>
					<i class="text-red"
						v-if="$v.newPOAmount.$anyDirty && !$v.newPOAmount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newPOAmount.$anyDirty && !$v.newPOAmount.amountCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addPOItems"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('new-po-item-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
	</card>
</template>
<script>
	import {dbMains} from '@/main';
	import {helpers, required, email} from "vuelidate/lib/validators";
	import {mapGetters} from 'vuex';
	import {upperCase} from 'text-case';

	const moment  = require('moment');
	const today = new Date();
	const addZero = require('add-zero');
	const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -./, A-Za-z0-9 ]*$/);
	const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z. ]*$/);
	const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ -. 0-9 ]*$/);
	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ ,. 0-9 ]*$/);
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');

	export default {
		name: "new-purchase-order",
		components: {},
		data() {
			return {
				loading: false,
				// New purchase order
				newDistributor: '',
				newDeliveryAddress: '',
				newTerms: '',
				newPODate: moment().format('YYYY-MM-DD'),
				newExDeliveryDate: '',
				newTotalAmount: '',
				// New distributor
				newDistributorName: '',
				newAddress: '',
				newTinNumber: '',
				newContactNumber: '',
				newContactPerson: '',
				newEmailAddress: '',
				// Enable/disable buttons
				requestProcessing: false,
				// New purchase order items
				newPOItem: '',
				newPODescription: '',
				newPOQuantity: '',
				newPOUnitPrice: '',
				newPOAmount: '',
				// Purchase order item table
				poItems: [],
				columns: [{
						label: 'Item',
						field: 'itemReference'
					},{
						label: 'Description',
						field: 'description'
					},{
						label: 'Quantity',
						field: 'quantity'
					},{
						label: 'Unit Price',
						field: 'unitPrice'
					},{
						label: 'Amount',
						field: 'amount'
					},{
						label: '',
						field: 'action',
						width: '50px'
					}
				],
			};
		},
		computed: {
			...mapGetters({
				distriValid: 'Sales/valid',
				distriError: 'Sales/error',
				distributors: 'Sales/distributor',
				items: 'Products/product',
				error: 'PurchaseOrders/error',
			})
		},
		validations: {
			// New purchase order
			newDistributor: {required},
			newDeliveryAddress: {required},
			newTerms: {
				required,
				alphaNumCustomValidator
			},
			newPODate: {required},
			newTotalAmount: {
				required,
				amountCustomValidator
			},
			// New distributor validations
			newDistributorName: {
				required,
				alphaNumCustomValidator
			},
			newAddress: {required},
			newTinNumber: {numCustomValidator},
			newContactNumber: {numCustomValidator},
			newContactPerson: {alphaCustomValidator},
			newEmailAddress: {email},
			// New purchase order item validations
			newPOItem: {required},
			newPOQuantity: {
				required,
				numCustomValidator
			},
			newPOUnitPrice: {
				required,
				amountCustomValidator
			},
			newPOAmount: {
				required,
				amountCustomValidator
			},
		},
		async mounted(){
			this.getCompany();
			this.getDistributors();
		},
		methods: {
			// Get company details
			getCompany(){
				let self = this, data = [];
				let companyData = dbMains.collection("companyProfile");

				self.company = [];
				companyData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						data.push(doc.data());
					});
					self.newDeliveryAddress = data[0].address;
				});
			},
			// Get distributor details
			async getDistributors(){
				let self = this;

				self.$store.dispatch("Sales/getDistributor");
			},
			// Add new distributor
			async addDistributor(){
				let self = this;

				self.$v.newDistributorName.$touch();
				self.$v.newAddress.$touch();
				self.$v.newTinNumber.$touch();
				self.$v.newContactNumber.$touch();
				self.$v.newContactPerson.$touch();
				self.$v.newEmailAddress.$touch();
				if(!self.$v.newDistributorName.$error && !self.$v.newAddress.$error && !self.$v.newTinNumber.$error && !self.$v.newContactNumber.$error && !self.$v.newContactPerson.$error && !self.$v.newEmailAddress.$error){
					self.requestProcessing = true;
					let distributorData = {
						distributorId: '',
						distributorName: upperCase(self.newDistributorName),
						address: self.newAddress,
						tin: self.newTinNumber,
						contactNumber: self.newContactNumber,
						contactPerson: self.newContactPerson,
						email: self.newEmailAddress,
						userReference: '',
						status: 1,
						dateCreated: today,
						dateModified: today,
					};

					self.$store.dispatch("Sales/checkDistributor", {
						validate: 1,
						newDistributor: self.newDistributorName
					}).then(() => {
						setTimeout(function(){
							if(self.distriValid == 1){
								self.validationMessage('Distributor');
							}else if(self.distriValid == 0){
								self.$store.dispatch("Sales/checkDistributor", {
									validate: 2,
									newTinNumber: self.newTinNumber
								}).then(() => {
									setTimeout(function(){
										if(self.distriValid == 1){
											self.validationMessage('Tin');
										}else if(self.distriValid == 0){
											self.$store.dispatch("Sales/checkDistributor", {
												validate: 3,
												newContactNumber: self.newContactNumber
											}).then(() => {
												setTimeout(function(){
													if(self.distriValid == 1){
														self.validationMessage('Contact number');
													}else if(self.distriValid == 0){
														self.$store.dispatch("Sales/checkDistributor", {
															validate: 4,
															newEmailAddress: self.newEmailAddress
														}).then(() => {
															setTimeout(function(){    
																if(self.distriValid == 1){
																	self.validationMessage('Email address');
																}else if(self.distriValid == 0){
																	self.$store.dispatch("Sales/newDistributor", distributorData)
																	.then(() => {
																		self.requestProcessing = false;
																		setTimeout(function(){
																			if(self.distriError == 0){
																				self.newDistributorName = '';
																				self.newAddress = '';
																				self.newTinNumber = '';
																				self.newContactNumber = '';
																				self.newContactPerson = '';
																				self.newEmailAddress = '';
																				self.$v.newDistributorName.$reset();
																				self.$v.newAddress.$reset();
																				self.$v.newTinNumber.$reset();
																				self.$v.newContactNumber.$reset();
																				self.$v.newContactPerson.$reset();
																				self.$v.newEmailAddress.$reset();
																				self.getDistributors();
																				self.$bvModal.hide('new-distributor-modal');
																				self.$swal({
																					title: 'Success',
																					text: 'New distributor added successfully!',
																					icon: 'success',
																					confirmButtonColor: '#b80000',
																					confirmButtonText: 'OK'
																				});
																			}else if(self.distriError == 1){
																				self.errorMessage();
																			}
																		},500);
																	});
																}
															},500);
														});
													}
												},500);
											});
										}
									},500);
								});
							}
						},500);
					});
				}
			},
			//Validation Message
			validationMessage(msg){
				let self = this;

				self.$swal({
					title: 'Invalid',
					text: msg + ' already exists.',
					icon: 'error',
					confirmButtonColor: '#b80000',
					confirmButtonText: 'OK'
				});
				self.requestProcessing = false;
			},
			//Error Message
			errorMessage(){
				let self = this;

				self.$swal({
					title: 'Error',
					text: 'Something went wrong. Please try again.',
					icon: 'error',
					confirmButtonColor: '#b80000',
					confirmButtonText: 'OK'
				});
			},
			async getItems(distri){
				let self = this;
				
				self.newPOItem = '';
				self.$store.dispatch("Products/getProduct", {distributor: distri});
			},
			// Add new product details
			async addProduct(){
				let self = this;

				self.$v.newProduct.$touch();
				self.$v.newPrice.$touch();
				self.$v.newCategory.$touch();
				self.$v.newProductDistributor.$touch();
				if(!self.$v.newProduct.$error && !self.$v.newPrice.$error && !self.$v.newCategory.$error && !self.$v.newProductDistributor.$error){
					self.requestProcessing = true;
					let productData = {
						productId: '',
						productName: upperCase(self.newProduct),
						price: self.newPrice.replaceAll(",",""),
						categoryReference: self.newCategory,
						distributorReference: self.newProductDistributor,
						unit: self.newUnit,
						userReference: '',
						status: 1,
						dateCreated: today,
						dateModified: today,
					};

					self.$store.dispatch("Products/checkProduct", {
						newProduct: self.newProduct
					}).then(() => {
						setTimeout(function(){
							if(self.valid == 1){
								self.validationMessage('Product');
							}else if(self.valid == 0){
								self.$store.dispatch("Products/newProduct", productData)
								.then(() => {
									setTimeout(function(){
										if(self.error == 0){
											self.newProduct = '';
											self.newPrice = '';
											self.newCategory = '';
										self.newProductDistributor = '';
										self.newUnit = '';
										self.requestProcessing = false;
										self.$v.newProduct.$reset();
										self.$v.newPrice.$reset();
										self.$v.newCategory.$reset();
										self.$v.newProductDistributor.$reset();
										self.getItems(self.newDistributor);
										self.$swal({
											title: 'Success',
											text: 'New product added successfully!',
											icon: 'success',
											confirmButtonColor: '#b80000',
											confirmButtonText: 'OK'
										});
									}else if(self.error == 1){
										self.errorMessage();
									}
								},500);
							});
						}
					},500);
				});
			}
			},
			// Assign product price
			changeItem(item){
				let self = this;

				for(let a = 0; a < self.items.length; a++){
					if(self.items[a].productId == item){
						self.newPOUnitPrice = format(self.items[a].price);
					}
				}
			},
			// Compute product total amount
			computeAmount(quantity, price, type){
				price  = price.replaceAll(',', '');
				if (type == 'add') {
					this.newPOAmount = price * quantity;
					this.newPOAmount = format(parseFloat(this.newPOAmount).toFixed(2));
				}else if (type == 'update') {
					// this.edit.particularAmount = price * quantity;
				}
			},
			// Add new purchase order item
			addPOItems(){
				let self = this;

				self.$v.newPOItem.$touch();
				self.$v.newPOQuantity.$touch();
				self.$v.newPOUnitPrice.$touch();
				self.$v.newPOAmount.$touch();
				if(!self.$v.newPOItem.$error && !self.$v.newPOQuantity.$error && !self.$v.newPOUnitPrice.$error && !self.$v.newPOAmount.$error){
					self.requestProcessing = true;
					if(self.poItems.length == 0){
						self.poItems = [];
					}
					let newItem = {
						"rowNum": '',
						"itemReference": self.newPOItem,
						"description": self.newPODescription,
						"quantity": self.newPOQuantity,
						"unitPrice": format(self.newPOUnitPrice),
						"amount": format(self.newPOAmount),
					}

					self.poItems.push(newItem);
					self.$swal({
						title: 'Success',
						text: 'New item added successfully!',
						icon: 'success',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.newPOItem = '';
						self.newPODescription = '';
						self.newPOQuantity = '';
						self.newPOUnitPrice = '';
						self.newPOAmount = '';
						self.$v.newPOItem.$reset();
						self.$v.newPOQuantity.$reset();
						self.$v.newPOUnitPrice.$reset();
						self.$v.newPOAmount.$reset();
						self.$bvModal.hide('new-po-item-modal');
						self.getPOItems();
					});
					self.requestProcessing = false;
				}
			},
			// Display purchase order item details on table
			getPOItems(){
				let self = this;

				self.loading = false;
				if(self.poItems.length != 0){
					self.loading = true;
					self.newTotalAmount = 0;
					for(let a  = 0; a < self.poItems.length; a++){
						self.poItems[a].rowNum = a + 1;
						self.newTotalAmount = parseFloat(self.newTotalAmount) + parseFloat(self.poItems[a].amount.replaceAll(",",""));
					}
					self.newTotalAmount = format(parseFloat(self.newTotalAmount).toFixed(2));
					setTimeout(function() {
						self.loading = false;
						self.requestProcessing = false;
					}, 1000);
				}else if(self.poItems.length == 0){
					self.poItems = [];
					self.newTotalAmount = '';
				}
			},
			// Remove purchase order item details on table
			removeItem(item){
				let self = this;

				this.$swal({
					title: 'Are you sure?',
					text: "You want to remove this item",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#f5c71a',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						self.requestProcessing = true;
						self.loading = true;
						self.poItems.splice((parseInt(item.rowNum - 1)), 1);
						self.$swal({
							title: 'Success',
							text: 'Item remove successfully!',
							icon: 'success',
							confirmButtonColor: '#b80000',
							confirmButtonText: 'OK'
						}).then(() => {
							self.getPOItems();
							self.requestProcessing = false;
						});
					}
				});
			},
			// Add new purchase order details
			async addPurchaseOrder(){
				let self = this;

				self.$v.newDistributor.$touch();
				self.$v.newDeliveryAddress.$touch();
				self.$v.newTerms.$touch();
				self.$v.newPODate.$touch();
				self.$v.newTotalAmount.$touch();
				if(!self.$v.newDistributor.$error && !self.$v.newDeliveryAddress.$error && !self.$v.newTerms.$error && !self.$v.newPODate.$error && !self.$v.newTotalAmount.$error){
					self.requestProcessing = true;
					let dataId = 'POI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
					let poData = {
						purchaseOrderId: dataId,
						poNumber: '',
						poDate: self.newPODate,
						totalAmount: self.newTotalAmount.replaceAll(",",""),
						deliveryAddress: self.newDeliveryAddress,
						deliveryDate: self.newExDeliveryDate,
						terms: self.newTerms,
						remarks: '',
						attention: '',
						distributorReference: self.newDistributor,
						status: 1,
						userReference: '',
						dateCreated: today,
						dateModified: today
					};
					self.$store.dispatch("PurchaseOrders/newPurchaseOrder", poData)
					.then(() => {
						setTimeout(function() {
							if(self.error == 0){
								if(self.poItems.length != 0){
									for(let a = 0; a < self.poItems.length; a++){
										let poItemData = {
											purchaseOrderItemId: '',
											unitPrice: self.poItems[a].unitPrice,
											quantity: self.poItems[a].quantity,
											description: self.poItems[a].description,
											poReference: dataId,
											itemReference: self.poItems[a].itemReference,
											userReference: '',
											status: 1,
											dateCreated: today,
											dateModified: today
										};

										self.$store.dispatch("PurchaseOrders/newPurchaseOrderItem", poItemData);
									}
								}
								self.newDistributor = "";
								self.newDeliveryAddress = "";
								self.newTerms = "";
								self.newPODate = '';
								self.newExDeliveryDate = '';
								self.newTotalAmount = '';
								self.poItems = [];
								self.$v.newDistributor.$reset();
								self.$v.newDeliveryAddress.$reset();
								self.$v.newTerms.$reset();
								self.$v.newPODate.$reset();
								self.requestProcessing = false;
								self.$swal({
									title: 'Success',
									text: 'New purchase order added successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								});
							}else if(self.error == 1){
								self.errorMessage();
							}

						}, 1000);
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