<template>
	<card>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>D.R. No.:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Delivery Date:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newDRNumber"
					type="text"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newDRNumber.$anyDirty && !$v.newDRNumber.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newDRNumber.$anyDirty && !$v.newDRNumber.numCustomValidator">Invalid Characters</i>
			</div>
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newDeliveryDate"
					type="date"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newDeliveryDate.$anyDirty && !$v.newDeliveryDate.required">Field Required</i>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>P.O. No.:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>S.I. No.:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-4 pl-5">
				<base-input v-model="newPONumber"
					type="text"
					id="inputStyle"
					@input="changePOData"></base-input>
				<i class="text-red"
					v-if="$v.newPONumber.$anyDirty && !$v.newPONumber.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newPONumber.$anyDirty && !$v.newPONumber.alphaNumCustomValidator">Field Required</i>
			</div>
			<div class="col-sm-2 pr-5">
				<base-button v-b-modal.choose-po-number-modal
					id="darkBtn" block
					:disabled="requestProcessing">Choose</base-button>
			</div>
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newSINumber"
					type="text"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newSINumber.$anyDirty && !$v.newSINumber.required">Field Required</i>
				<i class="text-red"
					v-if="$v.newSINumber.$anyDirty && !$v.newSINumber.alphaNumCustomValidator">Field Required</i>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Terms:</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Delivered To:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-4 pl-5">
				<v-select id="inputStyle"
					:options="paymentTerms"
					:reduce="term => term.paymentTermId"
					label="description"
					v-model="newTerm"
					:clearable="true"></v-select>
			</div>
			<div class="col-sm-2 pr-5">
				<base-button v-b-modal.new-payment-terms-modal
					id="darkBtn" block
					:disabled="requestProcessing">Add</base-button>
			</div>
			<div class="col-sm-4 pl-5">
				<v-select id="inputStyle"
					:options="customers"
					:reduce="cus => cus.customerId"
					label="name"
					v-model="newDeliveredTo"
					:clearable="false"></v-select>
				<i class="text-red"
					v-if="$v.newDeliveredTo.$anyDirty && !$v.newDeliveredTo.required">Field Required</i>
			</div>
			<div class="col-sm-2 pr-5">
				<base-button v-b-modal.new-customer-modal
					id="darkBtn" block
					:disabled="requestProcessing">Add</base-button>
			</div>
		</div>
		<div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Client P.O. No.:</b>
				<b class="text-red">*</b>
			</label>
			<label class="col-sm-6 col-form-label">
				<b>Total Amount:</b>
				<b class="text-red">*</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<base-input v-model="newClientPO"
					type="text"
					id="inputStyle"></base-input>
				<i class="text-red"
					v-if="$v.newClientPO.$anyDirty && !$v.newClientPO.required">Field Required</i>
			</div>
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
			<base-button v-b-modal.new-dr-item-modal
				class="col-md-2 ml-2"
				id="darkBtn"
				:disabled="requestProcessing">Add Item</base-button>
		</div>
		<hr class="mb-2 mt-2">
		<div class="card-header bg-transparent pb-1">
			<div class="text-left">
				<h2
					class="display-5"
					id="sideBarTxt">Items</h2>
			</div>       
		</div>
		<div class="table-full-width">
			<vue-good-table :columns="columns"
				:rows="drItems"
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
						<span
							v-for="item in items"
							v-bind:key="item.itemId">
							<span v-if="item.itemId == props.row.itemReference">{{item.itemName}}</span>
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
					<span v-if="props.column.field == 'vat'">
						<span v-for="vat in vats"
							v-bind:key="vat.vatId">
							<span v-if="vat.vatId == props.row.vat">{{vat.vat}}</span>
						</span>
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
				@click.native="addDeliveryReceipt"
				:disabled="requestProcessing">Save</base-button>
		</div>
		<!-- ADD CUSTOMER MODAL -->
		<b-modal size="xl"
			id="new-customer-modal"
			title="New Customer" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Type:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b v-if="newCustomerType == 'individual'">Full Name:</b>
					<b v-if="newCustomerType == 'corporate'">Company:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="customerTypes"
						:reduce="type => type.typeId"
						label="type"
						v-model="newCustomerType"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.newCustomerType.$anyDirty && !$v.newCustomerType.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5"
					v-if="newCustomerType == 'individual'">
					<base-input v-model="newFullName"
						id="inputStyle"
						type="text"
						placeholder="Full Name"></base-input>
					<i class="text-red"
						v-if="$v.newFullName.$anyDirty && !$v.newFullName.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newFullName.$anyDirty && !$v.newFullName.alphaCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5"
					v-if="newCustomerType == 'corporate'">
					<base-input v-model="newCompany"
						id="inputStyle"
						type="text"
						placeholder="Company"></base-input>
					<i class="text-red"
						v-if="$v.newCompany.$anyDirty && !$v.newCompany.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newCompany.$anyDirty && !$v.newCompany.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Tin:</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Email:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newTin"
						id="inputStyle"
						type="text"
						placeholder="Tin"></base-input>
					<i class="text-red"
						v-if="$v.newTin.$anyDirty && !$v.newTin.numCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newEmail"
						id="inputStyle"
						type="text"
						placeholder="Email"></base-input>
					<i class="text-red"
						v-if="$v.newEmail.$anyDirty && !$v.newEmail.email">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Contact Number:</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Address:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newContactNumber"
						id="inputStyle"
						type="text"
						placeholder="Contact Number"></base-input>
					<i class="text-red"
						v-if="$v.newContactNumber.$anyDirty && !$v.newContactNumber.numCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<textarea rows="4"
						cols="59"
						v-model="newAddress"
						id="inputStyle"
						class="pl-2"
						placeholder="Address"></textarea>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Payment Terms:</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Credit Limit:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="paymentTerms"
						:reduce="term => term.paymentTermId"
						label="description"
						v-model="newCustomerTerm"
						:clearable="true"></v-select>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newCreditLimit"
						id="inputStyle"
						type="text"
						placeholder="Credit Limit"></base-input>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Is Taxable?</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Business Style:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="taxables"
						:reduce="tax => tax.taxableId"
						label="taxable"
						v-model="newTaxable"
						:clearable="true"></v-select>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newBusinessStyle"
						id="inputStyle"
						type="text"
						placeholder="Business Style"></base-input>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addCustomer"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('new-customer-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- ADD PAYMENT TERMS MODAL -->
		<b-modal size="lg"
			id="new-payment-terms-modal"
			title="New Payment Terms" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Description:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Value:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newDescription"
						id="inputStyle"
						type="text"
						placeholder="Description"></base-input>
					<i class="text-red"
						v-if="$v.newDescription.$anyDirty && !$v.newDescription.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newDescription.$anyDirty && !$v.newDescription.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newValue"
						id="inputStyle"
						type="text"
						placeholder="Value"></base-input>
					<i class="text-red"
						v-if="$v.newValue.$anyDirty && !$v.newValue.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newValue.$anyDirty && !$v.newValue.numCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addPaymentTerms"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('new-payment-terms-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- CHOOSE PO NUMBER -->
		<b-modal size="md"
			id="choose-po-number-modal"
			title="Choose P.O. Number" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-12 col-form-label">
					<b>P.O. No.:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-12 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="poNumbers"
						:reduce="num => num.purchaseOrderId"
						label="poNumber"
						v-model="choosePO"
						:clearable="true"></v-select>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="choosePONumber"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>Choose
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('choose-po-number-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- ADD DR ITEM MODAL -->
		<b-modal size="xl"
			id="new-dr-item-modal"
			title="Add DR Item" centered
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
				<div class="col-sm-4 pl-5">
					<v-select id="inputStyle"
						:options="items"
						:reduce="item => item.itemId"
						label="itemName"
						v-model="newDRItem"
						:clearable="false"
						@input="changeItem(newDRItem)"></v-select>
					<i class="text-red"
						v-if="$v.newDRItem.$anyDirty && !$v.newDRItem.required">Field Required</i>
				</div>
				<div class="col-sm-2 pr-5">
					<base-button v-b-modal.new-item-modal
						id="darkBtn" block
						:disabled="requestProcessing">Add</base-button>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<textarea rows="2"
						cols="59"
						v-model="newDRDescription"
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
					<base-input v-model="newDRQuantity"
						id="inputStyle"
						type="text"
						placeholder="Quantity"
						@input="computeAmount(newDRQuantity, newDRUnitPrice, 'add')"></base-input>
					<i class="text-red"
						v-if="$v.newDRQuantity.$anyDirty && !$v.newDRQuantity.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newDRQuantity.$anyDirty && !$v.newDRQuantity.numCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newDRUnitPrice"
						id="inputStyle"
						type="text"
						placeholder="Unit Price"
						@input="computeAmount(newDRQuantity, newDRUnitPrice, 'add')"></base-input>
					<i class="text-red"
						v-if="$v.newDRUnitPrice.$anyDirty && !$v.newDRUnitPrice.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newDRUnitPrice.$anyDirty && !$v.newDRUnitPrice.amountCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Amount:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>VAT:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newDRAmount"
						id="inputStyle"
						type="text"
						placeholder="Amount" disabled></base-input>
					<i class="text-red"
						v-if="$v.newDRAmount.$anyDirty && !$v.newDRAmount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newDRAmount.$anyDirty && !$v.newDRAmount.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="vats"
						:reduce="vat => vat.vatId"
						label="vat"
						v-model="newDRVAT"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.newDRVAT.$anyDirty && !$v.newDRVAT.required">Field Required</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addDRItems"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('new-dr-item-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- ADD ITEM MODAL -->
		<b-modal size="lg"
			id="new-item-modal"
			title="New Item" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Item Name:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Type:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newItemName"
						id="inputStyle"
						type="text"
						placeholder="Item Name"></base-input>
					<i class="text-red"
						v-if="$v.newItemName.$anyDirty && !$v.newItemName.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newItemName.$anyDirty && !$v.newItemName.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="types"
						:reduce="type => type.typeId"
						label="type"
						v-model="newType"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.newType.$anyDirty && !$v.newType.required">Field Required</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Category:</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Cost Price:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="categories"
						:reduce="cat => cat.itemCategoryId"
						label="categoryName"
						v-model="newCategory"
						:clearable="true"></v-select>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newCostPrice"
						id="inputStyle"
						type="text"
						placeholder="Cost Price"></base-input>
					<i class="text-red"
						v-if="$v.newCostPrice.$anyDirty && !$v.newCostPrice.amountCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Sale Price:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Supplier:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newSalePrice"
						id="inputStyle"
						type="text"
						placeholder="Sale Price"></base-input>
					<i class="text-red"
						v-if="$v.newSalePrice.$anyDirty && !$v.newSalePrice.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="suppliers"
						:reduce="sup => sup.supplierId"
						label="supplierName"
						v-model="newItemSupplier"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.newItemSupplier.$anyDirty && !$v.newItemSupplier.required">Field Required</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Unit:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newUnit"
						id="inputStyle"
						type="text"
						placeholder="Unit"></base-input>
					<i class="text-red"
						v-if="$v.newUnit.$anyDirty && !$v.newUnit.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addItem"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('new-item-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
	</card>
</template>
<script>
	import {dbUsers, dbMains, dbSales} from '@/main';
	import {helpers, required, email} from "vuelidate/lib/validators";

	const moment = require('moment');
	const today = new Date();
	const addZero = require('add-zero');
	const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -./, A-Za-z0-9 ]*$/);
	const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z. ]*$/);
	const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ -. 0-9 ]*$/);
	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ ,. 0-9 ]*$/);
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');

	export default {
		name: "new-delivery-receipt",
		components: {},
		data() {
			return {
				loading: false,
				customers: [],
				suppliers: [],
				paymentTerms: [],
				newDRNumber: '',
				newDeliveryDate: moment().format('YYYY-MM-DD'),
				newPONumber: '',
				newPORef: '',
				newSINumber: '',
				newTerm: '',
				newDeliveredTo: '',
				newClientPO: '',
				newTotalAmount: '',
				requestProcessing: false,
				customerTypes: [
					{'typeId': 'corporate', 'type': 'Corporate'},
					{'typeId': 'individual', 'type': 'Individual'},
				],
				taxables: [
					{'taxableId': 1, 'taxable': 'Yes'},
					{'taxableId': 0, 'taxable': 'No'}
				],
				newCustomerType: 'corporate',
				newFullName: '',
				newCompany: '',
				newTin: '',
				newEmail: '',
				newContactNumber: '',
				newAddress: '',
				newCustomerTerm: '',
				newCreditLimit: '',
				newTaxable: '',
				newBusinessStyle: '',
				newDescription: '',
				newValue: '',
				poNumbers: [],
				choosePO: '',
				items: [],
				vats: [
					{'vatId': 'taxInclusive', 'vat': 'Tax Inclusive'},
					{'vatId': 'taxExclusive', 'vat': 'Tax Exclusive'},
					{'vatId': 'vatExempt', 'vat': 'VAT Exempt'}
				],
				newDRItem: '',
				newDRDescription: '',
				newDRQuantity: '',
				newDRUnitPrice: '',
				newDRAmount: '',
				newDRVAT: 'taxInclusive',
				drItems: [],
				types: [
					{'typeId': 'Inventory (Finished Goods)', 'type': 'Inventory - Finished Goods'},
					{'typeId': 'Inventory (Raw Materials)', 'type': 'Inventory - Raw Materials'},
					{'typeId': 'Services', 'type': 'Services'}
				],
				categories: [],
				newItemName: '',
				newType: 'Inventory (Finished Goods)',
				newCategory: '',
				newCostPrice: '',
				newSalePrice: '',
				newItemSupplier: '',
				newUnit: '',
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
						label: 'VAT',
						field: 'vat'
					},{
						label: '',
						field: 'action',
						width: '50px'
					}
				],
			};
		},
		validations: {
			newDRNumber: {
				required,
				numCustomValidator
			},
			newDeliveryDate: {required},
			newPONumber: {
				required,
				alphaNumCustomValidator
			},
			newSINumber: {
				required,
				alphaNumCustomValidator
			},
			newDeliveredTo: {required},
			newClientPO: {required},
			newTotalAmount: {
				required,
				amountCustomValidator
			},
			newCustomerType: {required},
			newFullName: {
				required,
				alphaCustomValidator
			},
			newCompany: {
				required,
				alphaNumCustomValidator
			},
			newTin: {numCustomValidator},
			newEmail: {email},
			newContactNumber: {numCustomValidator},
			newDescription: {
				required,
				alphaNumCustomValidator
			},
			newValue: {
				required,
				numCustomValidator
			},
			newDRItem: {required},
			newDRQuantity: {
				required,
				numCustomValidator
			},
			newDRUnitPrice: {
				required,
				amountCustomValidator
			},
			newDRAmount: {
				required,
				amountCustomValidator
			},
			newDRVAT: {required},
			newItemName: {
				required,
				alphaNumCustomValidator
			},
			newType: {required},
			newCostPrice: {amountCustomValidator},
			newSalePrice: {amountCustomValidator},
			newItemSupplier: {required},
			newUnit: {alphaNumCustomValidator},
		},
		async mounted(){
			this.getCustomers();
			this.getSuppliers();
			this.getPaymentTerms();
			this.getPONumbers();
			this.getItems();
			this.getItemCategories();
		},
		methods: {
			getCustomers(){
				let self = this;
				let customerData = dbMains.collection("customers")
					.orderBy("name", "asc");

				self.customers = [];
				customerData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.customers.push(doc.data());
					});
					self.newInvoiceTo = self.customers[0].customerId;
				});
			},
			getSuppliers(){
				let self = this;
				let supplierData = dbMains.collection("suppliers")
					.orderBy("supplierName", "asc");

				self.suppliers = [];
				supplierData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.suppliers.push(doc.data());
					});
					self.newItemSupplier = self.suppliers[0].supplierId;
				});
			},
			getPaymentTerms(){
				let self = this;
				let termData = dbMains.collection("paymentTerms")
					.orderBy("description", "asc");

				self.paymentTerms = [];
				termData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.paymentTerms.push(doc.data());
					});
				});
			},
			getPONumbers(){
				let self = this;
				let poData = dbSales.collection("purchaseOrders")
					.where("status","==",3)
					.orderBy("poNumber", "asc");

				self.poNumbers = [];
				poData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.poNumbers.push(doc.data());
					});
				});
			},
			getItems(){
				let self = this;
				let itemData = dbSales.collection("items")
					.orderBy("itemName", "asc");

				self.items = [];
				itemData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.items.push(doc.data());
					});
					self.newDRItem = self.items[0].itemId;
					self.changeItem(self.items[0].itemId);
				});
			},
			getItemCategories(){
				let self = this;
				let categoryData = dbSales.collection("itemCategories")
					.orderBy("categoryName","asc");

				self.categories = [];
				categoryData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.categories.push(doc.data());
					});
				});
			},
			changeItem(item){
				let self = this, price = '';
				let itemData = dbSales.collection("items")
					.where('itemId',"==",item)
					.orderBy("itemName", "asc");

				itemData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						price = doc.data().salePrice;
					});
					self.newDRUnitPrice = format(price);
				});
			},
			computeAmount(quantity, price, type){
				price  = price.replaceAll(',', '');
				if (type == 'add') {
					this.newDRAmount = price * quantity;
					this.newDRAmount = format(parseFloat(this.newDRAmount).toFixed(2));
				}else if (type == 'update') {
					// this.edit.particularAmount = price * quantity;
				}
			},
			addCustomer(){
				let self = this, formError = true;

				self.requestProcessing = false;
				self.$v.newCustomerType.$touch();
				self.$v.newFullName.$touch();
				self.$v.newCompany.$touch();
				self.$v.newTin.$touch();
				self.$v.newEmail.$touch();
				self.$v.newContactNumber.$touch();
				if(self.newCustomerType == 'individual' && !self.$v.newCustomerType.$error){
					if(!self.$v.newFullName.$error && !self.$v.newTin.$error && !self.$v.newEmail.$error && !self.$v.newContactNumber.$error){
						formError = false;
					}
				}else if(self.newCustomerType == 'corporate' && !self.$v.newCustomerType.$error){
					if(!self.$v.newCompany.$error && !self.$v.newTin.$error && !self.$v.newEmail.$error && !self.$v.newContactNumber.$error){
						formError = false;
					}
				}
				if(!formError){
					let nameData = null, name = '';

					self.requestProcessing = true;
					if(self.newCustomerType == 'individual'){
						nameData = dbMains.collection('customers')
							.where("name", "==",self.newFullName);
						name = self.newFullName;
					}else if(self.newCustomerType == 'corporate'){
						nameData = dbMains.collection('customers')
							.where("name", "==",self.newCompany);
						name = self.newCompany;
					}
					nameData.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) => {
								if(doc.exists){
									self.$swal({
										title: 'Invalid',
										text: 'Full Name/Company already exists.',
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
							let dataId = 'CID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

							getUserId.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									if(doc.exists){
										users.push(doc.data());
									}
								});
								try{
									dbMains.collection('customers').doc()
									.set({
										customerId: dataId,
										name: name,
										type: self.newCustomerType,
										tin: self.newTin,
										email: self.newEmail,
										contactNumber: self.newContactNumber,
										address: self.newAddress,
										paymentTermReference: self.newCustomerTerm,
										creditLimit: self.newCreditLimit,
										businessStyle: self.newBusinessStyle,
										taxable: self.newTaxable,
										userReference: users[0].userId,
										status: 1,
										dateCreated: today,
										dateModified: today
									}).then(() => {
										self.newCustomerType = 'corporate';
										self.newFullName = '';
										self.newCompany = '';
										self.newTin = '';
										self.newEmail = '';
										self.newContactNumber = '';
										self.newAddress = '';
										self.newCustomerTerm = '';
										self.newCreditLimit = '';
										self.newTaxable = '';
										self.requestProcessing = false;
										self.$v.newType.$reset();
										self.$v.newFullName.$reset();
										self.$v.newCompany.$reset();
										self.$v.newTin.$reset();
										self.$v.newEmail.$reset();
										self.$v.newContactNumber.$reset();
										self.$bvModal.hide('new-customer-modal');
										self.getCustomers();
										self.$swal({
											title: 'Success',
											text: 'New customer added successfully!',
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
			addPaymentTerms(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newDescription.$touch();
				self.$v.newValue.$touch();
				if(!self.$v.newDescription.$error && !self.$v.newValue.$error){
					let nameData = null;

					self.requestProcessing = true;
					nameData = dbMains.collection('paymentTerms')
						.where("description", "==",self.newDescription);
					nameData.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) => {
								if(doc.exists){
									self.$swal({
										title: 'Invalid',
										text: 'Payment term already exists.',
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
							let dataId = 'PTID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

							getUserId.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									if(doc.exists){
										users.push(doc.data());
									}
								});
								try{
									dbMains.collection('paymentTerms').doc()
									.set({
										paymentTermId: dataId,
										description: self.newDescription,
										value: self.newValue,
										userReference: users[0].userId,
										status: 1,
										dateCreated: today,
										dateModified: today
									}).then(() => {
										self.newDescription = '';
										self.newValue = '';
										self.requestProcessing = false;
										self.$v.newDescription.$reset();
										self.$v.newValue.$reset();
										self.$bvModal.hide('new-payment-terms-modal');
										self.getPaymentTerms();
										self.$swal({
											title: 'Success',
											text: 'New payment term added successfully!',
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
			choosePONumber(){
				let self = this;

				for(let a = 0; a < self.poNumbers.length; a++){
					if(self.poNumbers[a].purchaseOrderId == self.choosePO){
						self.newPONumber = self.poNumbers[a].poNumber;
						self.newPORef = self.choosePO;
					}
				}
				let poItemData = dbSales.collection("purchaseOrderItems")
					.where("poReference","==",self.newPORef);
				let newItem = [];

				self.drItems = [];
				poItemData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						newItem = {
							"rowNum": '',
							"itemReference": doc.data().itemReference,
							"description": doc.data().description,
							"quantity": doc.data().quantity,
							"unitPrice": doc.data().unitPrice,
							"amount": doc.data().amount,
							"vat": doc.data().vat
						}
						self.drItems.push(newItem);
					});
					self.getDRItems();
				});
				self.$bvModal.hide("choose-po-number-modal");
			},
			changePOData(){
				let self = this;

				if(self.newPONumber == '' && self.newPORef != ''){
					self.newPORef = '';
					self.drItems = [];
				}
				self.getDRItems();
			},
			addItem(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newItemName.$touch();
				self.$v.newType.$touch();
				self.$v.newCostPrice.$touch();
				self.$v.newSalePrice.$touch();
				self.$v.newItemSupplier.$touch();
				self.$v.newUnit.$touch();
				if(!self.$v.newItemName.$error && !self.$v.newType.$error && !self.$v.newCostPrice.$error && !self.$v.newSalePrice.$error && !self.$v.newItemSupplier.$error && !self.$v.newUnit.$error){
					let itemData = null;

					self.requestProcessing = true;
					itemData = dbSales.collection('items')
						.where("itemName","==",self.newItemName)
						.where("supplierReference","==",self.newItemSupplier);
					itemData.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) => {
								if(doc.exists){
									self.$swal({
										title: 'Invalid',
										text: 'Item name already exists.',
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
							let dataId = 'IID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

							self.newCostPrice = self.newCostPrice.replaceAll(",","");
							self.newSalePrice = self.newSalePrice.replaceAll(",","");
							getUserId.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									if(doc.exists){
										users.push(doc.data());
									}
								});
								try{
									dbSales.collection('items').doc()
									.set({
										itemId: dataId,
										itemName: self.newItemName,
										type: self.newType,
										costPrice: self.newCostPrice,
										salePrice: self.newSalePrice,
										unit: self.newUnit,
										categoryReference: self.newCategory,
										supplierReference: self.newItemSupplier,
										userReference: users[0].userId,
										status: 1,
										dateCreated: today,
										dateModified: today
									}).then(() => {
										self.newItemName = '';
										self.newType = 'inventory';
										self.newCategory = '';
										self.newCostPrice = '';
										self.newSalePrice = '';
										self.newItemSupplier = '';
										self.newUnit = '';
										self.requestProcessing = false;
										self.$v.newItemName.$reset();
										self.$v.newType.$reset();
										self.$v.newCostPrice.$reset();
										self.$v.newSalePrice.$reset();
										self.$v.newItemSupplier.$reset();
										self.$v.newUnit.$reset();
										self.$bvModal.hide('new-item-modal');
										self.getItems();
										self.$swal({
											title: 'Success',
											text: 'New item added successfully!',
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
			addDRItems(){
				let self = this;

				self.$v.newDRItem.$touch();
				self.$v.newDRQuantity.$touch();
				self.$v.newDRUnitPrice.$touch();
				self.$v.newDRAmount.$touch();
				self.$v.newDRVAT.$touch();
				if(!self.$v.newDRItem.$error && !self.$v.newDRQuantity.$error && !self.$v.newDRUnitPrice.$error && !self.$v.newDRAmount.$error && !self.$v.newDRVAT.$error){
					self.requestProcessing = true;
					if(self.drItems.length == 0){
						self.drItems = [];
					}
					let newItem = {
						"rowNum": '',
						"itemReference": self.newDRItem,
						"description": self.newDRDescription,
						"quantity": self.newDRQuantity,
						"unitPrice": format(self.newDRUnitPrice),
						"amount": format(self.newDRAmount),
						"vat": self.newDRVAT
					}

					self.drItems.push(newItem);
					self.$swal({
						title: 'Success',
						text: 'New item added successfully!',
						icon: 'success',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.newDRItem = '';
						self.newDRDescription = '';
						self.newDRQuantity = '';
						self.newDRUnitPrice = '';
						self.newDRAmount = '';
						self.newDRVAT = 'taxInclusive';
						self.$v.newDRItem.$reset();
						self.$v.newDRQuantity.$reset();
						self.$v.newDRUnitPrice.$reset();
						self.$v.newDRAmount.$reset();
						self.$v.newDRVAT.$reset();
						self.$bvModal.hide('new-dr-item-modal');
						self.getItems();
						self.getDRItems();
					});
					self.requestProcessing = false;
				}
			},
			getDRItems(){
				let self = this;

				self.loading = false;
				if(self.drItems.length != 0){
					self.loading = true;
					self.newTotalAmount = 0;
					for(let a  = 0; a < self.drItems.length; a++){
						self.drItems[a].rowNum = a + 1;
						self.newTotalAmount = parseFloat(self.newTotalAmount) + parseFloat(self.drItems[a].amount.replaceAll(",",""));
					}
					self.newTotalAmount = format(parseFloat(self.newTotalAmount).toFixed(2));
					setTimeout(function() {
						self.loading = false;
						self.requestProcessing = false;
					}, 1000);
				}else if(self.drItems.length == 0){
					self.drItems = [];
					self.newTotalAmount = '';
				}
			},
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
						self.drItems.splice((parseInt(item.rowNum - 1)), 1);
						self.$swal({
							title: 'Success',
							text: 'Item remove successfully!',
							icon: 'success',
							confirmButtonColor: '#b80000',
							confirmButtonText: 'OK'
						}).then(() => {
							self.getDRItems();
							self.requestProcessing = false;
						});
					}
				});
			},
			addDeliveryReceipt(){
				let self = this;

				self.$v.newDRNumber.$touch();
				self.$v.newDeliveryDate.$touch();
				self.$v.newPONumber.$touch();
				self.$v.newSINumber.$touch();
				self.$v.newDeliveredTo.$touch();
				self.$v.newClientPO.$touch();
				self.$v.newTotalAmount.$touch();
				if(!self.$v.newDRNumber.$error && !self.$v.newDeliveryDate.$error && !self.$v.newPONumber.$error && !self.$v.newSINumber.$error && !self.$v.newDeliveredTo.$error && !self.$v.newTotalAmount.$error){
					self.requestProcessing = true;
					let getUserId = dbUsers.collection("users")
						.where("username","==",localStorage.getItem("aisname"));
					let users = [], poReference;

					getUserId.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							users.push(doc.data());
						});
						let dataId = 'DRI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

						if(self.newPORef == ''){
							poReference = self.newPONumber;
						}else{
							poReference = self.newPORef;
						}
						dbSales.collection("deliveryReceipts").doc()
						.set({
							deliveryReceiptId: dataId,
							drNumber: self.newDRNumber,
							deliveryDate: self.newDeliveryDate,
							siNumber: self.newSINumber,
							clientPO: self.newClientPO,
							totalAmount: self.newTotalAmount.replaceAll(",",""),
							poReference: poReference,
							paymentTermReference: self.newTerm,
							customerReference: self.newDeliveredTo,
							status: 1,
							userReference: users[0].userId,
							dateCreated: today,
							dateModified: today
						}).then(() => {
							if(self.drItems.length != 0){
								for(let a = 0; a < self.drItems.length; a++){
									let driID = 'DRII-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

									dbSales.collection("deliveryReceiptItems").doc()
									.set({
										deliveryReceiptItemId: driID,
										description: self.drItems[a].description,
										quantity: self.drItems[a].quantity,
										unitPrice: self.drItems[a].unitPrice,
										amount: self.drItems[a].amount,
										vat: self.drItems[a].vat,
										itemReference: self.drItems[a].itemReference,
										drReference: dataId,
										status: 1,
										userReference: users[0].userId,
										dateCreated: today,
										dateModified: today
									});
								}
							}
							self.newDRNumber = "";
							self.newDeliveryDate = moment().format("YYYY-MM-DD");
							self.newPONumber = "";
							self.newPORef = '';
							self.newSINumber = '';
							self.newTerm = '';
							self.newDeliveredTo = '';
							self.newClientPO = '';
							self.newTotalAmount = '';
							self.drItems = [];
							self.$v.newDRNumber.$reset();
							self.$v.newDeliveryDate.$reset();
							self.$v.newPONumber.$reset();
							self.$v.newSINumber.$reset();
							self.$v.newDeliveredTo.$reset();
							self.$v.newClientPO.$reset();
							self.$v.newTotalAmount.$reset();
							self.requestProcessing = false;
							self.$swal({
								title: 'Success',
								text: 'New delivery receipt created successfully!',
								icon: 'success',
								confirmButtonColor: '#b80000',
								confirmButtonText: 'OK'
							}).then(() => {
								self.$router.push("/view/sales/delivery/receipt/" + dataId);
							});
						});
					});
				}
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