<template>
	<div id="textStyle"> 
		<base-header class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-12 container-fluid mt--7">
			<!-- E transaction details -->
			<card>
				<div class="row pl-4">
					<span class="col-sm-12">
						<b>{{etrans.eWallet}}</b>
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Account Number: </b>{{etrans.eWalletAccountNumber}}
					</span>
					<span class="col-sm-6">
						<b>Account Name: </b>{{etrans.eWalletAccountName}}
					</span>
				</div>
				<hr>
				<div class="row pl-4 pt-2">
					<span class="col-sm-12">
						<b>Payee:</b> {{etrans.payee}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Voucher No.:</b> {{etrans.voucherNumber}}
					</span>
					<span class="col-sm-6">
						<b>Voucher Date:</b> {{etrans.voucherDate}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Transaction No.:</b> {{etrans.transactionNumber}}
					</span>
					<span class="col-sm-6">
						<b>Transaction Date:</b> {{etrans.transactionDate | moment("MMMM DD, YYYY")}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Amount Total:</b> ₱ {{etrans.totalAmount}}
					</span>
					<span class="col-sm-6">
						<b>Payee Account No.:</b> {{etrans.payeeAccountNumber}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Created by: </b>
						<span v-for="user in users"
							v-bind:key="user.userId">
							<span v-if="user.userId == etrans.userReference">{{ user.firstname }} {{ user.lastname }}</span>
							<span v-else-if="etrans.userReference == ''">----------</span>
						</span>
					</span>
				</div>
				<hr class="mb-1">
				<div class="text-left pl-2">
					<h2 class="display-5"
						id="sideBarTxt">Particulars</h2>
				</div>       
				<div class="table-full-width pt-2">
					<vue-good-table :columns="columns"
						:rows="particulars"
						:search-options="{enabled: true}"
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
								<span>₱ {{props.row.amount}}</span>
							</span>
							<span v-if="props.column.field == 'action'">
								<span class="pointer ml-2 fa fa-file"
									id="sideBarTxt"
									v-on:click="openAttachments(props.row)"
									title="Attachment"></span>
								<span class="pointer ml-2 far fa-edit"
									id="sideBarTxt"
									v-on:click="openUpdateParticularModal(props.row)"
									title="Update"></span>
								<span class="pointer ml-2 far fa-times-circle"
									id="sideBarTxt"
									v-on:click="removeParticular(props.row)"
									title="Remove"></span>
							</span></b>
						</template>
					</vue-good-table>
				</div>
				<hr class="mt-2 mb-2">
				<div class="row pl-4">
					<div class="col-3">
						<base-button @click.native="openUpdateETransactionModal(etrans)"
							id="darkBtn"
							block>Update</base-button>
					</div>
					<div class="col-3">
						<base-button @click.native="$bvModal.show('add-particular-modal')"
							id="darkBtn"
							block>Add Particular</base-button>
					</div>
					<div class="col-3">
						<base-button @click.native="printETransaction()"
							id="darkBtn"
							block>Print</base-button>
					</div>
					<div class="col-3">
						<base-button @click.native="closeETransaction"
							id="darkBtn"
							block>Close</base-button>
					</div>
				</div>
			</card>
			<!-- E transaction single print view -->
			<card class="pl-4 pt-5 pb-5"
				id="viewSummary">
				<div class="row">
					<span class="col-sm-12">
						<b>{{etrans.eWallet}}</b>
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Account Number: </b>{{etrans.eWalletAccountNumber}}
					</span>
					<span class="col-sm-6">
						<b>Account Name: </b>{{etrans.eWalletAccountName}}
					</span>
				</div>
				<hr>
				<div class="row">
					<span class="col-sm-12">
						<b>Payee:</b> {{etrans.payee}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Voucher No.:</b> {{etrans.voucherNumber}}
					</span>
					<span class="col-sm-6">
						<b>Voucher Date:</b> {{etrans.voucherDate}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Transaction No.:</b> {{etrans.transactionNumber}}
					</span>
					<span class="col-sm-6">
						<b>Transaction Date:</b> {{etrans.transactionDate | moment("MMMM DD, YYYY")}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Amount Total:</b> ₱ {{etrans.totalAmount}}
					</span>
					<span class="col-sm-6">
						<b>Payee Account No.:</b> {{etrans.payeeAccountNumber}}
					</span>
				</div>
				<hr>
				<div class="row pb-2"
					id="particularStyle">
					<span class="col-sm-4">
						<b>PARTICULAR</b>
					</span>
					<span class="col-sm-2">
						<b>QTY</b>
					</span>
					<span class="col-sm-2">
						<b>PRICE</b>
					</span>
					<span class="col-sm-2">
						<b>REF. NO.</b>
					</span>
					<span class="col-sm-2">
						<b>AMOUNT</b>
					</span>
				</div>
				<div class="row"
					v-for="particular in particulars"
					v-bind:key="particular.eTransactionParticularId"
					id="particularStyle">
					<span class="col-sm-4"
						id="docStyle">{{particular.particular}}</span>
					<span class="col-sm-2"
						id="docStyle">{{particular.quantity}}</span>
					<span class="col-sm-2"
						id="docStyle">₱ {{particular.unitPrice}}</span>
					<span class="col-sm-2"
						id="docStyle">{{particular.referenceNumber}}</span>
					<span class="col-sm-2"
						id="docStyle">₱ {{particular.amount}}</span>
				</div>
				<hr/>
				<div class="row">
					<span class="col-sm-5">
						<b>Received Payment by : </b> {{eTransactionSignatory.receivedPayment}}
					</span>
					<span class="col-sm-1"></span>
					<span class="col-sm-5">
						<b>Prepared by :</b> {{eTransactionSignatory.prepared || user.firstname + ' ' + user.lastname}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-5">
						<b>Certified by : </b> {{eTransactionSignatory.certified}}
					</span>
					<span class="col-sm-1"></span>
					<span class="col-sm-5">
						<b>Approved by : </b> {{eTransactionSignatory.approved}}
					</span>
				</div>
			</card>
			<!-- E transaction duplicate print view -->
			<div class="col-12"
				id="duplicateView">
				<div class="row">
					<span class="col-sm-12">
						<b>{{etrans.eWallet}}</b>
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Account Number: </b>{{etrans.eWalletAccountNumber}}
					</span>
					<span class="col-sm-6">
						<b>Account Name: </b>{{etrans.eWalletAccountName}}
					</span>
				</div>
				<hr>
				<div class="row">
					<span class="col-sm-12">
						<b>Payee:</b> {{etrans.payee}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Voucher No.:</b> {{etrans.voucherNumber}}
					</span>
					<span class="col-sm-6">
						<b>Voucher Date:</b> {{etrans.voucherDate}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Transaction No.:</b> {{etrans.transactionNumber}}
					</span>
					<span class="col-sm-6">
						<b>Transaction Date:</b> {{etrans.transactionDate | moment("MMMM DD, YYYY")}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Amount Total:</b> ₱ {{etrans.totalAmount}}
					</span>
					<span class="col-sm-6">
						<b>Payee Account No.:</b> {{etrans.payeeAccountNumber}}
					</span>
				</div>
				<hr>
				<div class="row pb-2"
					id="particularStyle">
					<span class="col-sm-4">
						<b>PARTICULAR</b>
					</span>
					<span class="col-sm-2">
						<b>QTY</b>
					</span>
					<span class="col-sm-2">
						<b>PRICE</b>
					</span>
					<span class="col-sm-2">
						<b>REF. NO.</b>
					</span>
					<span class="col-sm-2">
						<b>AMOUNT</b>
					</span>
				</div>
				<div class="row"
					v-for="particular in particulars"
					v-bind:key="particular.eTransactionParticularId">
					<span class="col-sm-4"
						id="docStyle">{{particular.particular}}</span>
					<span class="col-sm-2"
						id="docStyle">{{particular.quantity}}</span>
					<span class="col-sm-2"
						id="docStyle">₱ {{particular.unitPrice}}</span>
					<span class="col-sm-2"
						id="docStyle">{{particular.referenceNumber}}</span>
					<span class="col-sm-2"
						id="docStyle">₱ {{particular.amount}}</span>
				</div>
				<hr/>
				<div class="row">
					<span class="col-sm-5">
						<b>Received Payment by : </b> {{eTransactionSignatory.receivedPayment}}
					</span>
					<span class="col-sm-1"></span>
					<span class="col-sm-5">
						<b>Prepared by :</b> {{eTransactionSignatory.prepared || user.firstname + ' ' + user.lastname}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-5">
						<b>Certified by : </b> {{eTransactionSignatory.certified}}
					</span>
					<span class="col-sm-1"></span>
					<span class="col-sm-5">
						<b>Approved by : </b> {{eTransactionSignatory.approved}}
					</span>
				</div>
				<br>
				<span v-for="index in breakCounts" :key="index"><br></span>
				<br>
				<div class="row">
					<span class="col-sm-12">
						<b>{{etrans.eWallet}}</b>
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Account Number: </b>{{etrans.eWalletAccountNumber}}
					</span>
					<span class="col-sm-6">
						<b>Account Name: </b>{{etrans.eWalletAccountName}}
					</span>
				</div>
				<hr>
				<div class="row">
					<span class="col-sm-12">
						<b>Payee:</b> {{etrans.payee}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Voucher No.:</b> {{etrans.voucherNumber}}
					</span>
					<span class="col-sm-6">
						<b>Voucher Date:</b> {{etrans.voucherDate}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Transaction No.:</b> {{etrans.transactionNumber}}
					</span>
					<span class="col-sm-6">
						<b>Transaction Date:</b> {{etrans.transactionDate | moment("MMMM DD, YYYY")}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-6">
						<b>Amount Total:</b> ₱ {{etrans.totalAmount}}
					</span>
					<span class="col-sm-6">
						<b>Payee Account No.:</b> {{etrans.payeeAccountNumber}}
					</span>
				</div>
				<hr>
				<div class="row pb-2"
					id="particularStyle">
					<span class="col-sm-4">
						<b>PARTICULAR</b>
					</span>
					<span class="col-sm-2">
						<b>QTY</b>
					</span>
					<span class="col-sm-2">
						<b>PRICE</b>
					</span>
					<span class="col-sm-2">
						<b>REF. NO.</b>
					</span>
					<span class="col-sm-2">
						<b>AMOUNT</b>
					</span>
				</div>
				<div class="row"
					v-for="particular in particulars"
					v-bind:key="particular.eTransactionParticularId"
					id="particularStyle">
					<span class="col-sm-4"
						id="docStyle">{{particular.particular}}</span>
					<span class="col-sm-2"
						id="docStyle">{{particular.quantity}}</span>
					<span class="col-sm-2"
						id="docStyle">₱ {{particular.unitPrice}}</span>
					<span class="col-sm-2"
						id="docStyle">{{particular.referenceNumber}}</span>
					<span class="col-sm-2"
						id="docStyle">₱ {{particular.amount}}</span>
				</div>
				<hr/>
				<div class="row">
					<span class="col-sm-5">
						<b>Received Payment by : </b> {{eTransactionSignatory.receivedPayment}}
					</span>
					<span class="col-sm-1"></span>
					<span class="col-sm-5">
						<b>Prepared by :</b> {{eTransactionSignatory.prepared || user.firstname + ' ' + user.lastname}}
					</span>
				</div>
				<div class="row">
					<span class="col-sm-5">
						<b>Certified by : </b> {{eTransactionSignatory.certified}}
					</span>
					<span class="col-sm-1"></span>
					<span class="col-sm-5">
						<b>Approved by : </b> {{eTransactionSignatory.approved}}
					</span>
				</div>
			</div>
			<!-- UPDATE MODAL -->
			<b-modal size="xl"
				id="update-modal"
				title="Edit E Transactions"
				centered
				:hide-header-close="true"
				:no-close-on-backdrop="true"
				:no-close-on-esc="true">
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
					<div class="col-sm-6 pl-5 pr-5">
						<v-select id="inputStyle"
							:options="eWallets"
							:reduce="ew => ew.eWalletId"
							label="eWalletName"
							v-model="edit.eWallet"
							:clearable="false"
							@input="getEWalletAccounts(edit.eWallet)"></v-select>
						<i class="text-red"
							v-if="$v.edit.eWallet.$anyDirty && !$v.edit.eWallet.required">Field Required</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5"
						v-if="ewAccounts.length > 0">
						<v-select id="inputStyle"
							:options="ewAccounts"
							:reduce="ewa => ewa.eWalletAccountId"
							label="eWalletAccountNumber"
							v-model="edit.ewAccount"
							:clearable="false"></v-select>
						<i class="text-red"
							v-if="$v.edit.ewAccount.$anyDirty && !$v.edit.ewAccount.required">Field Required</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5"
						v-if="ewAccounts.length <= 0">
						<span class="text-red">No Account</span>
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
						<base-input v-model="edit.payee"
							type="text"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.payee.$anyDirty && !$v.edit.payee.required">Field Required</i>
						<i class="text-red"
							v-if="$v.edit.payee.$anyDirty && !$v.edit.payee.alphaNumCustomValidator">Field Required</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="edit.payeeAccount"
							type="text"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.payeeAccount.$anyDirty && !$v.edit.payeeAccount.required">Field Required</i>
						<i class="text-red"
							v-if="$v.edit.payeeAccount.$anyDirty && !$v.edit.payeeAccount.alphaNumCustomValidator">Field Required</i>
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
						<base-input v-model="edit.transactionNumber"
							type="text"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.transactionNumber.$anyDirty && !$v.edit.transactionNumber.alphaNumCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-6">
						<base-input v-model="edit.transactionDate"
							type="date"
							id="inputStyle"></base-input>
						<i class="text-red"
							v-if="$v.edit.transactionDate.$anyDirty && !$v.edit.transactionDate.required">Field Required</i>
					</div>
				</div>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="updateETransaction()"
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
							@input="computeAmount(newQuantity, newUnitPrice, 'add')"></base-input>
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
							@input="computeAmount(newQuantity, newUnitPrice, 'add')"></base-input>
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
			<!-- EDIT PARTICULAR MODAL -->
			<b-modal size="lg"
				id="edit-particular-modal"
				title="Edit Particular" centered
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
						<base-input v-model="editP.particular"
							type="text"
							id="inputStyle"
							placeholder="Particular"></base-input>
						<i class="text-red"
							v-if="$v.editP.particular.$anyDirty && !$v.editP.particular.required">Field Required</i>
						<i class="text-red"
							v-if="$v.editP.particular.$anyDirty && !$v.editP.particular.alphaNumCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="editP.quantity"
							type="text"
							id="inputStyle"
							placeholder="Quantity"
							@input="computeAmount(editP.quantity, editP.unitPrice, 'edit')"></base-input>
						<i class="text-red"
							v-if="$v.editP.quantity.$anyDirty && !$v.editP.quantity.required">Field Required</i>
						<i class="text-red"
							v-if="$v.editP.quantity.$anyDirty && !$v.editP.quantity.numCustomValidator">Invalid Characters</i>
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
						<base-input v-model="editP.unitPrice"
							type="text"
							id="inputStyle"
							placeholder="Unit Price"
							@input="computeAmount(editP.quantity, editP.unitPrice, 'edit')"></base-input>
						<i class="text-red"
							v-if="$v.editP.unitPrice.$anyDirty && !$v.editP.unitPrice.required">Field Required</i>
						<i class="text-red"
							v-if="$v.editP.unitPrice.$anyDirty && !$v.editP.unitPrice.amountCustomValidator">Invalid Characters</i>
					</div>
					<div class="col-sm-6 pl-5 pr-5">
						<base-input v-model="editP.referenceNumber"
							type="text"
							id="inputStyle"
							placeholder="Reference Number"></base-input>
						<i class="text-red"
							v-if="$v.editP.referenceNumber.$anyDirty && !$v.editP.referenceNumber.refNumCustomValidator">Invalid Characters</i>
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
						<base-input v-model="editP.amount"
							type="text"
							id="inputStyle"
							placeholder="Amount" disabled></base-input>
						<i class="text-red"
							v-if="$v.editP.amount.$anyDirty && !$v.editP.amount.required">Field Required</i>
						<i class="text-red"
							v-if="$v.editP.amount.$anyDirty && !$v.editP.amount.amountCustomValidator">Invalid Characters</i>
					</div>
				</div>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="updateParticular"
								:disabled="requestProcessing">
								<i v-if="requestProcessing"
									class="fa fa-spinner fa-spin"></i>
								Update
							</base-button>
							<base-button id="darkInlineBtn"
								@click.native="$bvModal.hide('edit-particular-modal')"
								:disabled="requestProcessing">Close</base-button>
						</div>
					</div>
				</template>
			</b-modal>
			<!-- ATTACHMENT MODAL -->
			<b-modal size="lg"
				id="attachment-modal"
				title="Attachments" centered
				:hide-header-close="true"
				:no-close-on-backdrop="true"
				:no-close-on-esc="true">
				<input type="file"
					ref="attachmentFile"
					style="display: none"
					@change="previewImage"
					accept="image/*">
				<div class="text-center" v-if="uploadValue < 100 && attachments.length > 0">
					<b-spinner variant="danger" type="grow" label="Spinning" class="ml-2"></b-spinner>
					<b-spinner variant="danger" type="grow" label="Spinning" class="ml-2"></b-spinner>
					<b-spinner variant="danger" type="grow" label="Spinning" class="ml-2"></b-spinner>
				</div>
				<card shadow v-if="attachments.length > 0">
					<div class="row pl-4"
						v-if="attachments.length > 0"
						align="center">
						<span v-for="attachment in attachments"
							v-bind:key="attachment.rowNum">
							<span class="col-4">
								<div class="mt-1 mb--2 pr-2 text-right">
									<span class="pointer far fa-times-circle text-danger"
										v-on:click="removeAttachment(attachment.name)"
										title="Remove"
										style="z-index: 1; position: relative; left: 0px; top: 0px;"
										v-if="attachmentStatus == 1"></span>
								</div>
								<span class="mt-0">
									<a target="_blank"
										:href="attachment.url">
										<img :src="attachment.url"
											style="width: 220px; height: 220px; border-style: solid; border-color: black; border-width: 2px;">
									</a>
								</span>
							</span>
						</span>
					</div>
				</card>
				<template v-slot:modal-footer>
					<div class="w-100">
						<div class="text-right">
							<base-button id="darkBtn"
								@click.native="addAttachments()"
								:disabled="requestProcessing"
								v-if="attachmentStatus == 1">
								<i v-if="requestProcessing"
									class="fa fa-spinner fa-spin"></i>
								Add Attachment
							</base-button>
							<base-button id="darkInlineBtn"
								@click.native="$bvModal.hide('attachment-modal')"
							:disabled="requestProcessing">Close</base-button>
						</div>
					</div>
				</template>
			</b-modal>
		</div>
	</div>
</template>
<script>
	import {dbUsers, dbMains, storageMains} from '@/main';
	import {helpers, required} from "vuelidate/lib/validators";
	import printJS from 'print-js';
	import imageCompression from 'browser-image-compression';
	import { mapGetters } from 'vuex';
	import { capitalCase } from 'text-case';

	const moment  = require('moment');
	const today = new Date();
	const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -./, A-Za-z0-9 ]*$/);
	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ ,. 0-9 ]*$/);
	const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
	const refNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ - 0-9 ]*$/);
	const addZero = require('add-zero');
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');

	export default{
		components: {},
		data() {
			return {
				// E transaction particular table
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
						width: '100px',
						sortable: false
					}
				],
				particulars: [],
				// E transaction
				etrans: [],
				loading: false,
				// User
				user: {
					firstname: '',
					lastname: ''
				},
				// Select data
				eWallets: [],
				ewAccounts: [],
				// Enable or disable buttons
				requestProcessing: false,
				// Edit e transaction
				edit: {
					id: '',
					eTransId: '',
					eWallet: '',
					ewAccount: '',
					payee: '',
					payeeAccount: '',
					transactionNumber: '',
					transactionDate: ''
				},
				// New e transaction particular
				newParticular: '',
				newQuantity: '',
				newUnitPrice: '',
				newReferenceNumber: '',
				newAmount: '',
				// Edit e transaction particular
				editP: {
					id: '',
					particularId: '',
					particular: '',
					quantity: '',
					unitPrice: '',
					referenceNumber: '',
					amount: '',
					oldAmount: ''
				},
				// E transaction print space break
				breakCounts: 0,
				// E transaction attachment
				attachment: '',
				attachmentData: null,
				attachments: [],
				etId: '',
				uploadValue: 0,
				eTransactionSignatory: {
					receivedPayment: '',
					prepared: '',
					certified: '',
					approved: ''
				}
			}
		},
		validations:{
			// Edit e transaction validations
			edit: {
				eWallet: {required},
				ewAccount: {required},
				payee: {
					required,
					alphaNumCustomValidator
				},
				payeeAccount: {
					required,
					alphaNumCustomValidator
				},
				transactionNumber: {alphaNumCustomValidator},
				transactionDate: {required}
			},
			// New e transaction part validations
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
			},
			// Edit e transaction particular validations
			editP: {
				particular: {
					required,
					alphaNumCustomValidator
				},
				quantity: {
					required,
					numCustomValidator
				},
				unitPrice: {
					required,
					amountCustomValidator
				},
				referenceNumber: {refNumCustomValidator},
				amount: {
					required,
					amountCustomValidator
				}
			}
		},
		async mounted(){
			this.getETransactions();
			this.getUser();
			this.getEWallets();
		},
		computed: {
			...mapGetters({
				users: 'Users/users'
			})
		},
		methods: {
			getSignatory() {
				let data = dbMains.collection("printSignatoryTypes")
					.where("type","==", capitalCase('E Transactions'));
				let id = '';

				data.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							id = doc.data().printSignatoryId
						});
						let dataSig = dbMains.collection("printSignatories")
							.where('signatoryTypeReference',"==",id)
							.orderBy('orderNumber','asc');
							let sigs = [], ids = [], sigData = [];

						dataSig.get().then((querySnapshot) => {
							if(!querySnapshot.empty){
								querySnapshot.forEach((doc) => {
									sigs.push(doc.data());
									ids.push(doc.id);
								});
								for(let i = 0; i < sigs.length; i++){
									sigs[i]["rowNum"] = i + 1;
									sigs[i]["id"] = ids[i];
									sigData.push(sigs[i]); 
								}
								this.eTransactionSignatory = {
									receivedPayment: sigData[0].name,
									prepared: sigData[1].name,
									certified: sigData[2].name,
									approved: sigData[3].name
								}
							}
						});
					}
				});
			},
			// Redirect to e transaction list page
			closeETransaction(){
				this.$router.push('/electronic/transaction');
			},
			// Get user details
			getUser(){
				let self = this;

				self.username = localStorage.getItem('aisname');

				let userAccount = dbUsers.collection("users")
					.where("username", "==", self.username);
				let accounts = [];

				userAccount.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							accounts.push(doc.data());
						});
						self.user.firstname = accounts[0].firstname;
						self.user.lastname = accounts[0].lastname;
					}
				});
			},
			// Display e transaction details on table
			getETransactions(){
				let self = this, id = '', eWallet = '', ewAccountName = '', ewAccountNumber = '';
				let etData = dbUsers.collection("eTransactions")
					.where("eTransactionId","==",this.$router.currentRoute.params.id);

				self.etrans = [];
				self.getSignatory();
				etData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.etrans.push(doc.data());
						id = doc.id;
					});
					let ewData = dbMains.collection("eWallets")
						.where("eWalletId","==",self.etrans[0].eWalletReference);
					let ewaData = dbMains.collection("eWalletAccounts")
						.where("eWalletAccountId","==",self.etrans[0].eWalletAccountReference);

					ewData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							eWallet = doc.data().eWalletName;
						});
						ewaData.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								ewAccountName = doc.data().eWalletAccountName;
								ewAccountNumber = doc.data().eWalletAccountNumber;
							});
							self.etrans[0]["id"] = id;
							self.etrans[0]["eWallet"] = eWallet;
							self.etrans[0]["eWalletAccountName"] = ewAccountName;
							self.etrans[0]["eWalletAccountNumber"] = ewAccountNumber;
							self.etrans[0].voucherDate = moment.unix(self.etrans[0].voucherDate.seconds).format("MMMM DD, YYYY");
							self.etrans[0].totalAmount = format(parseFloat(self.etrans[0].totalAmount).toFixed(2));
							self.etrans = self.etrans[0];
						});
					});
				});
				self.getParticulars(this.$router.currentRoute.params.id);
			},
			// Display e transaction particular details on table
			getParticulars(id){
				let self = this, ids = [];

				let pData = dbUsers.collection("eTransactionParticulars")
					.where("eTransactionReference","==",id);

				self.particulars = [];
				self.loading = true;
				pData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.particulars.push(doc.data());
						ids.push(doc.id);
					});
					for(let a = 0; a < self.particulars.length; a++){
						self.particulars[a]["id"] = ids[a];
						self.particulars[a].amount = format(parseFloat(self.particulars[a].amount.replaceAll(",","")).toFixed(2));
					}
				});
				if(self.particulars.length <= 1){
					self.breakCounts = 11;
				}else if(self.particulars.length > 1 && self.particulars.length < 11){
					self.breakCounts = 12 - self.particulars.length;
				}
				setTimeout(function() {
					self.loading = false;
				}, 1000);
			},
			// Get e wallet details
			getEWallets(){
				let self = this;
				let getEW = dbMains.collection("eWallets")
					.orderBy("eWalletName","asc");

				self.eWallets = [];
				getEW.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.eWallets.push(doc.data());
					});
				});
			},
			// Get e wallet account details
			getEWalletAccounts(id){
				let self = this;
				let getEWAccounts = dbMains.collection("eWalletAccounts")
					.where("eWalletReference","==",id);

				self.ewAccounts = [];
				getEWAccounts.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.ewAccounts.push(doc.data());
					});
					self.edit.ewAccount = self.ewAccounts[0].eWalletAccountId;
				});
			},
			// Show edit e transaction form
			openUpdateETransactionModal(row){
				let self = this;

				self.getEWalletAccounts(row.eWalletReference);
				self.edit.id = row.id;
				self.edit.eTransId = row.eTransactionId;
				self.edit.eWallet = row.eWalletReference;
				self.edit.ewAccount = row.eWalletAccountReference;
				self.edit.payee = row.payee;
				self.edit.payeeAccount = row.payeeAccountNumber;
				self.edit.transactionNumber = row.transactionNumber;
				self.edit.transactionDate = row.transactionDate;
				self.$bvModal.show("update-modal");
			},
			// Change e transaction details
			updateETransaction(){
				let self = this;

				self.$v.edit.$touch();
				if(!self.$v.edit.$error){
					self.requestProcessing = true;
					try{
						dbUsers.collection("eTransactions")
						.doc(self.edit.id)
						.update({
							payee: self.edit.payee,
							payeeAccountNumber: self.edit.payeeAccount,
							transactionNumber: self.edit.transactionNumber,
							transactionDate: self.edit.transactionDate,
							eWalletReference: self.edit.eWallet,
							eWalletAccountReference: self.edit.ewAccount
						}).then(() => {
							self.$swal({
								title: 'Success',
								text: 'Item updated successfully!',
								icon: 'success',
								confirmButtonColor: '#b80000',
								confirmButtonText: 'OK'
							}).then(() => {
								self.$v.edit.$reset();
								self.$bvModal.hide('update-modal');
								self.getETransactions();
								self.requestProcessing = false;
							});
						});
					}catch(error){
						console.log("error");
						self.requestProcessing = false;
						self.$swal({
							title: 'Error',
							text: 'Something went wrong. Please try again.',
							icon: 'error',
							confirmButtonColor: '#f5365c',
							confirmButtonText: 'OK'
						});
					}
				}
			},
			// Compute e transaction total amount
			computeAmount(quantity, price, type){
				price  = price.replaceAll(',', '');
				if(type == 'add'){
					this.newAmount = price * quantity;
					this.newAmount = format(parseFloat(this.newAmount).toFixed(2));
				}else if(type == 'edit'){
					this.editP.amount = price * quantity;
					this.editP.amount = format(parseFloat(this.editP.amount).toFixed(2));
				}
			},
			// Add new e transaction particular details
			addParticular(){
				let self = this;

				self.$v.newParticular.$touch();
				self.$v.newQuantity.$touch();
				self.$v.newUnitPrice.$touch();
				self.$v.newReferenceNumber.$touch();
				self.$v.newAmount.$touch();
				if(!self.$v.newParticular.$error && !self.$v.newQuantity.$error && !self.$v.newUnitPrice.$error && !self.$v.newReferenceNumber.$error && !self.$v.newAmount.$error){
					self.requestProcessing = true;
					try{
						let getUserId = dbUsers.collection('users')
							.where("username", '==', localStorage.getItem('aisname'));
						let users = [];
						let etpID = 'ETPI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

						getUserId.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								if(doc.exists){
									users.push(doc.data());
								}
							});
							dbUsers.collection("eTransactionParticulars").doc()
							.set({
								eTransactionParticularId: etpID,
								particular: self.newParticular,
								quantity: self.newQuantity,
								unitPrice: self.newUnitPrice,
								referenceNumber: self.newReferenceNumber,
								amount: self.newAmount,
								eTransactionReference: self.$router.currentRoute.params.id,
								status: 1,
								userReference: users[0].userId,
								dateCreated: today,
								dateModified: today
							}).then(() => {
								let total = parseFloat(self.newAmount.replaceAll(",","")) + parseFloat(self.etrans.totalAmount.replaceAll(",",""));

								dbUsers.collection("eTransactions")
								.doc(self.etrans.id)
								.update({
									totalAmount: parseFloat(total).toFixed(2),
									dateModified: today
								}).then(() => {
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
										self.$v.newParticular.$reset();
										self.$v.newQuantity.$reset();
										self.$v.newUnitPrice.$reset();
										self.$v.newReferenceNumber.$reset();
										self.$v.newAmount.$reset();
										self.$bvModal.hide('add-particular-modal');
										self.requestProcessing = false;
										self.getETransactions();
									});
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
							confirmButtonColor: '#f5365c',
							confirmButtonText: 'OK'
						});
					}
				}
			},
			// Show edit e transaction particular form
			openUpdateParticularModal(row){
				let self = this;

				self.editP = {
					id: row.id,
					particularId: row.eTransactionParticularId,
					particular: row.particular,
					quantity: row.quantity,
					unitPrice: row.unitPrice,
					referenceNumber: row.referenceNumber,
					amount: row.amount,
					oldAmount: row.amount
				}
				self.$bvModal.show('edit-particular-modal');
			},
			// Change e transaction particular details
			updateParticular(){
				let self = this;

				self.$v.editP.$touch();
				if(!self.$v.editP.$error){
					self.requestProcessing = true;
					try{
						dbUsers.collection("eTransactionParticulars")
						.doc(self.editP.id)
						.update({
							particular: self.editP.particular,
							quantity: self.editP.quantity,
							unitPrice: self.editP.unitPrice,
							referenceNumber: self.editP.referenceNumber,
							amount: self.editP.amount,
							dateModified: today
						}).then(() => {
							let total = parseFloat(self.etrans.totalAmount.replaceAll(",","")) - parseFloat(self.editP.oldAmount.replaceAll(",",""));

							if(total <= 0){
								total = parseFloat(self.editP.amount.replaceAll(",",""));
							}else{	
								total = parseFloat(total) - parseFloat(self.editP.amount.replaceAll(",",""));
							}
							dbUsers.collection("eTransactions")
							.doc(self.etrans.id)
							.update({
								totalAmount: parseFloat(total).toFixed(2),
								dateModified: today
							}).then(() => {
								self.$swal({
									title: 'Success',
									text: 'Particular updated successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								}).then(() => {
									self.$v.editP.$reset();
									self.$bvModal.hide('edit-particular-modal');
									self.requestProcessing = false;
									self.getETransactions();
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
							confirmButtonColor: '#f5365c',
							confirmButtonText: 'OK'
						});
					}
				}
			},
			// Delete e transaction particular details
			removeParticular(row){
				let self = this;

				self.$swal({
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
						try{
							dbUsers.collection("eTransactionParticulars")
							.doc(row.id)
							.delete()
							.then(() => {
								let total = parseFloat(self.etrans.totalAmount.replaceAll(",","")) - parseFloat(row.amount.replaceAll(",",""));

								dbUsers.collection("eTransactions")
								.doc(self.etrans.id)
								.update({
									totalAmount: parseFloat(total).toFixed(2),
									dateModified: today
								}).then(() => {
									self.requestProcessing = false;
									self.getETransactions();
									self.$swal({
										title: 'Success',
										text: 'Particular removed successfully!',
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
			// Print e transaction details
			printETransaction(){
				this.$swal({
					title: 'Print with duplicate?',
					text: "",
					icon: 'question',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#f5c71a',
					confirmButtonText: 'YES' ,
					cancelButtonText: 'NO'
				}).then((result) => {
					if(result.value){
						printJS({
							printable: 'duplicateView',
							type: 'html',
							style: '#duplicateView {font-family: "Calibri";} #borderStyle {border-width: 1px; border-style: solid;} #docStyle {display: block; overflow: inherit; white-space: normal; font-size: 12px;}',
							documentTitle: 'E Transaction Voucher',
						});
					}else{
						printJS({
							printable: 'viewSummary',
							type: 'html',
							style: '#viewSummary {font-family: "Calibri";} #borderStyle {border-width: 1px; border-style: solid;} #docStyle {display: block; overflow: inherit; white-space: normal; font-size: 12px;}',
							documentTitle: 'E Transaction Voucher',
						});
					}
				});
				// this.$htmlToPaper('viewSummary');
			},
			// Show e transaction attachments
			openAttachments(row){
				this.etId = row.eTransactionId;
				this.attachmentStatus = row.status;
				this.$bvModal.show("attachment-modal");
				this.getAttachments(this.etId);
			},
			// Save new e transaction attachment
			addAttachments() {
				this.$refs.attachmentFile.click();
			},
			previewImage(event) {
				let self = this;
				const options = {
					maxSizeMB: 1,
					useWebWorker: true
				}

				self.uploadValue = 0;
				self.attachment = null;
				self.attachments = [];
				self.attachmentData = event.target.files[0];
				imageCompression(self.attachmentData, options)
				.then(function (compressedFile) {
					self.attachmentData = compressedFile;
					self.onUpload(self.attachmentData);
				});
			},
			onUpload(data){
				let self = this;
				const storageRef = storageMains.ref('eTransactions/' + self.etId + '/' + data.name)
				.put(data);

				self.requestProcessing = false;
				try{
					self.attachment = null;
					self.requestProcessing = true;
					storageRef.on(`state_changed`,snapshot => {
						self.uploadValue = (snapshot.bytesTransferred/snapshot.totalBytes) * 100; 
					}, error => {
						console.log(error.message)
					}, () => {
						self.uploadValue = 100;
						self.$swal({
							title: 'Success',
							text: 'Attachment uploaded successfully!',
							icon: 'success',
							confirmButtonColor: '#b80000',
							confirmButtonText: 'OK'
						});
						self.requestProcessing = false;
						self.getAttachments(self.rdId);
					});
				}catch(error){
					console.log("error");
					self.requestProcessing = false;
					self.$swal({
						title: 'Error',
						text: 'Something went wrong. Please try again.',
						icon: 'error',
						confirmButtonColor: '#f5365c',
						confirmButtonText: 'OK'
					});
				}
			},
			// Display e transaction attachment
			getAttachments(id){
				let self= this, rowNum = 0;
				let listRef = storageMains.ref('eTransactions/' + id);

				self.requestProcessing = false;
				self.attachments = [];
				self.uploadValue = 0;
				listRef.listAll()
				.then((res) => {
					res.items.forEach((itemRef) => {
						storageMains.ref('eTransactions/' + id + '/' + itemRef.name)
						.getDownloadURL()
						.then((url) => {
							rowNum = rowNum + 1;
							self.attachments.push({
								"rowNum":  rowNum,
								"name" : itemRef.name,
								"url" : url,
								"path": itemRef.fullPath,
								"status" : 1
							});
							self.uploadValue = 100;
						});
					});
				}).catch((error) => {
					console.log(error);
				});
			},
			// Delete e transaction attachment
			removeAttachment(name){
				let self = this;

				self.$swal({
					title: "Are you sure?",
					text: "You want to remove this attachment?",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#C72111',
					confirmButtonText: 'CONFIRM' ,
					cancelButtonText: 'CANCEL'
				}).then((result) => {
					if(result.value){
						let deleteRef = storageMains.ref('eTransactions/' + self.etId + '/' + name);

						try{
							deleteRef.delete()
							.then(() => {
								self.$swal({
									title: 'Success',
									text: 'Attachment remove successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								}).then(() => {
									self.getAttachments(self.etId);
								});
							});
						}catch(error){
							self.$swal({
								title: 'Error',
								text: 'Something went wrong. Please try again.',
								icon: 'error',
								confirmButtonColor: '#f5365c',
								confirmButtonText: 'OK'
							});
						}
					}
				});
			},
		}
	}
</script>
<style>
	#viewSummary {
		position: inherit;
		visibility: hidden;
		top: -100px;
	}
	#duplicateView {
		position: inherit;
		visibility: hidden;
		top: -100px;
	}
	#borderStyle {
		border-width: 1px;
		border-style: solid;
	}
	#docStyle {
		display: block; overflow: inherit; white-space: normal;
	}
	hr {margin-top:10px; margin-bottom: 10px;}
</style>