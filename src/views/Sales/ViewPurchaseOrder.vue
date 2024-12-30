<template>
	<div id="textStyle"> 
		<base-header class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-12 container-fluid mt--7">
			<card>
				<div class="row pl-4">
					<span class="col-sm-12">
						<b>PO No. {{po.poNumber}}</b>
						<b v-if="po.status == 1"> (Pending)</b>
						<b v-if="po.status == 2"> (Sent)</b>
						<b v-if="po.status == 3"> (Delivered)</b>
						<b v-if="po.status == 4"> (Done)</b>
						<b v-if="po.status == 5"> (Reject)</b>
						<b v-if="po.status == 0"> (Cancel)</b>
					</span>
				</div>
				<hr>
				<div class="row pl-4">
					<span class="col-sm-12"
                      v-for="supplier in suppliers"
                      v-bind:key="supplier.supplierId">
						<span v-if="supplier.supplierId == po.supplierReference">
							<b>Supplier:</b> {{supplier.supplierName}}
						</span>
                    </span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-12"
						id="particular">
						<b>Delivery Address:</b> {{po.deliveryAddress}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-12">
						<b>Total Amount:</b> ₱ {{po.totalAmount}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-12" 
                      v-for="term in paymentTerms"
                      v-bind:key="term.paymentTermId">
						<span v-if="term.paymentTermId == po.paymentTermReference">
							<b>Payment Terms:</b> {{term.description}}
						</span>
                    </span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Date:</b> {{po.poDate | moment("MMM DD, YYYY")}}
					</span>
					<span class="col-sm-6">
						<b>Expected Delivery Date:</b> {{po.expectedDeliveryDate == '' ? '----------' : po.expectedDeliveryDate | moment("MMM DD, YYYY")}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6" id="particular">
						<b>Attention:</b> {{po.attention}}
					</span>
					<span class="col-sm-6" id="particular">
						<b>Approve by:</b> <input type="text" v-model="approveBy" style="border-top: 0px; border-left: 0px; border-right: 0px;">
					</span>
					<span class="col-sm-12" id="particular">
						<b>Remarks:</b> {{po.remarks}}
					</span>
				</div>
				<hr class="mb-1">
				<div class="text-left pl-2">
					<h2 class="display-5"
						id="sideBarTxt">Items</h2>
				</div>       
				<div class="table-full-width pt-2">
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
									v-if="po.status == 1"
									title="Update"></span>
								<span class="pointer ml-2 far fa-times-circle"
									id="sideBarTxt"
									v-on:click="removeItem(props.row)"
									v-if="po.status == 1"
									title="Remove"></span>
							</span></b>
						</template>
					</vue-good-table>
				</div>
				<hr class="mt-2 mb-2">
				<div class="pl-2 pr-2 text-right">
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="po.status == 1"
						v-b-modal.new-po-item-modal>Add Item</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="po.status == 1"
						@click="openUpdatePO(po)">Update</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="po.status == 2 || po.status == 5 || po.status == 0"
						@click="changeStatus(1)">Pending</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="po.status == 1 || po.status == 3"
						@click="changeStatus(2)">Sent</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="po.status == 1 || po.status == 0"
						@click="changeStatus(5)">Reject</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="po.status == 1 || po.status == 5"
						@click="changeStatus(0)">Cancel</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="po.status == 2 || po.status == 4"
						@click="changeStatus(3)">Delivered</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="po.status == 3"
						@click="changeStatus(4)">Done</base-button>
					<base-button id="darkBtn"
						class="col-sm-2"
						v-if="po.status == 2 || po.status == 3 || po.status == 4"
						@click="printPO()"
						:disabled="requestProcessing">Print</base-button>
					<base-button id="darkInlineBtn"
						@click="closePage()"
						:disabled="requestProcessing">Close</base-button>
				</div>
			</card>
			<card id="viewSummary"
				v-if="po.status == 2 || po.status == 3 || po.status == 4"
				class="pl-4 shadow">
				<div class="row">
					<span class="col-sm-3 text-center pr-0 pl-0"
						id="particular">
						<img :src="'img/icons/avasia.png'">
					</span>
					<span class="col-sm-4"
						align="left">
						<h3 id="darkTxt">Information</h3>
						<h3 id="darkTxt">Systems, Inc.</h3>
					</span>
					<span class="col-sm-2"></span>
					<span class="col-sm-3"
						align="left">
						<h4 id="darkTxt">PURCHASE ORDER</h4>
						<h2 id="darkTxt">{{po.poNumber}}</h2>
					</span>
				</div>
				<div class="row"
					style="font-size: 20px;" >
					<span class="col-sm-12"
						align="left"
						id="particular">{{company.address}}</span>
				</div>
				<div class="row"
					style="font-size: 20px;">
					<span class="col-sm-3"
						align="left"
						id="particular">Tel No. {{company.telNumber}}</span>
					<span class="col-sm-3"
						align="left"
						id="particular">Telefax: {{company.telefax}}</span>
				</div>
				<div class="row"
					style="font-size: 20px;">
					<span class="col-sm-12"
						align="left"
						id="particular">E-mail: {{company.emailAddress}}</span>
				</div>
				<div class="row"
					id="hrStyleA"
					style="font-size: 20px;">
					<span class="col-sm-12"
						align="left"
						id="particular">Tin: {{company.tinNumber}}</span>
				</div>
				<div class="row"
					style="padding-top: 15px; font-size: 20px;">
					<span class="col-sm-12">
						<span align="left"
							v-for="supplier in suppliers"
							v-bind:key="supplier.supplierId">
							<span v-if="supplier.supplierId == po.supplierReference">
								To: {{supplier.supplierName}}
							</span>
						</span>
					</span>
				</div>
				<div class="row"
					style="font-size: 20px;" >
					<span class="col-sm-12">
						<span align="left"
							v-for="supplier in suppliers"
							v-bind:key="supplier.supplierId">
							<span v-if="supplier.supplierId == po.supplierReference">
								Address: {{supplier.address}}
							</span>
						</span>
                    </span>
				</div>
				<br>
				<div class="row"
					style="font-size: 20px;" >
					<span class="col-sm-12"
						align="left"
						id="particular">Attention: {{po.attention}}</span>
				</div>
				<br>
				<div class="row ml-0 mr-3"
					style="padding-bottom: 10px; font-size: 20px;">
					<span class="col-sm-3"
						align="left"
						id="borderStyle"><b>PO No: {{po.poNumber}}</b></span>
					<span class="col-sm-3"
						align="left"
						id="borderStyle"><b>Date Issued: {{po.poDate | moment("MM/DD/YY")}}</b></span>
					<span class="col-sm-3"
						align="left"
						id="borderStyle"><b>Delivery Date: {{po.expectedDeliveryDate | moment("MM/DD/YY")}}</b></span>
					<span id="borderStyle"
						class="col-sm-3">
						<span align="left"
							v-for="term in paymentTerms"
							v-bind:key="term.paymentTermId">
							<span v-if="term.paymentTermId == po.paymentTermReference">
								<b>Terms</b> {{term.description}}
							</span>
						</span>
					</span>
				</div>
				<div class="row ml-0 mr-3"
					id="hrStyle"
					style="font-size: 20px;">
					<span class="col-sm-2"
						align="left"><b>QTY</b></span>
					<span class="col-sm-4"
						align="left"><b>DESCRIPTION</b></span>
					<span class="col-sm-3"
						align="right"><b>UNIT PRICE</b></span>
					<span class="col-sm-3"
						align="right"><b>AMOUNT</b></span>
				</div>
				<div class="row ml-0 mr-3"
					v-for="item in poItems"
					v-bind:key="item.purchaseOrderItemId"
					style="font-size: 20px;" >
					<span class="col-sm-2"
						align="left"><b>{{item.quantity}}</b></span>
					<span class="col-sm-4"
						align="left"><b>{{item.itemName}}</b></span>
					<span class="col-sm-3"
						align="right"><b>{{item.unitPrice}}</b></span>
					<span class="col-sm-3"
						align="right"><b>{{item.amount}}</b></span>
				</div>
				<br>
				<div class="row ml-0 mr-3"
					id="hrStyle"
					style="font-size: 20px;" >
					<span class="col-sm-4"></span>
					<span class="col-sm-2"
						align="right"><b>TOTAL</b></span>
					<span class="col-sm-3"
						align="right"><b>Php</b></span>
					<span class="col-sm-3"
						align="right"><b>{{po.totalAmount}}</b></span>
				</div>
				<div class="row"
					style="font-size: 20px;" >
					<span class="col-sm-12"
						align="left"
						id="particular"><b>REMARKS:</b> {{po.remarks}}</span>
				</div>
				<br>
				<div class="row"
					style="font-size: 20px;" >
					<span class="col-sm-12"
						align="left"
						id="particular"><b>NOTE TO SUPPLIER:</b></span>
				</div>
				<br>
				<div class="row ml-0 mr-3"
					v-for="note in notes"
					v-bind:key="note.supplierNoteId"
					style="font-size: 20px;" >
					<span class="col-sm-12"
						align="left">{{note.num}}. {{note.note}}</span>
				</div><br>
				<br>
				<div class="row"
					style="font-size: 20px;" >
					<span class="col-sm-5">
						<b>PREPARED BY :</b> {{user.firstname}} {{user.lastname}}
					</span>
					<span class="col-sm-2"></span>
					<span class="col-sm-5">
						<b>APPROVED BY : </b> {{approveBy}}
					</span>
				</div>
				<div class="row"
					style="font-size: 20px;" >
					<span class="col-sm-5">
						<b>ACCEPTED BY :</b>
					</span>
				</div>
			</card>
			<!-- UPDATE MODAL -->
			<b-modal size="xl"
				id="update-modal"
				title="Edit Purchase Order" centered
				:hide-header-close="true"
				:no-close-on-backdrop="true"
				:no-close-on-esc="true">
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Suppliers:</b>
						<b class="text-red">*</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>PO Date:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="suppliers"
							:reduce="supplier => supplier.supplierId"
							label="supplierName"
							v-model="edit.supplier"
							:clearable="false"></v-select>
						<i class="text-red"
							v-if="$v.edit.supplier.$anyDirty && !$v.edit.supplier.required">Field Required</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="edit.poDate"
							type="date"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.poDate.$anyDirty && !$v.edit.poDate.required">Field Required</i>
					</div>
				</div>
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Payment Terms:</b>
						<b class="text-red">*</b>
					</label>
					<label class="col-sm-6 col-form-label">
						<b>Expected Delivery Date:</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="paymentTerms"
							:reduce="term => term.paymentTermId"
							label="description"
							v-model="edit.paymentTerm"
							:clearable="false"></v-select>
							<i class="text-red"
								v-if="$v.edit.paymentTerm.$anyDirty && !$v.edit.paymentTerm.required">Field Required</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="edit.expectedDeliveryDate"
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
						<b>Attention:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<textarea rows="2"
							cols="59"
							v-model="edit.deliveryAddress"
							id="inputStyle"
							class="pl-2"
							placeholder="Delivery Address"></textarea>
						<i class="text-red"
							v-if="$v.edit.deliveryAddress.$anyDirty && !$v.edit.deliveryAddress.required">Field Required</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<textarea rows="2"
							cols="59"
							v-model="edit.attention"
							id="inputStyle"
							class="pl-2"
							placeholder="Attention"></textarea>
					</div>
				</div>
				<div class="form-group row mb-0">
					<label class="col-sm-6 col-form-label">
						<b>Remarks:</b>
						<b class="text-red">*</b>
					</label>
				</div>
				<div class="form-group row mb-0">
					<div class="col-sm-6 pl-5 pr-5">
						<textarea rows="2"
							cols="49"
							v-model="edit.remarks"
							id="inputStyle"
							class="pl-2"
							placeholder="Remarks"></textarea>
					</div>
				</div>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="updatePO()"
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
					<div class="col-sm-4 pl-5">
						<v-select id="inputStyle"
							:options="items"
							:reduce="item => item.itemId"
							label="itemName"
							v-model="newPOItem"
							:clearable="false"
							@input="changeItem(newPOItem, 'add')"></v-select>
						<i class="text-red"
							v-if="$v.newPOItem.$anyDirty && !$v.newPOItem.required">Field Required</i>
					</div>
					<div class="col-sm-2 pr-5">
						<base-button v-b-modal.new-item-modal
							id="darkBtn" block
							:disabled="requestProcessing">Add</base-button>
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
					<label class="col-sm-6 col-form-label">
						<b>VAT:</b>
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
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="vats"
							:reduce="vat => vat.vatId"
							label="vat"
							v-model="newPOVAT"
							:clearable="false"></v-select>
						<i class="text-red"
							v-if="$v.newPOVAT.$anyDirty && !$v.newPOVAT.required">Field Required</i>
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
			<!-- UPDATE PO ITEM MODAL -->
			<b-modal size="xl"
				id="update-po-item-modal"
				title="Update PO Item" centered
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
							v-model="editItem.poItem"
							:clearable="false"
							@input="changeItem(editItem.poItem, 'update')"></v-select>
						<i class="text-red"
							v-if="$v.editItem.poItem.$anyDirty && !$v.editItem.poItem.required">Field Required</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<textarea rows="2"
							cols="59"
							v-model="editItem.poDescription"
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
						<base-input v-model="editItem.poQuantity"
							id="inputStyle"
							type="text"
							placeholder="Quantity"
							@input="computeAmount(editItem.poQuantity, editItem.poUnitPrice, 'update')"></base-input>
						<i class="text-red"
							v-if="$v.editItem.poQuantity.$anyDirty && !$v.editItem.poQuantity.required">Field Required</i>
						<i class="text-red"
							v-if="$v.editItem.poQuantity.$anyDirty && !$v.editItem.poQuantity.numCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="editItem.poUnitPrice"
							id="inputStyle"
							type="text"
							placeholder="Unit Price"
							@input="computeAmount(editItem.poQuantity, editItem.poUnitPrice, 'update')"></base-input>
						<i class="text-red"
							v-if="$v.editItem.poUnitPrice.$anyDirty && !$v.editItem.poUnitPrice.required">Field Required</i>
						<i class="text-red"
							v-if="$v.editItem.poUnitPrice.$anyDirty && !$v.editItem.poUnitPrice.amountCustomValidator">Invalid Characters</i>
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
						<base-input v-model="editItem.poAmount"
							id="inputStyle"
							type="text"
							placeholder="Amount" disabled></base-input>
						<i class="text-red"
							v-if="$v.editItem.poAmount.$anyDirty && !$v.editItem.poAmount.required">Field Required</i>
						<i class="text-red"
							v-if="$v.editItem.poAmount.$anyDirty && !$v.editItem.poAmount.amountCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="vats"
							:reduce="vat => vat.vatId"
							label="vat"
							v-model="editItem.poVAT"
							:clearable="false"></v-select>
						<i class="text-red"
							v-if="$v.editItem.poVAT.$anyDirty && !$v.editItem.poVAT.required">Field Required</i>
					</div>
				</div>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="updatePOItems"
								:disabled="requestProcessing">
								<i v-if="requestProcessing"
									class="fa fa-spinner fa-spin"></i>Update
							</base-button>
							<base-button id="darkInlineBtn"
								@click.native="$bvModal.hide('update-po-item-modal')"
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
	// import printJS from 'print-js';
	
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
				po: [],
				suppliers: [],
				paymentTerms: [],
				items: [],
				vats: [
					{'vatId': 'taxInclusive', 'vat': 'Tax Inclusive'},
					{'vatId': 'taxExclusive', 'vat': 'Tax Exclusive'},
					{'vatId': 'vatExempt', 'vat': 'VAT Exempt'}
				],
				poItems: [],
				columns: [{
						label: 'Item',
						field: 'itemName',
						width: '200px',
					},{
						label: 'Description',
						field: 'description',
						width: '200px',
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
				edit: {
					id: '',
					poId: '',
					supplier: '',
					deliveryAddress: '',
					paymentTerm: '',
					poDate: '',
					expectedDeliveryDate: '',
					attention: '',
					remarks: ''
				},
				newPOItem: '',
				newPODescription: '',
				newPOQuantity: '',
				newPOUnitPrice: '',
				newPOAmount: '',
				newPOVAT: 'taxInclusive',
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
					poItemId: '',
					poItem: '',
					poDescription: '',
					poQuantity: '',
					poUnitPrice: '',
					poAmount: '',
					poOldAmount: '',
					poVAT: ''
				},
				company: [],
				notes: [],
				user: {
					firstname: '',
					lastname: ''
				},
				approveBy: 'Alexander Pasia'
			}
		},
		validations:{
			edit: {
				supplier: {required},
				deliveryAddress: {required},
				paymentTerm: {required},
				poDate: {required}
			},
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
			newPOVAT: {required},
			newItemName: {
				required,
				alphaNumCustomValidator
			},
			newType: {required},
			newCostPrice: {amountCustomValidator},
			newSalePrice: {amountCustomValidator},
			newItemSupplier: {required},
			editItem: {
				poItem: {required},
				poQuantity: {
					required,
					numCustomValidator
				},
				poUnitPrice: {
					required,
					amountCustomValidator
				},
				poAmount: {
					required,
					amountCustomValidator
				},
				poVAT: {required}
			}
		},
		async mounted(){
			this.getSuppliers();
			this.getPaymentTerms();
			this.getPurchaseOrder();
			this.getItems();
			this.getItemCategories();
			this.getCompany();
			this.getNotes();
			this.getUser(localStorage.getItem('aisname'));
		},
		methods: {
			closePage(){
				this.$router.push('/sales/purchase/order');
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
						self.newPOItem = self.items[0].itemId;
						self.changeItem(self.items[0].itemId, 'add');
						self.changeItem(self.items[0].itemId, 'update');
					}
				});
			},
			getNotes(){
				let self = this;
				let noteData = dbMains.collection("supplierNotes")
					.orderBy("dateCreated","asc");

				self.notes = [];
				noteData.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							self.notes.push(doc.data());
						});
						for(let a = 0; a < self.notes.length; a++){
							self.notes[a]["num"] = a + 1;
						}
					}
				});
			},
			getPurchaseOrder(){
				let self = this, pos = [], id = '';
				let poData = dbSales.collection("purchaseOrders")
					.where("purchaseOrderId","==",this.$router.currentRoute.params.id);

				self.po = [];
				poData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						pos.push(doc.data());
						id = doc.id;
					});
					pos[0]["id"] = id;
					pos[0].totalAmount = format(pos[0].totalAmount);
					self.po = pos[0];
					self.getPOItems();
				});
			},
			getPOItems(){
				let self = this, ids = [];
				let itemData = dbSales.collection("purchaseOrderItems")
					.where("poReference","==",this.$router.currentRoute.params.id);

				self.poItems = [];
				self.requestProcessing = true;
				itemData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.poItems.push(doc.data());
						ids.push(doc.id);
					});
					for(let a = 0; a < self.poItems.length; a++){
						self.poItems[a]["id"] = ids[a];
						self.poItems[a].unitPrice = parseFloat(self.poItems[a].unitPrice.replaceAll(",","")).toFixed(2)
						self.poItems[a].unitPrice = format(self.poItems[a].unitPrice);
						self.poItems[a].amount = format(self.poItems[a].amount);
						for(let b = 0; b < self.items.length; b++){
							if(self.items[b].itemId == self.poItems[a].itemReference){
								self.poItems[a]["itemName"] = self.items[b].itemName;
							}
						}
					}
				});
				setTimeout(function() {
					self.requestProcessing = false;
				}, 1000);
			},
			openUpdatePO(po){
				let self = this;

				self.edit = {
					id: po.id,
					poId: po.purchaseOrderId,
					supplier: po.supplierReference,
					deliveryAddress: po.deliveryAddress,
					paymentTerm: po.paymentTermReference,
					poDate: po.poDate,
					expectedDeliveryDate: po.expectedDeliveryDate,
					attention: po.attention,
					remarks: po.remarks
				}
				self.$bvModal.show('update-modal');
			},
			updatePO(){
				let self = this;

				self.requestProcessing = true;
				self.$v.edit.$touch();
				if(!self.$v.edit.$error){
					try{
						dbSales.collection("purchaseOrders")
						.doc(self.edit.id)
						.update({
							deliveryAddress: self.edit.deliveryAddress,
							poDate: self.edit.poDate,
							expectedDeliveryDate: self.edit.expectedDeliveryDate,
							attention: self.edit.attention,
							remarks: self.edit.remarks,
							supplierReference: self.edit.supplier,
							paymentTermReference: self.edit.paymentTerm,
							dateModified: today
						}).then(() => {
							self.edit= {};
							self.$v.edit.$reset();
							self.$bvModal.hide('update-modal');
							self.requestProcessing = false;
							self.getPurchaseOrder();
							self.$swal({
								title: 'Success',
								text: 'Purchase order updated successfully!',
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
					}catch(error){
						console.log(error);
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
						self.newPOUnitPrice = format(price);
						if(self.newPOQuantity != '' && self.newPOQuantity > 0){
							self.computeAmount(self.newPOQuantity, self.newPOUnitPrice, 'add');
						}
					}else if(type == 'update'){
						self.editItem.poUnitPrice = format(price);
						if(self.editItem.poQuantity != '' && self.editItem.poQuantity > 0){
							self.computeAmount(self.editItem.poQuantity, self.editItem.poUnitPrice, 'update');
						}
					}
				});
			},
			computeAmount(quantity, price, type){
				price  = price.replaceAll(',', '');
				if (type == 'add') {
					this.newPOAmount = price * quantity;
					this.newPOAmount = format(parseFloat(this.newPOAmount).toFixed(2));
				}else if(type == 'update') {
					this.editItem.poAmount = price * quantity;
					this.editItem.poAmount = format(parseFloat(this.editItem.poAmount).toFixed(2));
				}
			},
			addPOItems(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newPOItem.$touch();
				self.$v.newPOQuantity.$touch();
				self.$v.newPOUnitPrice.$touch();
				self.$v.newPOAmount.$touch();
				self.$v.newPOVAT.$touch();
				if(!self.$v.newPOItem.$error && !self.$v.newPOQuantity.$error && !self.$v.newPOQuantity.$error && !self.$v.newPOUnitPrice.$error && !self.$v.newPOAmount.$error && !self.$v.newPOVAT.$error){
					try{
						let itemData = null;

						self.requestProcessing = true;
						itemData = dbSales.collection("purchaseOrderItems")
							.where("poReference","==",self.po.purchaseOrderId)
							.where("itemReference","==",self.newPOItem);
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
								let poiId = 'POII-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

								userData.get().then((querySnapshot) => {
									querySnapshot.forEach((doc) => {
										users.push(doc.data());
									});
									self.newPOUnitPrice = self.newPOUnitPrice.replaceAll(",","");
									self.newPOAmount = self.newPOAmount.replaceAll(",","");
									self.po.totalAmount = self.po.totalAmount.replaceAll(",","");
									dbSales.collection("purchaseOrderItems").doc()
									.set({
										purchaseOrderItemId: poiId,
										description: self.newPODescription,
										quantity: self.newPOQuantity,
										unitPrice: self.newPOUnitPrice,
										amount: self.newPOAmount,
										vat: self.newPOVAT,
										itemReference: self.newPOItem,
										poReference: self.po.purchaseOrderId,
										status: 1,
										userReference: users[0].userId,
										dateCreated: today,
										dateModified: today
									}).then(() => {
										let total = parseFloat(self.po.totalAmount) + parseFloat(self.newPOAmount);

										dbSales.collection("purchaseOrders")
										.doc(self.po.id)
										.update({
											totalAmount: parseFloat(total).toFixed(2),
											dateModified: today
										}).then(() => {
											self.newPOItem = '';
											self.newPODescription = '';
											self.newPOQuantity = '';
											self.newPOUnitPrice = '';
											self.newPOAmount = '';
											self.newPOVAT = 'taxInclusive';
											self.$v.newPOItem.$reset();
											self.$v.newPOQuantity.$reset();
											self.$v.newPOUnitPrice.$reset();
											self.$v.newPOAmount.$reset();
											self.$v.newPOVAT.$reset();
											self.requestProcessing = false;
											self.$bvModal.hide("new-po-item-modal");
											self.getPurchaseOrder();
											self.getItems();
											self.$swal({
												title: 'Success',
												text: 'New PO item added successfully!',
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
					poItemId: row.purchaseOrderItemId,
					poItem: row.itemReference,
					poDescription: row.description,
					poQuantity: row.quantity,
					poUnitPrice: row.unitPrice,
					poAmount: row.amount,
					poOldAmount: row.amount,
					poVAT: row.vat
				}
				self.$bvModal.show("update-po-item-modal");
			},
			updatePOItems(){
				let self = this;

				self.requestProcessing = false;
				self.$v.editItem.$touch();
				if(!self.$v.editItem.$error){
					try{
						self.requestProcessing = true;
						let itemData = dbSales.collection("purchaseOrderItems")
							.where("itemReference","==",self.editItem.poItem)
							.where("poReference","==",self.po.purchaseOrderId)
							.where("purchaseOrderItemId","!=",self.editItem.poItemId);

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
								dbSales.collection("purchaseOrderItems")
								.doc(self.editItem.id)
								.update({
									description: self.editItem.poDescription,
									quantity: self.editItem.poQuantity,
									unitPrice: self.editItem.poUnitPrice,
									amount: self.editItem.poAmount,
									vat: self.editItem.poVAT,
									itemReference: self.editItem.poItem,
									dateModified: today
								}).then(() => {
									let total = parseFloat(self.po.totalAmount.replaceAll(",","")) - parseFloat(self.editItem.poOldAmount.replaceAll(",",""));

									total = parseFloat(total) + parseFloat(self.editItem.poAmount.replaceAll(",",""));
									dbSales.collection("purchaseOrders")
									.doc(self.po.id)
									.update({
										totalAmount: parseFloat(total).toFixed(2),
										dateModified: today
									}).then(() => {
										self.$v.editItem.$reset();
										self.requestProcessing = false;
										self.$bvModal.hide("update-po-item-modal");
										self.getPurchaseOrder();
										self.getItems();
										self.$swal({
											title: 'Success',
											text: 'PO item updated successfully!',
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
							dbSales.collection("purchaseOrderItems")
							.doc(row.id)
							.delete()
							.then(() => {
								let total = parseFloat(self.po.totalAmount.replaceAll(",","")) - parseFloat(row.amount.replaceAll(",",""));

								dbSales.collection("purchaseOrders")
								.doc(self.po.id)
								.update({
									totalAmount: parseFloat(total).toFixed(2),
									dateModified: today
								}).then(() => {
									self.requestProcessing = false;
									self.getPurchaseOrder();
									self.$swal({
										title: 'Success',
										text: 'PO item removed successfully!',
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
					msg = 'sent';
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
							dbSales.collection("purchaseOrders")
							.doc(self.po.id)
							.update({
								status: stat,
								dateModified: today
							}).then(() => {
								self.requestProcessing = false;
								self.getPurchaseOrder();
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
			printPO(){
				// printJS({
				// 	printable: 'viewSummary',
				// 	type: 'html',
				// 	style: '#viewSummary {font-family: "Calibri";} #borderStyle {border-width: 1px; border-style: solid; padding-left: 5px;}',
				// 	targetStyles: ['font-size'],
				// 	documentTitle: 'Purchase Order',
				// });
				this.$htmlToPaper('viewSummary');
			},
		}
	}
</script>
<style>
	#viewSummary {
		position: absolute;
		visibility: hidden;
		top: -1000px;
	}
	#borderStyle {
		border-width: 1px;
		border-style: solid;
	}
</style>