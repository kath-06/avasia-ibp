<template>
	<div id="textStyle"> 
		<base-header class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-12 container-fluid mt--7">
			<card>
				<div class="row pl-4">
					<span class="col-sm-12">
						<b>S.I. No. {{si.siNumber}}</b>
						<b v-if="si.status == 1"> (Pending)</b>
						<b v-if="si.status == 2"> (Released)</b>
						<b v-if="si.status == 3"> (Delivered)</b>
						<b v-if="si.status == 4"> (Done)</b>
						<b v-if="si.status == 5"> (Reject)</b>
						<b v-if="si.status == 0"> (Cancel)</b>
					</span>
				</div>
				<hr>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Invoice Date:</b> {{si.invoiceDate | moment("MMMM DD, YYYY")}}
					</span>
					<span class="col-sm-6">
						<b>Terms:</b> {{si.terms}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>P.O. Number:</b> {{si.poNumber}}
					</span>
					<span class="col-sm-6">
						<b>D.R. Number:</b> {{si.drNumber}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-12"
						id="particular">
						<b>Invoice To:</b> {{si.customer}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Client P.O. No.:</b> {{si.clientPO}}
					</span>
					<span class="col-sm-6">
						<b>Total Amount:</b> ₱ {{si.totalAmount}}
					</span>
				</div>
				<hr class="mb-1">
				<div class="text-left pl-2">
					<h2 class="display-5"
						id="sideBarTxt">Items</h2>
				</div>       
				<div class="table-full-width pt-2">
					<vue-good-table :columns="columns"
						:rows="siItems"
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
							<b><span v-if="props.column.field == 'itemName'">
								<span>{{props.row.itemName}}</span>
							</span>
							<span v-if="props.column.field == 'description'">
								<span>{{props.row.description}}</span>
							</span>
							<span v-if="props.column.field == 'quantity'">
								<span>{{props.row.quantity}}</span>
							</span>
							<span v-if="props.column.field == 'unitPrice'">
								<span>₱ {{props.row.unitPrice}}</span>
							</span>
							<span v-if="props.column.field == 'amount'">
								<span>₱ {{props.row.amount}}</span>
							</span>
							<span v-if="props.column.field == 'vat'">
								<span v-for="vat in vats"
									v-bind:key="vat.vatId">
									<span v-if="vat.vatId == props.row.vat">{{vat.vat}}</span>
								</span>
							</span>
							<span v-if="props.column.field == 'action'">
								<span class="pointer ml-2 far fa-edit"
									id="sideBarTxt"
									v-on:click="openUpdateItemModal(props.row)"
									v-if="si.status == 1"
									title="Update"></span>
								<span class="pointer ml-2 far fa-times-circle"
									id="sideBarTxt"
									v-on:click="removeItem(props.row)"
									v-if="si.status == 1"
									title="Remove"></span>
							</span></b>
						</template>
					</vue-good-table>
				</div>
				<hr class="mt-2 mb-2">
				<div class="pl-2 pr-2 text-right">
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="si.status == 1"
						v-b-modal.new-si-item-modal>Add Item</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="si.status == 1"
						@click="openUpdateSI(si)">Update</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="si.status == 2 || si.status == 5 || si.status == 0"
						@click="changeStatus(1)">Pending</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="si.status == 1 || si.status == 3"
						@click="changeStatus(2)">Released</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="si.status == 1 || si.status == 0"
						@click="changeStatus(5)">Reject</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="si.status == 1 || si.status == 5"
						@click="changeStatus(0)">Cancel</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="si.status == 2"
						@click="changeStatus(3)">Delivered</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="si.status == 2 || si.status == 3 || si.status == 4"
						@click="printSI()">Print</base-button>
					<base-button id="darkInlineBtn"
						@click="closePage()"
						:disabled="requestProcessing">Close</base-button>
				</div>
			</card>
			<card id="viewSummary">
				<br><br>
				<div class="row"
					id="leftSpaceStyle">
					<div class="col-sm-6"></div>
					<div class="col-sm-3"><b>{{si.invoiceDate | moment("MMMM DD, YYYY")}}</b></div>
					<div class="col-sm-3"></div>
				</div>
				<div class="row"
					id="marginStyle">
					<div class="col-sm-6"></div>
					<div class="col-sm-3"><b>{{si.clientPO}}</b></div>
					<div class="col-sm-3"><b>{{si.drNumber}}</b></div>
				</div>
				<div class="row"
					id="marginStyle">
					<div class="col-sm-6"></div>
					<div class="col-sm-3"><b>{{user.firstname}} {{user.lastname}}</b></div>
					<div class="col-sm-3"></div>
				</div><br><br>
				<div class="row">
					<div class="col-sm-1"></div>
					<div class="col-sm-8"><b>{{si.customer}}</b></div>
					<div class="col-sm-3"><b>{{si.tin}}</b></div>
				</div><br>
				<div class="row">
					<div class="col-sm-1"></div>
					<div class="col-sm-8"><b>{{si.address}}</b></div>
					<div class="col-sm-3"><b>{{si.busStyle}}</b></div>
				</div><br><br><br>
				<div class="row ml-0 mr-3"
					v-for="item in siItems"
					v-bind:key="item.salesInvoiceItemId">
					<span class="col-sm-1"
						align="left"
						id="leftSpaceStyle"><b>{{item.quantity}}</b></span>
					<span class="col-sm-4 pl-5" align="left" id="leftSpaceStyle"><b>{{item.itemName}}</b></span>
					<span class="col-sm-3"></span>
					<span class="col-sm-2"
						align="right"><b>{{item.unitPrice}}</b></span>
					<span class="col-sm-2"
						align="right"
						id="rightSpaceStyle"><b>{{item.amount}}</b></span>
				</div>
				<div class="row"
					v-for="n in spaceSize"
					:key="n">
					<br>
				</div>
				<div class="row">
					<span class="col-sm-1"></span>
					<span class="col-sm-4"></span>
					<span class="col-sm-3"></span>
					<span class="col-sm-2"></span>
					<span class="col-sm-2"
						align="right"
						id="topSpaceStyle"><b>{{si.vatableSales}}</b></span>
				</div><br><br><br>
				<div class="row">
					<span class="col-sm-1"></span>
					<span class="col-sm-4"></span>
					<span class="col-sm-3"></span>
					<span class="col-sm-2"></span>
					<span class="col-sm-2"
						align="right"
						id="topSpaceStyle"><b>{{si.vatAmount}}</b></span>
				</div><br><br>
				<div class="row">
					<span class="col-sm-1"></span>
					<span class="col-sm-4"></span>
					<span class="col-sm-3"></span>
					<span class="col-sm-2"></span>
					<span class="col-sm-2"
						align="left"><b>{{si.totalAmount}}</b></span>
				</div>
			</card>
			<!-- UPDATE MODAL -->
			<b-modal size="xl"
				id="update-modal"
				title="Edit Sales Invoice" centered
				:hide-header-close="true"
				:no-close-on-backdrop="true"
				:no-close-on-esc="true">
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>S.I. No.:</b>
						<b class="text-red">*</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>Invoice Date:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="edit.siNumber"
							type="text"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.siNumber.$anyDirty && !$v.edit.siNumber.required">Field Required</i>
						<i class="text-red"
							v-if="$v.edit.siNumber.$anyDirty && !$v.edit.siNumber.numCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="edit.invoiceDate"
							type="date"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.invoiceDate.$anyDirty && !$v.edit.invoiceDate.required">Field Required</i>
					</div>
				</div>
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>P.O. No.:</b>
						<b class="text-red">*</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>D.R. No.:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-4 pl-5">
						<base-input v-model="edit.poNumber"
							type="text"
							id="inputStyle"
							@input="changePOData"></base-input>
						<i class="text-red"
							v-if="$v.edit.poNumber.$anyDirty && !$v.edit.poNumber.required">Field Required</i>
						<i class="text-red"
							v-if="$v.edit.poNumber.$anyDirty && !$v.edit.poNumber.alphaNumCustomValidator">Field Required</i>
					</div>
					<div class="col-sm-2 pr-5">
						<base-button v-b-modal.choose-po-number-modal
							id="darkBtn" block
							:disabled="requestProcessing">Choose</base-button>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="edit.drNumber"
							type="text"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.drNumber.$anyDirty && !$v.edit.drNumber.required">Field Required</i>
						<i class="text-red"
							v-if="$v.edit.drNumber.$anyDirty && !$v.edit.drNumber.alphaNumCustomValidator">Field Required</i>
					</div>
				</div>
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Terms:</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>Invoice To:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="paymentTerms"
							:reduce="term => term.paymentTermId"
							label="description"
							v-model="edit.terms"
							:clearable="true"></v-select>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="customers"
							:reduce="cus => cus.customerId"
							label="name"
							v-model="edit.invoiceTo"
							:clearable="false"></v-select>
						<i class="text-red"
							v-if="$v.edit.invoiceTo.$anyDirty && !$v.edit.invoiceTo.required">Field Required</i>
					</div>
				</div>
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Client P.O. No.:</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="edit.clientPO"
							type="text"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.clientPO.$anyDirty && !$v.edit.clientPO.required">Field Required</i>
					</div>
				</div>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="updateSI()"
								:disabled="requestProcessing">
								<i v-if="requestProcessing"
									class="fa fa-spinner fa-spin"></i>
								Update
							</base-button>
							<base-button id="darkInlineBtn"
								@click.native="$bvModal.hide('update-modal')"
								:disabled="requestProcessing">Close</base-button>
						</div>
					</div>
				</template>
			</b-modal>
			<!-- CHOOSE PO NUMBER -->
			<b-modal size="md"
				id="choose-po-number-modal"
				title="New Payment Terms" centered
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
			<!-- ADD SI ITEM MODAL -->
			<b-modal size="xl"
				id="new-si-item-modal"
				title="Add SI Item" centered
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
							v-model="newSIItem"
							:clearable="false"
							@input="changeItem(newSIItem, 'add')"></v-select>
						<i class="text-red"
							v-if="$v.newSIItem.$anyDirty && !$v.newSIItem.required">Field Required</i>
					</div>
					<div class="col-sm-2 pr-5">
						<base-button v-b-modal.new-item-modal
							id="darkBtn" block
							:disabled="requestProcessing">Add</base-button>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<textarea rows="2"
							cols="59"
							v-model="newSIDescription"
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
						<base-input v-model="newSIQuantity"
							id="inputStyle"
							type="text"
							placeholder="Quantity"
							@input="computeAmount(newSIQuantity, newSIUnitPrice, 'add')"></base-input>
						<i class="text-red"
							v-if="$v.newSIQuantity.$anyDirty && !$v.newSIQuantity.required">Field Required</i>
						<i class="text-red"
							v-if="$v.newSIQuantity.$anyDirty && !$v.newSIQuantity.numCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="newSIUnitPrice"
							id="inputStyle"
							type="text"
							placeholder="Unit Price"
							@input="computeAmount(newSIQuantity, newSIUnitPrice, 'add')"></base-input>
						<i class="text-red"
							v-if="$v.newSIUnitPrice.$anyDirty && !$v.newSIUnitPrice.required">Field Required</i>
						<i class="text-red"
							v-if="$v.newSIUnitPrice.$anyDirty && !$v.newSIUnitPrice.amountCustomValidator">Invalid Characters</i>
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
						<base-input v-model="newSIAmount"
							id="inputStyle"
							type="text"
							placeholder="Amount" disabled></base-input>
						<i class="text-red"
							v-if="$v.newSIAmount.$anyDirty && !$v.newSIAmount.required">Field Required</i>
						<i class="text-red"
							v-if="$v.newSIAmount.$anyDirty && !$v.newSIAmount.amountCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="vats"
							:reduce="vat => vat.vatId"
							label="vat"
							v-model="newSIVAT"
							:clearable="false"></v-select>
						<i class="text-red"
							v-if="$v.newSIVAT.$anyDirty && !$v.newSIVAT.required">Field Required</i>
					</div>
				</div>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="addSIItems"
								:disabled="requestProcessing">
								<i v-if="requestProcessing"
									class="fa fa-spinner fa-spin"></i>Add
							</base-button>
							<base-button id="darkInlineBtn"
								@click.native="$bvModal.hide('new-si-item-modal')"
								:disabled="requestProcessing">Close</base-button>
						</div>
					</div>
				</template>
			</b-modal>
			<!-- ADD ITEM MODAL -->
			<b-modal size="lg"
				id="new-item-modal"
				title="New Item"
				centered
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
			<!-- UPDATE SI ITEM MODAL -->
			<b-modal size="xl"
				id="update-si-item-modal"
				title="Update SI Item" centered
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
							:reduce="item => item.itemId"
							label="itemName"
							v-model="editItem.siItem"
							:clearable="false"
							@input="changeItem(editItem.siItem, 'update')"></v-select>
						<i class="text-red"
							v-if="$v.editItem.siItem.$anyDirty && !$v.editItem.siItem.required">Field Required</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<textarea rows="2"
							cols="59"
							v-model="editItem.siDescription"
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
						<base-input v-model="editItem.siQuantity"
							id="inputStyle"
							type="text"
							placeholder="Quantity"
							@input="computeAmount(editItem.siQuantity, editItem.siUnitPrice, 'update')"></base-input>
						<i class="text-red"
							v-if="$v.editItem.siQuantity.$anyDirty && !$v.editItem.siQuantity.required">Field Required</i>
						<i class="text-red"
							v-if="$v.editItem.siQuantity.$anyDirty && !$v.editItem.siQuantity.numCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="editItem.siUnitPrice"
							id="inputStyle"
							type="text"
							placeholder="Unit Price"
							@input="computeAmount(editItem.siQuantity, editItem.siUnitPrice, 'update')"></base-input>
						<i class="text-red"
							v-if="$v.editItem.siUnitPrice.$anyDirty && !$v.editItem.siUnitPrice.required">Field Required</i>
						<i class="text-red"
							v-if="$v.editItem.siUnitPrice.$anyDirty && !$v.editItem.siUnitPrice.amountCustomValidator">Invalid Characters</i>
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
						<base-input v-model="editItem.siAmount"
							id="inputStyle"
							type="text"
							placeholder="Amount" disabled></base-input>
						<i class="text-red"
						v-if="$v.editItem.siAmount.$anyDirty && !$v.editItem.siAmount.required">Field Required</i>
						<i class="text-red"
						v-if="$v.editItem.siAmount.$anyDirty && !$v.editItem.siAmount.amountCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="vats"
							:reduce="vat => vat.vatId"
							label="vat"
							v-model="editItem.siVAT"
							:clearable="false"></v-select>
						<i class="text-red"
							v-if="$v.editItem.siVAT.$anyDirty && !$v.editItem.siVAT.required">Field Required</i>
					</div>
				</div>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="updateSIItems"
								:disabled="requestProcessing">
								<i v-if="requestProcessing"
									class="fa fa-spinner fa-spin"></i>Update
							</base-button>
							<base-button id="darkInlineBtn"
								@click.native="$bvModal.hide('update-si-item-modal')"
								:disabled="requestProcessing">Close</base-button>
						</div>
					</div>
				</template>
			</b-modal>
		</div>
	</div>
</template>
<script>
	import {dbSales, dbMains, dbUsers} from '@/main';
	import {helpers, required} from "vuelidate/lib/validators";
	import printJS from 'print-js';
	
	// const moment  = require('moment');
	const today = new Date();
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');
	const addZero = require('add-zero');
	const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -./, A-Za-z0-9 ]*$/);
	const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ -. 0-9 ]*$/);
	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ ,. 0-9 ]*$/);

	export default{
		components: {},
		data() {
			return {
				si: [],
				suppliers: [],
				customers: [],
				paymentTerms: [],
				items: [],
				vats: [
					{'vatId': 'taxInclusive', 'vat': 'Tax Inclusive'},
					{'vatId': 'taxExclusive', 'vat': 'Tax Exclusive'},
					{'vatId': 'vatExempt', 'vat': 'VAT Exempt'}
				],
				siItems: [],
				columns: [{
						label: 'Item',
						field: 'itemName'
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
						width: '80px', 
						sortable: false
					}
				],
				loading: false,
				requestProcessing: false,
				poNumbers: [],
				choosePO: '',
				edit: {
					id: '',
					siId: '',
					siNumber: '',
					invoiceDate: '',
					poNumber: '',
					poRef: '',
					drNumber: '',
					terms: '',
					invoiceTo: '',
					poAmount: '',
					clientPO: '',
					totalAmount: ''
				},
				newSIItem: '',
				newSIDescription: '',
				newSIQuantity: '',
				newSIUnitPrice: '',
				newSIAmount: '',
				newSIVAT: 'taxInclusive',
				types: [
					{'typeId': 'inventory', 'type': 'Inventory'},
					{'typeId': 'service', 'type': 'Service'}
				],
				categories: [],
				newItemName: '',
				newType: 'inventory',
				newCategory: '',
				newCostPrice: '',
				newSalePrice: '',
				newItemSupplier: '',
				editItem: {
					id: '',
					siItemId: '',
					siItem: '',
					siDescription: '',
					siQuantity: '',
					siUnitPrice: '',
					siAmount: '',
					siOldAmount: '',
					siVAT: ''
				},
				company: [],
				notes: [],
				user: {
					firstname: '',
					lastname: ''
				},
				spaceSize: '',
				approveBy: 'Alexander Pasia'
			}
		},
		validations:{
			edit: {
				siNumber: {
					required,
					numCustomValidator
				},
				invoiceDate: {required},
				poNumber: {
					required,
					alphaNumCustomValidator
				},
				drNumber: {
					required,
					alphaNumCustomValidator
				},
				clientPO: {required},
				invoiceTo: {required}
			},
			newSIItem: {required},
			newSIQuantity: {
				required,
				numCustomValidator
			},
			newSIUnitPrice: {
				required,
				amountCustomValidator
			},
			newSIAmount: {
				required,
				amountCustomValidator
			},
			newSIVAT: {required},
			newItemName: {
				required,
				alphaNumCustomValidator
			},
			newType: {required},
			newCostPrice: {amountCustomValidator},
			newSalePrice: {amountCustomValidator},
			newItemSupplier: {required},
			editItem: {
				siItem: {required},
				siQuantity: {
					required,
					numCustomValidator
				},
				siUnitPrice: {
					required,
					amountCustomValidator
				},
				siAmount: {
					required,
					amountCustomValidator
				},
				siVAT: {required},
			}
		},
		async mounted(){
			this.getCustomers();
			this.getSuppliers();
			this.getPaymentTerms();
			this.getSalesInvoices();
			this.getItems();
			this.getItemCategories();
			this.getCompany();
			this.getUser(localStorage.getItem('aisname'));
		},
		methods: {
			closePage(){
				this.$router.push('/sales/invoice');
			},
			getUser(userID){
				if(userID == ''){
					self.$swal({
						title: 'Warning',
						text: 'The user ID is missing.',
						icon: 'warning',
						confirmButtonColor: '#ef8157',
						confirmButtonText: 'OK'
					});
				}else if(userID != ''){
					let self = this;
					let userData = dbUsers.collection("users")
					.where("username", "==", userID);
					let users = [];

					userData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							users.push(doc.data());
						});
						self.user.firstname = users[0].firstname;
						self.user.lastname = users[0].lastname;
					});
				}
			},
			getCustomers(){
				let self = this;
				let customerData = dbMains.collection("customers")
					.orderBy("name","asc");

				self.customers = [];
				customerData.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							self.customers.push(doc.data());
						});
					}
				});
			},
			getSuppliers(){
				let self = this;
				let supplierData = dbMains.collection("suppliers")
					.orderBy("supplierName","asc");

				self.suppliers = [];
				supplierData.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							self.suppliers.push(doc.data());
						});
					}
				});
			},
			getPaymentTerms(){
				let self = this;
				let termData = dbMains.collection("paymentTerms")
					.orderBy("description","asc");

				self.paymentTerms = [];
				termData.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							self.paymentTerms.push(doc.data());
						});
					}
				});
			},
			getItems(){
				let self = this;
				let itemData = dbSales.collection("items")
					.orderBy("itemName","asc");

				self.items = [];
				itemData.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							self.items.push(doc.data());
						});
						self.newSIItem = self.items[0].itemId;
						self.changeItem(self.items[0].itemId, 'add');
						self.changeItem(self.items[0].itemId, 'update');
					}
				});
			},
			getSalesInvoices(){
				let self = this, sis = [], id = '';
				let siData = dbSales.collection("salesInvoices")
					.where("salesInvoiceId","==",this.$router.currentRoute.params.id);

				self.si = [];
				siData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						sis.push(doc.data());
						id = doc.id;
					});
					sis[0]["id"] = id;
					sis[0]["vatableSales"] = parseFloat(sis[0].totalAmount.replaceAll(",","")) / 1.12;
					sis[0].totalAmount = format(sis[0].totalAmount);
					sis[0]["poNumber"] = '';
					sis[0]["terms"] = '';
					sis[0]["customer"] = '';
					sis[0]["poAmount"] = '';
					sis[0]["tin"] = '';
					sis[0]["address"] = '';
					sis[0]["busStyle"] = '';
					sis[0]["vatAmount"] = sis[0].totalAmount.replaceAll(",","") - sis[0].vatableSales;
					sis[0].vatableSales = format(parseFloat(sis[0].vatableSales).toFixed(2));
					sis[0].vatAmount = format(parseFloat(sis[0].vatAmount).toFixed(2));
					let poData = dbSales.collection("purchaseOrders")
						.where("purchaseOrderId","==",sis[0].poReference);

					poData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							sis[0].poNumber = doc.data().poNumber;
							sis[0].poAmount = doc.data().totalAmount;
						});
						if(sis[0].poNumber == ''){
							sis[0].poNumber = sis[0].poReference;
						}
						for(let a = 0; a < self.paymentTerms.length; a++){
							if(self.paymentTerms[a].paymentTermId == sis[0].paymentTermReference){
								sis[0].terms = self.paymentTerms[a].description;
							}
						}
						for(let b = 0; b < self.customers.length; b++){
							if(self.customers[b].customerId == sis[0].customerReference){
								sis[0].customer = self.customers[b].name;
								sis[0].tin = self.customers[b].tin;
								sis[0].address = self.customers[b].address;
								sis[0].busStyle = self.customers[b].businessStyle;
							}
						}
						self.si = sis[0];
						self.getSIItems(this.$router.currentRoute.params.id);
					});
				});
			},
			getSIItems(id){
				let self = this, ids = [];
				let itemData = dbSales.collection("salesInvoiceItems")
					.where("siReference","==",id);

				self.siItems = [];
				itemData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.siItems.push(doc.data());
						ids.push(doc.id);
					});
					for(let a = 0; a < self.siItems.length; a++){
						self.siItems[a]["id"] = ids[a];
						self.siItems[a].unitPrice = format(self.siItems[a].unitPrice);
						self.siItems[a].amount = format(self.siItems[a].amount);
						for(let b = 0; b < self.items.length; b++){
							if(self.items[b].itemId == self.siItems[a].itemReference){
								self.siItems[a]["itemName"] = self.items[b].itemName;
							}
						}
					}
					let size = 20;
					if(self.items.length > 1 && self.items.length < 20){
						self.spaceSize = size - self.siItems.length;
					}else if(self.items.length >= 20){
						self.spaceSize = 0;
					}else{
						self.spaceSize = size;
					}
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
			openUpdateSI(si){
				let self = this;

				self.getPONumbers();
				self.edit = {
					id: si.id,
					siId: si.salesInvoiceId,
					siNumber: si.siNumber,
					clientPO: si.clientPO,
					invoiceDate: si.invoiceDate,
					poNumber: si.poNumber,
					poRef: si.poReference,
					drNumber: si.drNumber,
					terms: si.paymentTermReference,
					invoiceTo: si.customerReference,
					poAmount: si.poAmount,
					totalAmount: si.totalAmount
				}
				self.$bvModal.show('update-modal');
			},
			choosePONumber(){
				let self = this;

				for(let a = 0; a < self.poNumbers.length; a++){
					if(self.poNumbers[a].purchaseOrderId == self.choosePO){
						self.edit.poNumber = self.poNumbers[a].poNumber;
						self.edit.poAmount = self.poNumbers[a].totalAmount;
						self.edit.poRef = self.choosePO;
					}
				}
				self.$bvModal.hide("choose-po-number-modal");
			},
			changePOData(){
				let self = this;

				if(self.edit.poNumber == '' && self.edit.poRef != ''){
					self.edit.poRef = '';
				}
			},
			updateSI(){
				let self = this, poNum = '', amount = '';

				self.requestProcessing = true;
				self.$v.edit.$touch();
				if(!self.$v.edit.$error){
					try{
						if(self.edit.poRef == ''){
							poNum = self.edit.poNumber;
							amount = self.edit.totalAmount.replaceAll(",","");
						}else{
							poNum = self.edit.poRef;
							amount = self.edit.poAmount.replaceAll(",","");
						}
						dbSales.collection("salesInvoices")
						.doc(self.edit.id)
						.update({
							siNumber: self.edit.siNumber,
							invoiceDate: self.edit.invoiceDate,
							drNumber: self.edit.drNumber,
							clientPO: self.edit.clientPO,
							totalAmount: amount,
							poReference: poNum,
							paymentTermReference: self.edit.terms,
							customerReference: self.edit.invoiceTo,
							dateModified: today
						}).then(() => {
							if(self.edit.poRef != ''){
								let getId = dbSales.collection("salesInvoiceItems")
									.where("siReference","==",self.edit.siId);

								getId.get().then((querySnapshot) => {
									querySnapshot.forEach((doc) => {
										dbSales.collection("salesInvoiceItems")
										.doc(doc.id)
										.delete();
									});
								});
								let getItems = dbSales.collection("purchaseOrderItems")
									.where("poReference","==",self.edit.poRef);
								let getUserId = dbUsers.collection("users")
									.where("username","==",localStorage.getItem("aisname"));
								let users = [];

								getUserId.get().then((querySnapshot) => {
									querySnapshot.forEach((doc) => {
										users.push(doc.data());
									});
									getItems.get().then((querySnapshot) => {
										querySnapshot.forEach((doc) => {
											let siiID = 'SIII-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

											dbSales.collection("salesInvoiceItems").doc()
											.set({
												salesInvoiceItemId: siiID,
												description: doc.data().description,
												quantity: doc.data().quantity,
												unitPrice: doc.data().unitPrice,
												amount: doc.data().amount,
												vat: doc.data().vat,
												itemReference: doc.data().itemReference,
												siReference: self.edit.siId,
												status: 1,
												userReference: users[0].userId,
												dateCreated: today,
												dateModified: today
											});
										});
									}).then(() => {
										self.edit= {};
										self.$v.edit.$reset();
										self.$bvModal.hide('update-modal');
										self.requestProcessing = false;
										self.getSalesInvoices();
										self.$swal({
											title: 'Success',
											text: 'Sales invoice updated successfully!',
											icon: 'success',
											confirmButtonColor: '#b80000',
											confirmButtonText: 'OK'
										});
									});
								});
							}else{	
								self.edit= {};
								self.$v.edit.$reset();
								self.$bvModal.hide('update-modal');
								self.requestProcessing = false;
								self.getSalesInvoices();
								self.$swal({
									title: 'Success',
									text: 'Sales invoice updated successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
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
				}else{
					self.requestProcessing = false;
				}
			},
			addItem(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newItemName.$touch();
				self.$v.newType.$touch();
				self.$v.newCostPrice.$touch();
				self.$v.newSalePrice.$touch();
				self.$v.newItemSupplier.$touch();
				if(!self.$v.newItemName.$error && !self.$v.newType.$error && !self.$v.newCostPrice.$error && !self.$v.newSalePrice.$error && !self.$v.newItemSupplier.$error){
					let itemData = null;

					self.requestProcessing = true;
					itemData = dbSales.collection('items')
						.where("itemName","==",self.newItemName);
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
										self.requestProcessing = false;
										self.$v.newItemName.$reset();
										self.$v.newType.$reset();
										self.$v.newCostPrice.$reset();
										self.$v.newSalePrice.$reset();
										self.$v.newItemSupplier.$reset();
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
			changeItem(item, type){
				let self = this, price = '';
				let itemData = dbSales.collection("items")
					.where('itemId',"==",item)
					.orderBy("itemName", "asc");

				itemData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						price = doc.data().salePrice;
					});
					if(type == 'add'){
						self.newSIUnitPrice = format(price);
						if(self.newSIQuantity != '' && self.newSIQuantity > 0){
							self.computeAmount(self.newSIQuantity, self.newSIUnitPrice, 'add');
						}
					}else if(type == 'update'){
						self.editItem.siUnitPrice = format(price);
						if(self.editItem.siQuantity != '' && self.editItem.siQuantity > 0){
							self.computeAmount(self.editItem.siQuantity, self.editItem.siUnitPrice, 'update');
						}
					}
				});
			},
			computeAmount(quantity, price, type){
				price  = price.replaceAll(',', '');
				if (type == 'add') {
					this.newSIAmount = price * quantity;
					this.newSIAmount = format(parseFloat(this.newSIAmount).toFixed(2));
				}else if(type == 'update') {
					this.editItem.siAmount = price * quantity;
					this.editItem.siAmount = format(parseFloat(this.editItem.siAmount).toFixed(2));
				}
			},
			addSIItems(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newSIItem.$touch();
				self.$v.newSIQuantity.$touch();
				self.$v.newSIUnitPrice.$touch();
				self.$v.newSIAmount.$touch();
				self.$v.newSIVAT.$touch();
				if(!self.$v.newSIItem.$error && !self.$v.newSIQuantity.$error && !self.$v.newSIQuantity.$error && !self.$v.newSIUnitPrice.$error && !self.$v.newSIAmount.$error && !self.$v.newSIVAT.$error){
					try{
						let itemData = null;

						self.requestProcessing = true;
						itemData = dbSales.collection("salesInvoiceItems")
							.where("siReference","==",self.si.salesInvoiceId)
							.where("itemReference","==",self.newSIItem);
						itemData.get().then((querySnapshot) => {
							if(!querySnapshot.empty){
								querySnapshot.forEach((doc) => {
									if(doc.exists){
										self.$swal({
											title: 'Invalid',
											text: 'Item already exists.',
											icon: 'error',
											confirmButtonColor: '#b80000',
											confirmButtonText: 'OK'
										});
										self.requestProcessing = false;
									}
								});
							}else if(querySnapshot.empty){
								let userData = dbUsers.collection("users")
									.where("username","==",localStorage.getItem('aisname'));
								let users = [];
								let siiId = 'SIII-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

								userData.get().then((querySnapshot) => {
									querySnapshot.forEach((doc) => {
										users.push(doc.data());
									});
									self.newSIUnitPrice = self.newSIUnitPrice.replaceAll(",","");
									self.newSIAmount = self.newSIAmount.replaceAll(",","");
									self.si.totalAmount = self.si.totalAmount.replaceAll(",","");
									dbSales.collection("salesInvoiceItems").doc()
									.set({
										salesInvoiceItemId: siiId,
										description: self.newSIDescription,
										quantity: self.newSIQuantity,
										unitPrice: self.newSIUnitPrice,
										amount: self.newSIAmount,
										vat: self.newSIVAT,
										itemReference: self.newSIItem,
										siReference: self.si.salesInvoiceId,
										status: 1,
										userReference: users[0].userId,
										dateCreated: today,
										dateModified: today
									}).then(() => {
										let total = parseFloat(self.si.totalAmount) + parseFloat(self.newSIAmount);

										dbSales.collection("salesInvoices")
										.doc(self.si.id)
										.update({
											totalAmount: parseFloat(total).toFixed(2),
											dateModified: today
										}).then(() => {
											self.newSIItem = '';
											self.newSIDescription = '';
											self.newSIQuantity = '';
											self.newSIUnitPrice = '';
											self.newSIAmount = '';
											self.newSIVAT = 'taxInclusive';
											self.$v.newSIItem.$reset();
											self.$v.newSIQuantity.$reset();
											self.$v.newSIUnitPrice.$reset();
											self.$v.newSIAmount.$reset();
											self.$v.newSIVAT.$reset();
											self.requestProcessing = false;
											self.$bvModal.hide("new-si-item-modal");
											self.getSalesInvoices();
											self.getItems();
											self.$swal({
												title: 'Success',
												text: 'New SI item added successfully!',
												icon: 'success',
												confirmButtonColor: '#b80000',
												confirmButtonText: 'OK'
											});
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
				}
			},
			openUpdateItemModal(row){
				let self = this;

				self.editItem = {
					id: row.id,
					siItemId: row.salesInvoiceItemId,
					siItem: row.itemReference,
					siDescription: row.description,
					siQuantity: row.quantity,
					siUnitPrice: row.unitPrice,
					siAmount: row.amount,
					siOldAmount: row.amount,
					siVAT: row.vat
				}
				self.$bvModal.show("update-si-item-modal");
			},
			updateSIItems(){
				let self = this;

				self.requestProcessing = false;
				self.$v.editItem.$touch();
				if(!self.$v.editItem.$error){
					try{
						self.requestProcessing = true;
						let itemData = dbSales.collection("salesInvoiceItems")
							.where("itemReference","==",self.editItem.siItem)
							.where("siReference","==",self.si.salesInvoiceId)
							.where("salesInvoiceItemId","!=",self.editItem.siItemId);

						itemData.get().then((querySnapshot) => {
							if(!querySnapshot.empty){
								querySnapshot.forEach((doc) => {
									if(doc.exists){
										self.$swal({
											title: 'Invalid',
											text: 'Item already exists.',
											icon: 'error',
											confirmButtonColor: '#b80000',
											confirmButtonText: 'OK'
										});
										self.requestProcessing = false;
									}
								});
							}else if(querySnapshot.empty){
								dbSales.collection("salesInvoiceItems")
								.doc(self.editItem.id)
								.update({
									description: self.editItem.siDescription,
									quantity: self.editItem.siQuantity,
									unitPrice: self.editItem.siUnitPrice,
									amount: self.editItem.siAmount,
									vat: self.editItem.siVAT,
									itemReference: self.editItem.siItem,
									dateModified: today
								}).then(() => {
									let total = parseFloat(self.si.totalAmount.replaceAll(",","")) - parseFloat(self.editItem.siOldAmount.replaceAll(",",""));

									total = parseFloat(total) + parseFloat(self.editItem.siAmount.replaceAll(",",""));
									dbSales.collection("salesInvoices")
									.doc(self.si.id)
									.update({
										totalAmount: parseFloat(total).toFixed(2),
										dateModified: today
									}).then(() => {
										self.$v.editItem.$reset();
										self.requestProcessing = false;
										self.$bvModal.hide("update-si-item-modal");
										self.getSalesInvoices();
										self.getItems();
										self.$swal({
											title: 'Success',
											text: 'SI item updated successfully!',
											icon: 'success',
											confirmButtonColor: '#b80000',
											confirmButtonText: 'OK'
										});
									});
								})
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
				}
			},
			removeItem(row){
				let self = this;

				self.$swal({
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
						try{
							dbSales.collection("salesInvoiceItems")
							.doc(row.id)
							.delete()
							.then(() => {
								let total = parseFloat(self.si.totalAmount.replaceAll(",","")) - parseFloat(row.amount.replaceAll(",",""));

								dbSales.collection("salesInvoices")
								.doc(self.si.id)
								.update({
									totalAmount: parseFloat(total).toFixed(2),
									dateModified: today
								}).then(() => {
									self.requestProcessing = false;
									self.getSalesInvoices();
									self.$swal({
										title: 'Success',
										text: 'SI item removed successfully!',
										icon: 'success',
										confirmButtonColor: '#b80000',
										confirmButtonText: 'OK'
									});
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
				});
			},
			changeStatus(stat){
				let self = this, msg = '';

				if(stat == 1){
					msg = 'pending';
				}else if(stat == 2){
					msg = 'released';
				}else if(stat == 3){
					msg = 'delivered';
				}else if(stat == 4){
					msg = 'done';
				}else if(stat == 5){
					msg = 'reject';
				}else if(stat == 0){
					msg == 'cancel';
				}
				self.$swal({
					title: 'Are you sure?',
					text: 'You want to change the status to ' + msg,
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#f5c71a',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						self.requestProcessing = true;
						try{
							dbSales.collection("salesInvoices")
							.doc(self.si.id)
							.update({
								status: stat,
								dateModified: today
							}).then(() => {
								self.requestProcessing = false;
								self.getSalesInvoices();
								self.$swal({
									title: 'Success',
									text: 'Status change successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								});
							})
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
				});
			},
			getCompany(){
				let self = this, data = [];
				let companyData = dbMains.collection("companyProfile");

				self.company = [];
				companyData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						data.push(doc.data());
					});
					self.company = data[0];
				});
			},
			printSI(){
				printJS({
					printable: 'viewSummary',
					type: 'html',
					style: '#viewSummary {font-family: "Calibri";} #marginStyle {margin-top: 10px; padding-left: 50px;} #leftSpaceStyle {padding-left: 50px;} #rightSpaceStyle {padding-right: 19px;} #topSpaceStyle {padding-top: 19px; padding-right: 19px;}',
					documentTitle: 'Sales Inovice',
				});
				// this.$htmlToPaper('viewSummary');
			},
		}
	}
</script>
<style>
	#viewSummary {
		position: inherit;
		visibility: hidden;
		top: -1000px;
	}
	#borderStyle {
		border-width: 1px;
		border-style: solid;
	}
</style>