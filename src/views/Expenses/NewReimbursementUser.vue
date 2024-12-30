<template>
	<!-- New reimbursement form -->
	<card>
		<!-- <div class="form-group row mb-0">
			<label class="col-sm-6 col-form-label">
				<b>Company:</b>
			</label>
		</div>
		<div class="form-group row mb-0">
			<div class="col-sm-6 pl-5 pr-5">
				<v-select id="inputStyle"
					:options="companies"
					:reduce="company => company.companyId"
					label="companyName"
					v-model="newCompany"
					:clearable="true"></v-select>
			</div>
		</div> -->
		<div class="form-group row mb-2 mt-2 pt-2"
			v-if="totalAmount != '0.00' || totalAmount != 0">
			<div class="col-sm-12 pr-8 pl-5">
				<b v-if="totalItems != '0.00' || totalItems != 0">Total Items Amount:</b>
				<span v-if="totalItems != '0.00' || totalItems != 0"
					style="text-decoration: underline;"> ₱ {{totalItems}}</span><br>
				<b v-if="totalTrans != '0.00' || totalTrans != 0">Total Transportation Amount:</b>
				<span style="text-decoration: underline;"
					v-if="totalTrans != '0.00' || totalTrans != 0"> ₱ {{totalTrans}}</span>
				<h5 class="text-right"
					v-if="totalAmount != '0.00' || totalAmount != 0"><b>Total Amount:</b>
					<span style="text-decoration: underline;"> ₱ {{totalAmount}} </span>
				</h5>
			</div>
		</div>
		<hr>
		<div class="form-group row mb-2 mt-2 pt-2">
			<div class="col-sm-3 pl-5">
				<base-button block id="darkBtn"
					@click="openReimItemModal(desc)">Add Item for</base-button>
			</div>
			<div class="col-sm-6">
				<v-select id="inputStyle"
					:options="descriptions"
					:reduce="desc => desc.reimbursementDescId"
					label="description"
					v-model="desc"
					:clearable="false"></v-select>
				<i class="text-red"
					v-if="$v.desc.$anyDirty && !$v.desc.required">Field Required</i>
			</div>
			<div class="col-sm-2">
				<span v-on:click="$bvModal.show('new-reim-desc-modal')"
                    id="sideBarTxt"
                    class="pointer">Add Description</span>
			</div>
		</div>
		<hr class="mb-1">
		<div class="card-header bg-transparent pb-1">
			<div class="text-left">
				<h2 class="display-5"
					id="sideBarTxt">Reimbursement Items</h2>
			</div>       
		</div>
		<div class="table-full-width pt-2">
			<paper-table type="hover"
				:loading="false"
				:loadError="loadError"
				:title="reimItemsTable.title"
				:sub-title="reimItemsTable.subTitle"
				:data="reimItems"
				:columns="reimItemsTable.columns">
				<template slot-scope="{ row }">
					<td>{{row.rowNum}}</td>
					<td>
						<span id="particular">{{row.date | moment('MMM DD, YYYY')}}</span>
					</td>
					<td>
						<span id="particular">{{row.particular}}</span>
					</td>
					<td>
						<span id="particular">₱ {{row.amount}}</span>
					</td>
					<td>
						<span v-for="desc in descriptions"
							v-bind:key="desc.reimbursementDescId" >
							<span v-if="desc.reimbursementDescId == row.desc"
								id="particular">{{desc.description}}</span>
						</span>
					</td>
					<td align="right">
						<span class="pointer ml-2 far fa-edit"
							id="sideBarTxt"
							v-on:click="openUpdateItemModal(row)"
							v-if="row.rowNum != ''"
							title="Update"></span>
						<span class="pointer ml-2 far fa-times-circle text-red"
							v-on:click="removeItem(row)"
							v-if="row.rowNum != ''"
							title="Remove"></span>
					</td>
				</template>
			</paper-table>
		</div>
		<hr v-if="items.length">
		<div class="row pl-4"
			v-if="items.length">
			<div class="col-8">
				<span class="pagination-results">{{items[items.length - 1].rowNum}} of {{reimItemsCount}}</span>
			</div>
			<pagination :searching="false"
				:searchTotalPage="items"
				:totalPages="reimItemsCount"
				:currentPage="currentPage"
				@pagechanged="onPageChange"></pagination>
		</div>
		<hr>
		<div class="card-header bg-transparent pb-1">
			<div class="text-left">
				<h2 class="display-5"
					id="sideBarTxt">Transportation Reimbursement</h2>
			</div>       
		</div>
		<div class="table-full-width pt-2">
			<paper-table type="hover"
				:loading="false"
				:loadError="loadError"
				:title="transReimsTable.title"
				:sub-title="transReimsTable.subTitle"
				:data="transReims"
				:columns="transReimsTable.columns">
				<template slot-scope="{ row }">
					<td>{{row.rowNum}}</td>
					<td>
						<span id="particular">{{row.date | moment('MMM DD, YYYY')}}</span>
					</td>
					<td>
						<span id="particular">{{row.mode}}</span>
					</td>
					<td>
						<span id="particular">{{row.from}}</span>
					</td>
					<td>
						<span id="particular">{{row.to}}</span>
					</td>
					<td>
						<span id="particular">{{row.purpose}}</span>
					</td>
					<td>
						<span id="particular">₱ {{row.amount}}</span>
					</td>
					<td align="right">
						<span class="pointer ml-2 far fa-edit"
							id="sideBarTxt"
							v-on:click="openUpdateTransModal(row)"
							v-if="row.rowNum != ''"
							title="Update"></span>
						<span class="pointer ml-2 far fa-times-circle text-red"
							v-on:click="removeTrans(row)"
							v-if="row.rowNum != ''"
							title="Remove"></span>
					</td>
				</template>
			</paper-table>
		</div>
		<hr v-if="trans.length">
		<div class="row pl-4"
			v-if="trans.length">
			<div class="col-8">
				<span class="pagination-results">{{trans[trans.length - 1].rowNum}} of {{transReimsCount}}</span>
			</div>
			<pagination :searching="false"
				:searchTotalPage="trans"
				:totalPages="transReimsCount"
				:currentPage="currentTransPage"
				@pagechanged="onTransPageChange"></pagination>
		</div>
		<hr>
			<div class="text-center">
				<base-button id="darkBtn"
					class="col-md-2 ml-2"
					@click.native="addReimbursement"
					v-if="totalAmount != '0.00' ||  totalAmount != 0">Save</base-button>
			</div>
		<!-- ADD REIMBURSEMENT DESCRIPTION MODAL -->
		<b-modal size="md"
			id="new-reim-desc-modal"
			title="New Reimbursement Description" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-12 col-form-label">
					<b>Description:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-12 pl-5 pr-5">
					<base-input v-model="newDesc"
						id="inputStyle"
						type="text"
						placeholder="Description"></base-input>
					<i class="text-red"
						v-if="$v.newDesc.$anyDirty && !$v.newDesc.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newDesc.$anyDirty && !$v.newDesc.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addReimDesc"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('new-reim-desc-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- ADD REIMBURSEMENT ITEM MODAL -->
		<b-modal size="lg"
			id="new-reim-item-modal"
			title="New Reimbursement Item" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Item:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newDate"
						type="date"
						id="inputStyle"
						:max="processMaxDate"></base-input>
					<i class="text-red"
						v-if="$v.newDate.$anyDirty && !$v.newDate.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newParticular"
						id="inputStyle"
						type="text"
						placeholder="Item"></base-input>
					<i class="text-red"
						v-if="$v.newParticular.$anyDirty && !$v.newParticular.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newParticular.$anyDirty && !$v.newParticular.alphaNumCustomValidator">Field Required</i>
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
					<base-input v-model="newAmount"
						id="inputStyle"
						type="text"
						placeholder="Amount"></base-input>
					<i class="text-red"
						v-if="$v.newAmount.$anyDirty && !$v.newAmount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newAmount.$anyDirty && !$v.newAmount.amountCustomValidator">Field Required</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addReimItem()"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('new-reim-item-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- UPDATE REIMBURSEMENT ITEM MODAL -->
		<b-modal size="lg"
			id="update-reim-item-modal"
			title="Edit Reimbursement Item" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Item:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editItem.date"
						type="date"
						id="inputStyle"
						:max="processMaxDate"></base-input>
					<i class="text-red"
						v-if="$v.editItem.$anyDirty && !$v.editItem.date.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editItem.particular"
						id="inputStyle"
						type="text"
						placeholder="Item"></base-input>
					<i class="text-red"
						v-if="$v.editItem.$anyDirty && !$v.editItem.particular.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editItem.$anyDirty && !$v.editItem.particular.alphaNumCustomValidator">Field Required</i>
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
					<base-input v-model="editItem.amount"
						id="inputStyle"
						type="text"
						placeholder="Amount"></base-input>
					<i class="text-red"
						v-if="$v.editItem.$anyDirty && !$v.editItem.amount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editItem.$anyDirty && !$v.editItem.amount.amountCustomValidator">Field Required</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="updateReimItem()"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Update
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('update-reim-item-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- ADD TRANSPORTATION REIMBURSEMENT MODAL -->
		<b-modal size="lg"
			id="new-trans-reim-modal"
			title="New Transportation Reimbursement" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Mode of Transportation:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newTransDate"
						type="date"
						id="inputStyle"
						:max="processMaxDate"></base-input>
					<i class="text-red"
						v-if="$v.newTransDate.$anyDirty && !$v.newTransDate.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newMode"
						id="inputStyle"
						type="text"
						placeholder="Mode of Transportation"></base-input>
					<i class="text-red"
						v-if="$v.newMode.$anyDirty && !$v.newMode.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newMode.$anyDirty && !$v.newMode.alphaNumCustomValidator">Field Required</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>From:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>To:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<textarea rows="4"
						cols="39"
						v-model="newFrom"
						id="inputStyle"
						placeholder="From"></textarea>
					<i class="text-red"
						v-if="$v.newFrom.$anyDirty && !$v.newFrom.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newFrom.$anyDirty && !$v.newFrom.alphaNumCustomValidator">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<textarea rows="4"
						cols="39"
						v-model="newTo"
						id="inputStyle"
						placeholder="To"></textarea>
					<i class="text-red"
						v-if="$v.newTo.$anyDirty && !$v.newTo.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newTo.$anyDirty && !$v.newTo.alphaNumCustomValidator">Field Required</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Purpose:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Amount:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<textarea rows="4"
						cols="39"
						v-model="newPurpose"
						id="inputStyle"
						placeholder="Purpose"></textarea>
					<i class="text-red"
						v-if="$v.newPurpose.$anyDirty && !$v.newPurpose.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newPurpose.$anyDirty && !$v.newPurpose.alphaNumCustomValidator">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="newTransAmount"
						id="inputStyle"
						type="text"
						placeholder="Amount"></base-input>
					<i class="text-red"
						v-if="$v.newTransAmount.$anyDirty && !$v.newTransAmount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.newTransAmount.$anyDirty && !$v.newTransAmount.alphaNumCustomValidator">Field Required</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addTransReim"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('new-trans-reim-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- UPDATE TRANSPORTATION REIMBURSEMENT MODAL -->
		<b-modal
			size="lg"
			id="update-trans-reim-modal"
			title="Edit Transportation Reimbursement" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Mode of Transportation:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editTrans.date"
						type="date"
						id="inputStyle"
						:max="processMaxDate"></base-input>
					<i class="text-red"
						v-if="$v.editTrans.$anyDirty && !$v.editTrans.date.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editTrans.mode"
						id="inputStyle"
						type="text"
						placeholder="Mode of Transportation"></base-input>
					<i class="text-red"
						v-if="$v.editTrans.$anyDirty && !$v.editTrans.mode.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editTrans.$anyDirty && !$v.editTrans.mode.alphaNumCustomValidator">Field Required</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>From:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>To:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<textarea rows="4"
						cols="39"
						v-model="editTrans.from"
						id="inputStyle"
						placeholder="From"></textarea>
					<i class="text-red"
						v-if="$v.editTrans.$anyDirty && !$v.editTrans.from.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editTrans.$anyDirty && !$v.editTrans.from.alphaNumCustomValidator">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<textarea rows="4"
						cols="39"
						v-model="editTrans.to"
						id="inputStyle"
						placeholder="To"></textarea>
					<i class="text-red"
						v-if="$v.editTrans.$anyDirty && !$v.editTrans.to.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editTrans.$anyDirty && !$v.editTrans.to.alphaNumCustomValidator">Field Required</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Purpose:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Amount:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<textarea rows="4"
						cols="39"
						v-model="editTrans.purpose"
						id="inputStyle"
						placeholder="Purpose"></textarea>
					<i class="text-red"
						v-if="$v.editTrans.$anyDirty && !$v.editTrans.purpose.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editTrans.$anyDirty && !$v.editTrans.purpose.alphaNumCustomValidator">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editTrans.amount"
						id="inputStyle"
						type="text"
						placeholder="Amount"></base-input>
					<i class="text-red"
						v-if="$v.editTrans.$anyDirty && !$v.editTrans.amount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editTrans.$anyDirty && !$v.editTrans.amount.alphaNumCustomValidator">Field Required</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="updateTransReim"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Update
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('update-trans-reim-modal')"
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

	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ,. ]*$/);
	const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
	const itemColumns = ["#", "Date", "Particular", "Amount", "Description", "Actions"];
	const transColumns = ["#", "Date", "Mode", "From", "To", "Purpose", "Amount", "Actions"];
	const moment  = require('moment');
	const today = new Date();
	const addZero = require('add-zero');
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');

	export default {
		name: "new-reimbursement-user",
		components: {},
		data() {
			return {
				// New reimbursement
				departments: [],
				names: [],
				companies: [],
				descriptions: [],
				items: [],
				reimItems: [],
				trans: [],
				transReims: [],
				newCompany: '',
				newProcessDate: '',
				newMonthOf: '',
				requestProcessing: false,
				desc: '',
				newDesc: '',
				newDate: moment().format("YYYY-MM-DD"),
				newParticular: '',
				newAmount: '',
				newTransDate: moment().format("YYYY-MM-DD"),
				processMaxDate: moment().format("YYYY-MM-DD"),
				newMode: '',
				newFrom: '',
				newTo: '',
				newPurpose: '',
				newTransAmount: '',
				loading: true,
				loadError: false,
				reimItemsTable: {
					title: "Reimbursement Items Table",
					subTitle: "",
					columns: [...itemColumns]
				},
				reimItemsCount: 0,
				currentPage: 1,
				transReimsTable: {
					title: "Transportation Reimbursement Table",
					subTitle: "",
					columns: [...transColumns]
				},
				transReimsCount: 0,
				currentTransPage: 1,
				editItem: {
					id: '',
					date: '',
					particular: '',
					amount: ''
				},
				editTrans: {
					id: '',
					date: '',
					mode: '',
					from: '',
					on: '',
					purpose: '',
					amount: ''
				},
				totalItems: '0.00',
				totalTrans: '0.00',
				totalAmount: '0.00'
			};
		},
		validations: {
			// New reimbursement validations
			newDepartment: {required},
			newName: {required},
			newProcessDate: {required},
			newMonthOf: {required},
			desc: {required},
			newDesc: {
				alphaNumCustomValidator,
				required
			},
			newDate: {required},
			newParticular: {
				alphaNumCustomValidator,
				required
			},
			newAmount: {
				amountCustomValidator,
				required
			},
			newTransDate: {required},
			newMode: {
				alphaNumCustomValidator,
				required
			},
			newFrom: {
				alphaNumCustomValidator,
				required
			},
			newTo: {
				alphaNumCustomValidator,
				required
			},
			newPurpose: {
				alphaNumCustomValidator,
				required
			},
			newTransAmount: {
				alphaNumCustomValidator,
				required
			},
			editItem: {
				date: {required},
				particular: {
					alphaNumCustomValidator,
					required
				},
				amount: {
					amountCustomValidator,
					required
				}
			},
			editTrans: {
				date: {required},
				mode: {
					alphaNumCustomValidator,
					required
				},
				from: {
					alphaNumCustomValidator,
					required
				},
				to: {
					alphaNumCustomValidator,
					required
				},
				purpose: {
					alphaNumCustomValidator,
					required
				},
				amount: {
					alphaNumCustomValidator,
					required
				}
			}
		},
		async mounted(){
			this.getDepartments();
			this.getNames();
			this.getCompanies();
			this.getDescriptions();
			this.getReimItems(1);
			this.getTransReim(1);
			this.getTotalAmount();
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
				});
			},
			// Get employee name
			getNames(){
				let self = this;
				let nameData = dbUsers.collection("users")
					.orderBy("lastname", "asc");

				self.names = [];
				nameData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.names.push(doc.data());
					});
					for(let a = 0; a < self.names.length; a++){
						self.names[a]["name"] = self.names[a].lastname + ', ' + self.names[a].firstname;
					}
					self.newName = self.names[0].userId;
				});
			},
			// Get company details
			getCompanies(){
				let self = this;
				let companyData = dbMains.collection("companies")
					.orderBy("companyName", "asc");

				self.companies = [];
				companyData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.companies.push(doc.data());
					});
				});
			},
			// Get reimbursement description details
			getDescriptions(){
				let self = this;
				let descData = dbMains.collection("reimbursementDescriptions")
					.where("status","==",1)
					.orderBy("description", "asc");

				self.descriptions = [];
				descData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.descriptions.push(doc.data());
					});
					self.desc = self.descriptions[0].reimbursementDescId;
				});
			},
			// Add new reimbursement description
			addReimDesc(){
				let self = this;

				self.requestProcessing = false;
				self.$v.newDesc.$touch();
				if(!self.$v.newDesc.$error){
					let descData = null;

					self.requestProcessing = true;
					descData = dbMains.collection('reimbursementDescriptions')
						.where("description", "==", upperCase(self.newDesc));
					descData.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) => {
								if(doc.exists){
									self.$swal({
										title: 'Invalid',
										text: 'Reimbursement description already exists.',
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
							let dataId = 'RDI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

							getUserId.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									if(doc.exists){
										users.push(doc.data());
									}
								});
								try{
									dbMains.collection('reimbursementDescriptions').doc()
									.set({
										reimbursementDescId: dataId,
										description: upperCase(self.newDesc),
										userReference: users[0].userId,
										status: 1,
										dateCreated: today,
										dateModified: today
									}).then(() => {
										self.newDesc = '';
										self.requestProcessing = false;
										self.$v.newDesc.$reset();
										self.$bvModal.hide('new-reim-desc-modal');
										self.getDescriptions();
										self.$swal({
											title: 'Success',
											text: 'New reimbursement description added successfully!',
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
			// Show add reimbursement item form
			openReimItemModal(desc){
				let descData = dbMains.collection("reimbursementDescriptions")
					.where("reimbursementDescId", "==", desc);
				let descs = [];

				descData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						descs.push(doc.data());
					});
					if(descs[0].description == "TRANSPORTATION" || descs[0].description == "TRANSPORTATIONS"){
						this.$bvModal.show('new-trans-reim-modal');
					}else{
						this.$bvModal.show('new-reim-item-modal');
					}
				});
			},
			// Add new reimbursement item details
			addReimItem(){
				let self = this;

				self.$v.newDate.$touch();
				self.$v.newParticular.$touch();
				self.$v.newAmount.$touch();
				if(!self.$v.newDate.$error && !self.$v.newParticular.$error && !self.$v.newAmount.$error){

					self.requestProcessing = true;
					if(self.items.length == 0){
						self.items = [];
					}
					let newItem = {
						"rowNum": self.items.length + 1,
						"date": self.newDate,
						"particular": self.newParticular,
						"amount": format(parseFloat(self.newAmount).toFixed(2)),
						"desc": self.desc
					}

					self.items.push(newItem);
					self.$swal({
						title: 'Success',
						text: 'New item added successfully!',
						icon: 'success',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.newDate = moment().format("YYYY-MM-DD");
						self.newParticular = '';
						self.newAmount = '';
						self.$v.newDate.$reset();
						self.$v.newParticular.$reset();
						self.$v.newAmount.$reset();
						self.$bvModal.hide('new-reim-item-modal');
						self.getReimItems(1);
					});
					self.requestProcessing = false;
				}
			},
			// Add new reimbursement transportation details
			addTransReim(){
				let self = this;

				self.$v.newTransDate.$touch();
				self.$v.newMode.$touch();
				self.$v.newFrom.$touch();
				self.$v.newTo.$touch();
				self.$v.newPurpose.$touch();
				self.$v.newTransAmount.$touch();
				if(!self.$v.newTransDate.$error && !self.$v.newMode.$error && !self.$v.newFrom.$error && !self.$v.newTo.$error && !self.$v.newPurpose.$error && !self.$v.newTransAmount.$error){
					self.requestProcessing = true;
					if(self.trans.length == 0){
						self.trans = [];
					}
					let newTrans = {
						"rowNum": self.trans.length + 1,
						"date": self.newTransDate,
						"mode": self.newMode,
						"from": self.newFrom,
						"to": self.newTo,
						"purpose": self.newPurpose,
						"amount": format(parseFloat(self.newTransAmount).toFixed(2)),
						"desc": self.desc
					}

					self.trans.push(newTrans);
					self.$swal({
						title: 'Success',
						text: 'New item added successfully!',
						icon: 'success',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.newTransDate = moment().format("YYYY-MM-DD");
						self.newMode = '';
						self.newFrom = '';
						self.newTo = '';
						self.newPurpose = '';
						self.newTransAmount = '';
						self.$v.newTransDate.$reset();
						self.$v.newMode.$reset();
						self.$v.newFrom.$reset();
						self.$v.newTo.$reset();
						self.$v.newPurpose.$reset();
						self.$v.newTransAmount.$reset();
						self.$bvModal.hide('new-trans-reim-modal');
						self.getTransReim(1);
					});
					self.requestProcessing = false;
				}
			},
			// Display reimbursement item details on table
			getReimItems(page){
				let self = this;
				let firstRow = (page - 1) * 10;
				let lastRow = (page * 10);
				let amount = 0;

				self.reimItems = [];
				for(let a = firstRow; a < lastRow; a++){
					if(self.items[a]){
						self.reimItems.push(self.items[a]);
					}
				}
				for(let b = 0; b < self.items.length; b++){
					amount += parseFloat(self.items[b].amount.replaceAll(",",""));
				}
				self.totalItems = format(parseFloat(amount).toFixed(2));
				self.reimItemsCount = self.items.length;
				self.currentPage = page;
				self.getTotalAmount();
			},
			// Reimbursement item table page change
			onPageChange(page) {
				this.getReimItems(page);
			},
			// Display reimbursement transportation details on table
			getTransReim(page){
				let self = this;
				let firstRow = (page - 1) * 10;
				let lastRow = (page * 10);
				let amount = 0;

				self.transReims = [];
				for(let a = firstRow; a < lastRow; a++){
					if(self.trans[a]){
						self.transReims.push(self.trans[a]);
					}
				}
				for(let b = 0; b < self.trans.length; b++){
					amount += parseFloat(self.trans[b].amount.replaceAll(",",""));
				}
				self.totalTrans = format(parseFloat(amount).toFixed(2));
				self.transReimsCount = self.trans.length;
				self.currentTransPage = page;
				self.getTotalAmount();
			},
			// Reimbursement transportation table page change
			onTransPageChange(page) {
				this.getTransReim(page);
			},
			// Show edit reimbursement item form
			openUpdateItemModal(row){
				this.editItem = {
					id: row.rowNum,
					date: row.date,
					particular: row.particular,
					amount: row.amount
				}
				this.$bvModal.show('update-reim-item-modal');
			},
			// Change reimbursement item details
			updateReimItem(){
				let self = this;

				self.$v.editItem.$touch();
				if(!self.$v.editItem.$error){
					self.requestProcessing = false;
					let index = parseInt(self.editItem.id) - 1;

					self.items[index].date = self.editItem.date;
					self.items[index].particular = self.editItem.particular;
					self.items[index].amount = self.editItem.amount;
					self.$swal({
						title: 'Success',
						text: 'Item updated successfully!',
						icon: 'success',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.$v.editItem.$reset();
						self.$bvModal.hide('update-reim-item-modal');
						self.getReimItems(1);
					});
					self.requestProcessing = false;
				}
			},
			// Delete reimbursement item details
			removeItem(row){
				let self = this;
				self.$swal({
					title: 'Are you sure?',
					text: "You want to remove this reimbursement item",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#C72111',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						let num = parseInt(row.rowNum) - 1;

						self.items.splice(num, 1);
						self.$swal({
							title: 'Success',
							text: 'Item removed successfully!',
							icon: 'success',
							confirmButtonColor: '#b80000',
							confirmButtonText: 'OK'
						}).then(() => {
							for(let a = 0; a < self.items.length; a++){
								self.items[a].rowNum = a + 1;
							}
							self.getReimItems(1);
						});
					}
				});
			},
			// Show edit reimbursement transportation details
			openUpdateTransModal(row){
				this.editTrans = {
					id: row.rowNum,
					date: row.date,
					mode: row.mode,
					from: row.from,
					to: row.to,
					purpose: row.purpose,
					amount: row.amount
				}
				this.$bvModal.show('update-trans-reim-modal');
			},
			// Change reimbursement transportation details
			updateTransReim(){
				let self = this;

				self.$v.editTrans.$touch();
				if(!self.$v.editTrans.$error){
					self.requestProcessing = false;
					let index = parseInt(self.editTrans.id) - 1;

					self.trans[index].date = self.editTrans.date;
					self.trans[index].mode = self.editTrans.mode;
					self.trans[index].from = self.editTrans.from;
					self.trans[index].to = self.editTrans.to;
					self.trans[index].purpose = self.editTrans.purpose;
					self.trans[index].amount = self.editTrans.amount;
					self.$swal({
						title: 'Success',
						text: 'Transportation updated successfully!',
						icon: 'success',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.$v.editItem.$reset();
						self.$bvModal.hide('update-trans-reim-modal');
						self.getTransReim(1);
					});
					self.requestProcessing = false;
				}
			},
			// Delete reimbursement transportation details
			removeTrans(row){
				let self = this;
				self.$swal({
					title: 'Are you sure?',
					text: "You want to remove this transportation",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#C72111',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						let num = parseInt(row.rowNum) - 1;

						self.trans.splice(num, 1);
						self.$swal({
							title: 'Success',
							text: 'Transportation removed successfully!',
							icon: 'success',
							confirmButtonColor: '#b80000',
							confirmButtonText: 'OK'
						}).then(() => {
							for(let a = 0; a < self.trans.length; a++){
								self.trans[a].rowNum = a + 1;
							}
							self.getTransReim(1);
							self.getTotalAmount();
						});
					}
				});
			},
			// Compute reimbursement total amount
			getTotalAmount(){
				let self = this;
				let total = 0;
				let tItems = self.totalItems.replaceAll(",","");
				let tTrans = self.totalTrans.replaceAll(",","");

				total = parseFloat(tItems) + parseFloat(tTrans);
				self.totalAmount = format(parseFloat(total).toFixed(2));
			},
			// Save new reimbursement details
			addReimbursement(){
				let self = this;

				self.$v.newDepartment.$touch();
				self.$v.newName.$touch();
				if(!self.$v.newDepartment.$error && !self.$v.newName.$error){
					self.requestProcessing = true;
					let voucher = dbExpense.collection("reimbursements")
						.orderBy("voucherDate","desc");
					let getUserId = dbUsers.collection("users")
						.where("username","==",localStorage.getItem("aisname"));
					let users = [], voucherSeries = [];

					voucher.limit(1).get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							if(doc.exists){
								voucherSeries.push(doc.data());
							}
						});
						let lastVoucher = '';

						getUserId.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								users.push(doc.data());
							});
							let genVoucherNo = new Date();
							let dataId = 'RI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

							if(voucherSeries.length != 0){
								lastVoucher = addZero(parseInt(voucherSeries[0].voucherNumber.slice(7)) + 1, 5);
								if(lastVoucher.toString() == '100000'){
									lastVoucher = '00001';
								}
							}else{
								lastVoucher = '00001';
							}
							dbExpense.collection("reimbursements").doc()
							.set({
								reimbursementId: dataId,
								processDate: self.newProcessDate,
								monthOf: self.newMonthOf,
								totalAmount: self.totalAmount,
								voucherDate: genVoucherNo,
								voucherNumber: addZero(genVoucherNo.getMonth() + 1) + '' + (genVoucherNo.getFullYear().toString()).slice(2,4) + '' + lastVoucher,
								receivedDate: '',
								remarks: '',
								checkReference: '',
								companyReference: self.newCompany,
								departmentReference: users[0].departmentReference,
								nameReference: users[0].userId,
								status: 1,
								userReference: users[0].userId,
								dateCreated: today,
								dateModified: today
							}).then(() => {
								if(self.items.length != 0){
									for(let a = 0; a < self.items.length; a++){
										let rIID = 'RII-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

										dbExpense.collection("reimbursementItems").doc()
										.set({
											reimburseItemId: rIID,
											date: self.items[a].date,
											amount: self.items[a].amount,
											particular: self.items[a].particular,
											reimbursementReference: dataId,
											descriptionReference: self.items[a].desc,
											status: 1,
											userReference: users[0].userId,
											dateCreated: today,
											dateModified: today
										});
									}
								}
								if(self.trans.length != 0){
									for(let b = 0; b < self.trans.length; b++){
										let rTID ="RTI-" + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

										dbExpense.collection("reimbursementItems").doc()
										.set({
											reimburseItemId: rTID,
											date: self.trans[b].date,
											amount: self.trans[b].amount,
											from: self.trans[b].from,
											to: self.trans[b].to,
											transportationMode: self.trans[b].mode,
											purpose: self.trans[b].purpose,
											reimbursementReference: dataId,
											descriptionReference: self.trans[b].desc,
											status: 1,
											userReference: users[0].userId,
											dateCreated: today,
											dateModified: today
										});
									}
								}
								self.newDepartment = "";
								self.newName = "";
								self.newProcessDate = moment().format("YYYY-MM-DD");
								self.newMonthOf = moment().format("YYYY-MM");
								self.items = [];
								self.trans = [];
								self.$v.newDepartment.$reset();
								self.$v.newName.$reset();
								self.requestProcessing = false;
								self.$swal({
									title: 'Success',
									text: 'New Reimbursement added successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'})
								.then(() => {
									self.$router.push("/view/reimbursement/" + dataId);
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