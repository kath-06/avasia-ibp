<template>
	<div id="textStyle"> 
		<base-header class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-12 container-fluid mt--7">
			<card>
				<div class="row pl-4">
					<span class="col-sm-12">
						<b>D.R. No. {{dr.drNumber}}</b>
						<b v-if="dr.status == 1"> (Pending)</b>
						<b v-if="dr.status == 2"> (Released)</b>
						<b v-if="dr.status == 3"> (Delivered)</b>
						<b v-if="dr.status == 4"> (Done)</b>
						<b v-if="dr.status == 5"> (Reject)</b>
						<b v-if="dr.status == 0"> (Cancel)</b>
					</span>
				</div>
				<hr>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Delivery Date:</b> {{dr.deliveryDate | moment("MMMM DD, YYYY")}}
					</span>
					<span class="col-sm-6">
						<b>Terms:</b> {{dr.terms}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>P.O. Number:</b> {{dr.poNumber}}
					</span>
					<span class="col-sm-6">
						<b>S.I. Number:</b> {{dr.siNumber}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-12" id="particular">
						<b>Delivered To:</b> {{dr.customer}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Client P.O. No.:</b> {{dr.clientPO}}
					</span>
					<span class="col-sm-6">
						<b>Total Amount:</b> ₱ {{dr.totalAmount}}
					</span>
				</div>
				<hr class="mb-1">
				<div class="text-left pl-2">
					<h2 class="display-5"
						id="sideBarTxt">Items</h2>
				</div>       
				<div class="table-full-width pt-2">
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
									v-if="dr.status == 1"
									title="Update"></span>
								<span class="pointer ml-2 far fa-times-circle"
									id="sideBarTxt"
									v-on:click="removeItem(props.row)"
									v-if="dr.status == 1"
									title="Remove"></span>
							</span></b>
						</template>
					</vue-good-table>
				</div>
				<hr class="mt-2 mb-2">
				<div class="pl-2 pr-2 text-right">
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="dr.status == 1"
						v-b-modal.new-dr-item-modal>Add Item</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="dr.status == 1"
						@click="openUpdateDR(dr)">Update</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="dr.status == 2 || dr.status == 5 || dr.status == 0"
						@click="changeStatus(1)">Pending</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="dr.status == 1 || dr.status == 3"
						@click="changeStatus(2)">Released</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="dr.status == 1 || dr.status == 0"
						@click="changeStatus(5)">Reject</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="dr.status == 1 || dr.status == 5"
						@click="changeStatus(0)">Cancel</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="dr.status == 2 || dr.status == 4"
						@click="changeStatus(3)">Delivered</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="dr.status == 3"
						@click="changeStatus(4)">Done</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="dr.status == 2 || dr.status == 3 || dr.status == 4"
						@click="printDR()">Print</base-button>
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
					<div class="col-sm-3"><b>{{dr.deliveryDate | moment("MMMM DD, YYYY")}}</b></div>
					<div class="col-sm-3"></div>
				</div>
				<div class="row"
					id="marginStyle">
					<div class="col-sm-6"></div>
					<div class="col-sm-3"><b>{{dr.clientPO}}</b></div>
					<div class="col-sm-3"><b>{{dr.siNumber}}</b></div>
				</div>
				<div class="row"
					id="marginStyle">
					<div class="col-sm-6"></div>
					<div class="col-sm-3"><b>{{user.firstname}} {{user.lastname}}</b></div>
					<div class="col-sm-3"></div>
				</div><br><br>
				<div class="row">
					<div class="col-sm-1"></div>
					<div class="col-sm-8"><b>{{dr.customer}}</b></div>
					<div class="col-sm-3"><b>{{dr.tin}}</b></div>
				</div><br>
				<div class="row">
					<div class="col-sm-1"></div>
					<div class="col-sm-8"><b>{{dr.address}}</b></div>
					<div class="col-sm-3"><b>{{dr.busStyle}}</b></div>
				</div><br><br><br>
				<div class="row ml-0 mr-3"
					v-for="item in drItems"
					v-bind:key="item.deliveryReceiptItemId">
					<span class="col-sm-1"
						align="left"
						id="leftSpaceStyle"><b>{{item.quantity}}</b></span>
					<span class="col-sm-9 pl-5"
						align="left"
						id="leftSpaceStyle"><b>{{item.itemName}}</b></span>
					<span class="col-sm-2"></span>
				</div>
			</card>
			<!-- UPDATE MODAL -->
			<b-modal size="xl"
				id="update-modal"
				title="Edit Delivery Receipt" centered
				:hide-header-close="true"
				:no-close-on-backdrop="true"
				:no-close-on-esc="true">
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
						<base-input v-model="edit.drNumber"
							type="text"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.drNumber.$anyDirty && !$v.edit.drNumber.required">Field Required</i>
						<i class="text-red"
							v-if="$v.edit.drNumber.$anyDirty && !$v.edit.drNumber.numCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="edit.deliveryDate"
							type="date"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.deliveryDate.$anyDirty && !$v.edit.deliveryDate.required">Field Required</i>
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
						<base-input v-model="edit.siNumber"
							type="text"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.siNumber.$anyDirty && !$v.edit.siNumber.required">Field Required</i>
						<i class="text-red"
							v-if="$v.edit.siNumber.$anyDirty && !$v.edit.siNumber.alphaNumCustomValidator">Field Required</i>
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
							v-model="edit.deliveredTo"
							:clearable="false"></v-select>
						<i class="text-red"
							v-if="$v.edit.deliveredTo.$anyDirty && !$v.edit.deliveredTo.required">Field Required</i>
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
							<base-button
								id="darkBtn"
								@click.native="updateDR()"
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
			<!-- ADD DR ITEM MODAL -->
			<b-modal size="xl"
				id="new-dr-item-modal"
				title="Add D.R. Item" centered
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
							@input="changeItem(newDRItem, 'add')"></v-select>
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
			<!-- UPDATE DR ITEM MODAL -->
			<b-modal size="xl"
				id="update-dr-item-modal"
				title="Update D.R. Item" centered
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
							v-model="editItem.drItem"
							:clearable="false"
							@input="changeItem(editItem.drItem, 'update')"></v-select>
						<i class="text-red"
							v-if="$v.editItem.drItem.$anyDirty && !$v.editItem.drItem.required">Field Required</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<textarea rows="2"
							cols="59"
							v-model="editItem.drDescription"
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
						<base-input v-model="editItem.drQuantity"
							id="inputStyle"
							type="text"
							placeholder="Quantity"
							@input="computeAmount(editItem.drQuantity, editItem.drUnitPrice, 'update')"></base-input>
						<i class="text-red"
							v-if="$v.editItem.drQuantity.$anyDirty && !$v.editItem.drQuantity.required">Field Required</i>
						<i class="text-red"
							v-if="$v.editItem.drQuantity.$anyDirty && !$v.editItem.drQuantity.numCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="editItem.drUnitPrice"
							id="inputStyle"
							type="text"
							placeholder="Unit Price"
							@input="computeAmount(editItem.drQuantity, editItem.drUnitPrice, 'update')"></base-input>
						<i class="text-red"
							v-if="$v.editItem.drUnitPrice.$anyDirty && !$v.editItem.drUnitPrice.required">Field Required</i>
						<i class="text-red"
							v-if="$v.editItem.drUnitPrice.$anyDirty && !$v.editItem.drUnitPrice.amountCustomValidator">Invalid Characters</i>
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
						<base-input v-model="editItem.drAmount"
							id="inputStyle"
							type="text"
							placeholder="Amount" disabled></base-input>
						<i class="text-red"
						v-if="$v.editItem.drAmount.$anyDirty && !$v.editItem.drAmount.required">Field Required</i>
						<i class="text-red"
						v-if="$v.editItem.drAmount.$anyDirty && !$v.editItem.drAmount.amountCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="vats"
							:reduce="vat => vat.vatId"
							label="vat"
							v-model="editItem.drVAT"
							:clearable="false"></v-select>
						<i class="text-red"
							v-if="$v.editItem.drVAT.$anyDirty && !$v.editItem.drVAT.required">Field Required</i>
					</div>
				</div>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="updateDRItems"
								:disabled="requestProcessing">
								<i v-if="requestProcessing"
									class="fa fa-spinner fa-spin"></i>Update
							</base-button>
							<base-button id="darkInlineBtn"
								@click.native="$bvModal.hide('update-dr-item-modal')"
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
				dr: [],
				suppliers: [],
				customers: [],
				paymentTerms: [],
				items: [],
				vats: [
					{'vatId': 'taxInclusive', 'vat': 'Tax Inclusive'},
					{'vatId': 'taxExclusive', 'vat': 'Tax Exclusive'},
					{'vatId': 'vatExempt', 'vat': 'VAT Exempt'}
				],
				drItems: [],
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
					drId: '',
					drNumber: '',
					deliveryDate: '',
					poNumber: '',
					poRef: '',
					siNumber: '',
					terms: '',
					deliveredTo: '',
					poAmount: '',
					clientPO: '',
					totalAmount: ''
				},
				newDRItem: '',
				newDRDescription: '',
				newDRQuantity: '',
				newDRUnitPrice: '',
				newDRAmount: '',
				newDRVAT: 'taxInclusive',
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
					drItemId: '',
					drItem: '',
					drDescription: '',
					drQuantity: '',
					drUnitPrice: '',
					drAmount: '',
					drOldAmount: '',
					drVAT: ''
				},
				company: [],
				notes: [],
				user: {
					firstname: '',
					lastname: ''
				},
			}
		},
		validations:{
			edit: {
				drNumber: {
					required,
					numCustomValidator
				},
				deliveryDate: {required},
				poNumber: {
					required,
					alphaNumCustomValidator
				},
				siNumber: {
					required,
					alphaNumCustomValidator
				},
				clientPO: {required},
				deliveredTo: {required}
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
			editItem: {
				drItem: {required},
				drQuantity: {
					required,
					numCustomValidator
				},
				drUnitPrice: {
					required,
					amountCustomValidator
				},
				drAmount: {
					required,
					amountCustomValidator
				},
				drVAT: {required},
			}
		},
		async mounted(){
			this.getCustomers();
			this.getSuppliers();
			this.getPaymentTerms();
			this.getDeliveryReceipts();
			this.getItems();
			this.getItemCategories();
			this.getCompany();
			this.getUser(localStorage.getItem('aisname'));
		},
		methods: {
			closePage(){
				this.$router.push('/sales/delivery/receipt');
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
			getDeliveryReceipts(){
				let self = this, drs = [], id = '';
				let drData = dbSales.collection("deliveryReceipts")
					.where("deliveryReceiptId","==",this.$router.currentRoute.params.id);

				self.dr = [];
				drData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						drs.push(doc.data());
						id = doc.id;
					});
					drs[0]["id"] = id;
					drs[0].totalAmount = format(drs[0].totalAmount);
					drs[0]["poNumber"] = '';
					drs[0]["terms"] = '';
					drs[0]["customer"] = '';
					drs[0]["poAmount"] = '';
					drs[0]["tin"] = '';
					drs[0]["address"] = '';
					drs[0]["busStyle"] = '';
					let poData = dbSales.collection("purchaseOrders")
						.where("purchaseOrderId","==",drs[0].poReference);

					poData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							drs[0].poNumber = doc.data().poNumber;
							drs[0].poAmount = doc.data().totalAmount;
						});
						if(drs[0].poNumber == ''){
							drs[0].poNumber = drs[0].poReference;
						}
						for(let a = 0; a < self.paymentTerms.length; a++){
							if(self.paymentTerms[a].paymentTermId == drs[0].paymentTermReference){
								drs[0].terms = self.paymentTerms[a].description;
							}
						}
						for(let b = 0; b < self.customers.length; b++){
							if(self.customers[b].customerId == drs[0].customerReference){
								drs[0].customer = self.customers[b].name;
								drs[0].tin = self.customers[b].tin;
								drs[0].address = self.customers[b].address;
								drs[0].busStyle = self.customers[b].businessStyle;
							}
						}
						self.dr = drs[0];
						self.getDRItems(this.$router.currentRoute.params.id);
					});
				});
			},
			getDRItems(id){
				let self = this, ids = [];
				let itemData = dbSales.collection("deliveryReceiptItems")
					.where("drReference","==",id);

				self.drItems = [];
				itemData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.drItems.push(doc.data());
						ids.push(doc.id);
					});
					for(let a = 0; a < self.drItems.length; a++){
						self.drItems[a]["id"] = ids[a];
						self.drItems[a].unitPrice = format(self.drItems[a].unitPrice);
						self.drItems[a].amount = format(self.drItems[a].amount);
						for(let b = 0; b < self.items.length; b++){
							if(self.items[b].itemId == self.drItems[a].itemReference){
								self.drItems[a]["itemName"] = self.items[b].itemName;
							}
						}
					}
					let size = 20;
					if(self.items.length > 1 && self.items.length < 20){
						self.spaceSize = size - self.drItems.length;
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
			openUpdateDR(dr){
				let self = this;

				self.getPONumbers();
				self.edit = {
					id: dr.id,
					drId: dr.deliveryReceiptId,
					drNumber: dr.drNumber,
					clientPO: dr.clientPO,
					deliveryDate: dr.deliveryDate,
					poNumber: dr.poNumber,
					poRef: dr.poReference,
					siNumber: dr.siNumber,
					terms: dr.paymentTermReference,
					deliveredTo: dr.customerReference,
					poAmount: dr.poAmount,
					totalAmount: dr.totalAmount
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
			updateDR(){
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
						dbSales.collection("deliveryReceipts")
						.doc(self.edit.id)
						.update({
							drNumber: self.edit.drNumber,
							deliveryDate: self.edit.deliveryDate,
							siNumber: self.edit.siNumber,
							clientPO: self.edit.clientPO,
							totalAmount: amount,
							poReference: poNum,
							paymentTermReference: self.edit.terms,
							customerReference: self.edit.deliveredTo,
							dateModified: today
						}).then(() => {
							if(self.edit.poRef != ''){
								let getId = dbSales.collection("deliveryReceiptItems")
									.where("drReference","==",self.edit.drId);

								getId.get().then((querySnapshot) => {
									querySnapshot.forEach((doc) => {
										dbSales.collection("deliveryReceiptItems")
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
											let driID = 'DRII-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

											dbSales.collection("deliveryReceiptItems").doc()
											.set({
												deliveryReceiptItemId: driID,
												description: doc.data().description,
												quantity: doc.data().quantity,
												unitPrice: doc.data().unitPrice,
												amount: doc.data().amount,
												vat: doc.data().vat,
												itemReference: doc.data().itemReference,
												drReference: self.edit.drId,
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
										self.getDeliveryReceipts();
										self.$swal({
											title: 'Success',
											text: 'Delivery receipt updated successfully!',
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
								self.getDeliveryReceipts();
								self.$swal({
									title: 'Success',
									text: 'Delivery receipt updated successfully!',
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
						self.newDRUnitPrice = format(price);
						if(self.newDRQuantity != '' && self.newDRQuantity > 0){
							self.computeAmount(self.newDRQuantity, self.newDRUnitPrice, 'add');
						}
					}else if(type == 'update'){
						self.editItem.drUnitPrice = format(price);
						if(self.editItem.drQuantity != '' && self.editItem.drQuantity > 0){
							self.computeAmount(self.editItem.drQuantity, self.editItem.drUnitPrice, 'update');
						}
					}
				});
			},
			computeAmount(quantity, price, type){
				price  = price.replaceAll(',', '');
				if (type == 'add') {
					this.newDRAmount = price * quantity;
					this.newDRAmount = format(parseFloat(this.newDRAmount).toFixed(2));
				}else if(type == 'update') {
					this.editItem.drAmount = price * quantity;
					this.editItem.drAmount = format(parseFloat(this.editItem.drAmount).toFixed(2));
				}
			},
			addDRItems(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newDRItem.$touch();
				self.$v.newDRQuantity.$touch();
				self.$v.newDRUnitPrice.$touch();
				self.$v.newDRAmount.$touch();
				self.$v.newDRVAT.$touch();
				if(!self.$v.newDRItem.$error && !self.$v.newDRQuantity.$error && !self.$v.newDRQuantity.$error && !self.$v.newDRUnitPrice.$error && !self.$v.newDRAmount.$error && !self.$v.newDRVAT.$error){
					try{
						let itemData = null;

						self.requestProcessing = true;
						itemData = dbSales.collection("deliveryReceiptItems")
							.where("drReference","==",self.dr.deliveryReceiptId)
							.where("itemReference","==",self.newDRItem);
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
								let driId = 'DRII-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

								userData.get().then((querySnapshot) => {
									querySnapshot.forEach((doc) => {
										users.push(doc.data());
									});
									self.newDRUnitPrice = self.newDRUnitPrice.replaceAll(",","");
									self.newDRAmount = self.newDRAmount.replaceAll(",","");
									self.dr.totalAmount = self.dr.totalAmount.replaceAll(",","");
									dbSales.collection("deliveryReceiptItems").doc()
									.set({
										deliveryReceiptItemId: driId,
										description: self.newDRDescription,
										quantity: self.newDRQuantity,
										unitPrice: self.newDRUnitPrice,
										amount: self.newDRAmount,
										vat: self.newDRVAT,
										itemReference: self.newDRItem,
										drReference: self.dr.deliveryReceiptId,
										status: 1,
										userReference: users[0].userId,
										dateCreated: today,
										dateModified: today
									}).then(() => {
										let total = parseFloat(self.dr.totalAmount) + parseFloat(self.newDRAmount);

										dbSales.collection("deliveryReceipts")
										.doc(self.dr.id)
										.update({
											totalAmount: parseFloat(total).toFixed(2),
											dateModified: today
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
											self.requestProcessing = false;
											self.$bvModal.hide("new-dr-item-modal");
											self.getDeliveryReceipts();
											self.getItems();
											self.$swal({
												title: 'Success',
												text: 'New D.R. item added successfully!',
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
					drItemId: row.deliveryReceiptItemId,
					drItem: row.itemReference,
					drDescription: row.description,
					drQuantity: row.quantity,
					drUnitPrice: row.unitPrice,
					drAmount: row.amount,
					drOldAmount: row.amount,
					drVAT: row.vat
				}
				self.$bvModal.show("update-dr-item-modal");
			},
			updateDRItems(){
				let self = this;

				self.requestProcessing = false;
				self.$v.editItem.$touch();
				if(!self.$v.editItem.$error){
					try{
						self.requestProcessing = true;
						let itemData = dbSales.collection("deliveryReceiptItems")
							.where("itemReference","==",self.editItem.drItem)
							.where("drReference","==",self.dr.deliveryReceiptId)
							.where("deliveryReceiptItemId","!=",self.editItem.drItemId);

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
								dbSales.collection("deliveryReceiptItems")
								.doc(self.editItem.id)
								.update({
									description: self.editItem.drDescription,
									quantity: self.editItem.drQuantity,
									unitPrice: self.editItem.drUnitPrice,
									amount: self.editItem.drAmount,
									vat: self.editItem.drVAT,
									itemReference: self.editItem.drItem,
									dateModified: today
								}).then(() => {
									let total = parseFloat(self.dr.totalAmount.replaceAll(",","")) - parseFloat(self.editItem.drOldAmount.replaceAll(",",""));

									total = parseFloat(total) + parseFloat(self.editItem.drAmount.replaceAll(",",""));
									dbSales.collection("deliveryReceipts")
									.doc(self.dr.id)
									.update({
										totalAmount: parseFloat(total).toFixed(2),
										dateModified: today
									}).then(() => {
										self.$v.editItem.$reset();
										self.requestProcessing = false;
										self.$bvModal.hide("update-dr-item-modal");
										self.getDeliveryReceipts();
										self.getItems();
										self.$swal({
											title: 'Success',
											text: 'D.R. item updated successfully!',
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
							dbSales.collection("deliveryReceiptItems")
							.doc(row.id)
							.delete()
							.then(() => {
								let total = parseFloat(self.dr.totalAmount.replaceAll(",","")) - parseFloat(row.amount.replaceAll(",",""));

								dbSales.collection("deliveryReceipts")
								.doc(self.dr.id)
								.update({
									totalAmount: parseFloat(total).toFixed(2),
									dateModified: today
								}).then(() => {
									self.requestProcessing = false;
									self.getDeliveryReceipts();
									self.$swal({
										title: 'Success',
										text: 'D.R. item removed successfully!',
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
							dbSales.collection("deliveryReceipts")
							.doc(self.dr.id)
							.update({
								status: stat,
								dateModified: today
							}).then(() => {
								self.requestProcessing = false;
								self.getDeliveryReceipts();
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
			printDR(){
				printJS({
					printable: 'viewSummary',
					type: 'html',
					style: '#viewSummary {font-family: "Calibri";} #marginStyle {margin-top: 10px; padding-left: 50px;} #leftSpaceStyle {padding-left: 50px;} #rightSpaceStyle {padding-right: 19px;} #topSpaceStyle {padding-top: 19px; padding-right: 19px;}',
					documentTitle: 'Delivery Receipt',
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