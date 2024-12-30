<template>
	<div id="textStyle"> 
		<base-header class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-12 container-fluid mt--7">
			<!-- For approval reimbursement view -->
			<card>
				<div class="row pl-4" v-if="reimbursements.monthOf != ''">
					<span class="col-sm-12">
						<b>Reimbursement for {{reimbursements.monthOf | moment("MMMM YYYY")}}</b>
					</span>
				</div>
				<hr v-if="reimbursements.monthOf != ''">
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Name:</b> {{reimbursements.fullName}}
					</span>
					<span class="col-sm-6">
						<b>Total Amount:</b> ₱ {{reimbursements.totalAmount}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-12">
						<span v-for="company in companies"
							v-bind:key="company.companyId">
							<span v-if="company.companyId == reimbursements.companyReference"><b>Company: </b>{{company.companyName}}</span>
						</span>
					</span>
				</div>
				<div class="row pl-4"
					v-if="reimbursements.status == 3 | reimbursements.status == 4">
					<span class="col-sm-6">
						<b>Check No.:</b> {{reimbursements.checkNumber}}
					</span>
					<span class="col-sm-6">
						<b>Voucher No:</b> {{reimbursements.voucherNumber | moment("MMMM DD, YYYY")}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Status:</b> {{reimbursements.statusName}}
					</span>
					<span class="col-sm-6" v-if="reimbursements.processDate != ''">
						<b>Process Date:</b> {{reimbursements.processDate | moment("MMMM DD, YYYY")}}
					</span>
				</div>
				<div class="row pl-4"
					v-if="reimbursements.status == 4">
					<span class="col-sm-6">
						<b>Received Date:</b> {{reimbursements.receivedDate | moment("MMMM DD, YYYY")}}
					</span>
				</div>
				<div class="row pl-4"
					v-if="reimbursements.status == 4 || reimbursements.status == 0">
					<span class="col-sm-12">
						<span id="particular"><b>Remarks:</b> {{reimbursements.remarks == '' ? '-------' : reimbursements.remarks}}</span>
					</span>
				</div>
				<hr v-if="reimbursements.status == 1 | reimbursements.status == 0 | reimbursements.status == 2">
				<div class="form-group row"
					v-if="reimbursements.status == 1 | reimbursements.status == 0">
					<div class="col-sm-4 pl-5"
						v-if="userRole != 'Administrator'"></div>
					<div class="col-sm-3 pl-5">
						<base-button block id="darkBtn"
							@click="openReimItemModal(desc)"
							v-if="reimbursements.status == 1">Add Item for</base-button>
					</div>
					<div class="col-sm-5 pr-5">
						<v-select id="inputStyle"
							:options="descriptions"
							:reduce="desc => desc.reimbursementDescId"
							label="description"
							v-model="desc"
							:clearable="false"
							v-if="reimbursements.status == 1"></v-select>
						<i class="text-red"
							v-if="$v.desc.$anyDirty && !$v.desc.required">Field Required</i>
					</div>
					<div class="col-sm-3 pl-5"
						v-if="userRole == 'Administrator'">
						<base-button block id="darkBtn"
							@click="openUpdateReim(reimbursements)">Update</base-button>
					</div>
				</div>
				<div class="form-group row"
					v-if="reimbursements.status == 2 && userRole == 'Administrator'">
					<div class="col-sm-9 pl-5"></div>
					<div class="col-sm-3 pl-5 pr-5">
						<base-button block id="darkBtn"
							@click="openUpdateReim(reimbursements)">Update</base-button>
					</div>
				</div>
				<hr v-if="reimbursements.status == 1 && userRole == 'Administrator' && reimItems.length != 0">
				<div class="card-header bg-transparent"
					v-if="reimItems.length != 0">
					<div class="text-left">
						<h2 class="display-5"
							id="sideBarTxt">Reimbursement Items</h2>
					</div>       
				</div>
				<div class="table-full-width pt-2"
					v-if="reimItems.length != 0">
					<vue-good-table :columns="reimColumns"
						:rows="items"
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
							<b><span v-if="props.column.field == 'date'">
								<span>{{props.row.date | moment('MMM DD, YYYY')}}</span>
							</span>
							<span v-if="props.column.field == 'particular'">
								<span id="particular">{{props.row.particular}}</span>
							</span>
							<span v-if="props.column.field == 'amount'">
								<span>₱ {{props.row.amount}}</span>
							</span>
							<span v-if="props.column.field == 'description'">
								<span v-for="desc in descriptions"
									v-bind:key="desc.reimbursementDescId" >
									<span v-if="desc.reimbursementDescId == props.row.descriptionReference">{{desc.description}}</span>
								</span>
							</span>
							<span v-if="props.column.field == 'action'">
								<span class="pointer ml-2 far fa-edit"
									id="sideBarTxt"
									v-on:click="openUpdateItemModal(props.row)"
									title="Update"
									v-if="reimbursements.status == 1 | reimbursements.status == 0"></span>
								<span class="pointer ml-2 fa fa-file"
									id="sideBarTxt"
									v-on:click="openAttachments(props.row)"
									title="Attachment"></span>
								<span class="pointer ml-2 far fa-times-circle text-red"
									v-on:click="removeItem(props.row)"
									title="Remove"
									v-if="reimbursements.status == 1 | reimbursements.status == 0"></span>
							</span></b>
						</template>
					</vue-good-table>
				</div>
				<hr v-if="reimTrans.length != 0">
				<div class="card-header bg-transparent"
					v-if="reimTrans.length != 0">
					<div class="text-left">
						<h2 class="display-5"
							id="sideBarTxt">Transportation Reimbursement</h2>
					</div>       
				</div>
				<div class="table-full-width"
					v-if="reimTrans.length != 0">
					<vue-good-table :columns="reimTransColumns"
						:rows="trans"
						:search-options="{enabled: true}"
						:pagination-options="{
							enabled: true,
							perPageDropdown: [10, 15, 20],
						}"
						:sort-options="{enabled: true}"
						:line-numbers="true"
						:isLoading="loading">
						<template slot="table-row" slot-scope="props">
							<b><span v-if="props.column.field == 'date'">
								<span>{{props.row.date | moment('MMM DD, YYYY')}}</span>
							</span>
							<span v-if="props.column.field == 'transportationMode'">
								<span class="tableSpan">{{props.row.transportationMode}}</span>
							</span>
							<span v-if="props.column.field == 'from'">
								<span class="tableSpan">{{props.row.from}}</span>
							</span>
							<span v-if="props.column.field == 'to'">
								<span class="tableSpan">{{props.row.to}}</span>
							</span>
							<span v-if="props.column.field == 'purpose'">
								<span class="tableSpan">{{props.row.purpose}}</span>
							</span>
							<span v-if="props.column.field == 'amount'">
								<span>₱ {{props.row.amount}}</span>
							</span>
							<span v-if="props.column.field == 'action'">
								<span class="pointer ml-2 far fa-edit"
									id="sideBarTxt"
									v-on:click="openUpdateTransModal(props.row)"
									title="Update"
									v-if="reimbursements.status == 1 | reimbursements.status == 0"></span>
								<span class="pointer ml-2 fa fa-file"
									id="sideBarTxt"
									v-on:click="openAttachments(props.row)"
									title="Attachment"></span>
								<span class="pointer ml-2 far fa-times-circle text-red"
									v-on:click="removeTrans(props.row)"
									title="Remove"
									v-if="reimbursements.status == 1 | reimbursements.status == 0"></span>
							</span></b>
						</template>
					</vue-good-table>
				</div>
				<hr>
				<div class="text-right">
					<base-button id="darkBtn"
						class="col-md-2 ml-2 mr-2"
						@click.native="printReim"
						v-if="reimbursements.status == 3 | reimbursements.status == 2 | reimbursements.status == 4"
						:disabled="requestProcessing">Print</base-button>
					<base-button id="darkInlineBtn"
						class="col-md-2 ml-2 mr-5"
						@click.native="cancelView">Close</base-button>
				</div>
			</card>
			<!-- Reimbursement view for approved, checked or processed -->
			<card id="viewSummary"
				v-if="reimbursements.status == 3 | reimbursements.status == 2 | reimbursements.status == 4"
				class="pl-4 shadow">
				<div class="row"
					id="centerStyle">
					<span class="col-sm-12 text-center"
						id="particular">
						<b>{{company.name}}</b>
					</span>
				</div>
				<div class="row"
					id="centerStyle">
					<span class="col-sm-12 text-center"
						id="particular">
						<b>{{company.address}}</b>
					</span>
				</div>
				<div class="row pt-4"
					id="headerStyle">
					<span class="col-sm-12 text-center">
						<b>Reimbursement</b><br>
					</span>
				</div>
				<div class="row">
					<div class="col-sm-12">
						<span><b>{{reimbursements.processDate | moment("MMMM DD, YYYY")}}</b></span>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-6"><b>{{reimbursements.fullName}}</b>
					</div>
					<div class="col-sm-2"></div>
					<div class="col-sm-4">
						<span v-for="dept in departments"
							v-bind:key="dept.departmentUid" >
							<span v-if="dept.departmentUid == reimbursements.departmentReference">
								{{dept.departmentName}}
							</span>
						</span>
					</div>
				</div>
				<div class="row"
					v-if="reimbursements.status == 3 | reimbursements.status == 4">
					<span class="col-sm-6">
						<b>Check No.:</b> {{reimbursements.checkNumber}}
					</span>
					<div class="col-sm-2"></div>
					<span class="col-sm-4">
						<b>Voucher No:</b> {{reimbursements.voucherNumber | moment("MMMM DD, YYYY")}}
					</span>
				</div>
				<hr>
				<div class="row pb-0 text-center pl-4 pr-4"
					id="particularStyle"
					v-if="reimItems.length != 0">
					<span class="col-sm-3"
						id="borderStyle">
						<span><b>Date</b></span>
					</span>
					<span class="col-sm-3"
						id="borderStyle">
						<span><b>Particular</b></span>
					</span>
					<span class="col-sm-3"
						id="borderStyle">
						<span><b>Description</b></span>
					</span>
					<span class="col-sm-3"
						id="borderStyle">
						<span><b>Amount</b></span>
					</span>
				</div>
				<div class="row pl-4 pr-4 text-center"
					v-for="reim in reimItems"
					v-bind:key="reim.reimbursementParticularId"
					id="particularStyle">
					<span class="col-sm-3"
						id="borderStyle">
						<span>{{reim.date | moment("MMM DD, YYYY")}}</span>
					</span>
					<span class="col-sm-3"
						id="borderStyle">
						<span>{{reim.particular}}</span>
					</span>
					<span class="col-sm-3"
						id="borderStyle">
						<span v-for="desc in descriptions"
							v-bind:key="desc.reimbursementDescId" >
							<span v-if="desc.reimbursementDescId == reim.descriptionReference"
							>{{desc.description}}</span>
						</span>
					</span>
					<span class="col-sm-3"
						id="borderStyle">
						<span>₱ {{reim.amount}}</span>
					</span>
				</div>
				<div class="row pl-4 pr-4 text-center"
					id="particularStyle"
					v-if="reimItems.length != 0">
					<span class="col-sm-9"
						id="borderStyle">
						<span><b>Total Amount</b></span>
					</span>
					<span class="col-sm-3"
						id="borderStyle">
						<span><b>₱ {{totalItem}}</b></span>
					</span>
				</div>
				<br v-if="reimTrans.length != 0">
				<div class="row text-center pl-4 pr-4"
					id="particularStyle"
					v-if="reimTrans.length != 0">
					<span class="col-sm-2"
						id="borderStyle">
						<span><b>Date</b></span>
					</span>
					<span class="col-sm-2"
						id="borderStyle">
						<span><b>Mode</b></span>
					</span>
					<span class="col-sm-2"
						id="borderStyle">
						<span><b>From</b></span>
					</span>
					<span class="col-sm-2"
						id="borderStyle">
						<span><b>To</b></span>
					</span>
					<span class="col-sm-2"
						id="borderStyle">
						<span><b>Purpose</b></span>
					</span>
					<span class="col-sm-2"
						id="borderStyle">
						<span><b>Amount</b></span>
					</span>
				</div>
				<div class="row pl-4 pr-4 text-center"
					v-for="reim in reimTrans"
					v-bind:key="reim.reimbursementParticularId"
					id="particularStyle">
					<span class="col-sm-2"
						id="borderStyle">
						<span>{{reim.date | moment("MMM DD, YYYY")}}</span>
					</span>
					<span class="col-sm-2"
						id="borderStyle">
						<span>{{reim.transportationMode}}</span>
					</span>
					<span class="col-sm-2"
						id="borderStyle">
						<span>{{reim.from}}</span>
					</span>
					<span class="col-sm-2"
						id="borderStyle">
						<span>{{reim.to}}</span>
					</span>
					<span class="col-sm-2"
						id="borderStyle">
						<span>{{reim.purpose}}</span>
					</span>
					<span class="col-sm-2"
						id="borderStyle">
						<span>₱ {{reim.amount}}</span>
					</span>
				</div>
				<div class="row pl-4 pr-4 text-center"
					id="particularStyle"
					v-if="reimTrans.length != 0">
					<span class="col-sm-10"
						id="borderStyle">
						<span><b>Total Amount</b></span>
					</span>
					<span class="col-sm-2 "
						id="borderStyle">
						<span>
							<b>₱ {{totalTrans}}</b>
						</span>
					</span>
				</div><br>
				<br v-if="reimTrans.length != 0">
				<div class="row">
					<span class="col-sm-12">
						<h3>Total Reimbursement Amount: ₱ {{reimbursements.totalAmount}}</h3>
					</span>
				</div>
				<br>
				<hr>
					<div class="row">
					<span class="col-sm-5">
						<b>Prepared by :</b> {{reimSignatory.prepared || user.firstname + ' ' + user.lastname}}
					</span>
					<span class="col-sm-2"></span>
					<span class="col-sm-5">
						<b>Approved by : </b> {{reimSignatory.approved}}
					</span>
				</div><br>
				<div class="pl-4 pt-4"
					v-if="allAttachments.length > 0"
					align="center"
					id="attachmentStyle">
					<span v-for="attachment in allAttachments"
						v-bind:key="attachment.name">
						<span>
							<img :src="attachment.url"
								style="width: 370px; height: 250px;"
								v-if="allAttachments.length > 1">
							<img :src="attachment.url"
								style="width: 740px; height: 250px;"
								v-if="allAttachments.length == 1">
						</span>
					</span>
				</div>
			</card>
		</div>
		<!-- UPDATE MODAL -->
		<b-modal size="lg"
			id="update-modal"
			title="Edit Reimbursement" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Process Date:</b>
					<b class="text-red" v-if="editReim.status == 2">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Status:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editReim.processDate"
						type="date"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.editReim.$anyDirty && !$v.editReim.processDate.required && editReim.status == 2">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="stats"
						:reduce="stat => stat.statId"
						label="status"
						v-model="editReim.status"
						:clearable="false"></v-select>
						<i class="text-red"
							v-if="$v.editReim.$anyDirty && !$v.editReim.status.required">Field Required</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-12 col-form-label">
					<b>Company:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="companies"
						:reduce="company => company.companyId"
						label="companyName"
						v-model="editReim.company"></v-select>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Remarks:</b>
					<b class="text-red"
						v-if="editReim.status == 0">*</b>
				</label>
				</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<textarea v-model="editReim.remarks"
						id="inputStyle"
						cols="53"
						rows="4"
						placeholder="Remarks"></textarea>
					<i class="text-red"
						v-if="$v.editReim.$anyDirty && !$v.editReim.remarks.required && editReim.status == 0">Field Required</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="updateReim()"
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
			<card shadow v-if="loadAttachment">
				<div class="row pl-4">
					<span class="col-sm-12 text-center"> 
						<b-spinner
							type="grow"
							label="Spinning"
							class="ml-3 mr-3"></b-spinner>
						<b-spinner
							type="grow"
							label="Spinning"
							class="ml-3 mr-3"></b-spinner>
						<b-spinner
							type="grow"
							label="Spinning"
							class="ml-3 mr-3"></b-spinner>
					</span>
				</div>
			</card>
			<card shadow v-if="attachments.length > 0">
				<div class="row pl-4"
					v-if="attachments.length > 0 && !loadAttachment"
					align="center">
					<span v-for="attachment in attachments"
						v-bind:key="attachment.rowNum">
						<span class="col-4">
							<div class="mt-1 mb--2 pr-2 text-right">
								<span class="pointer far fa-times-circle text-danger"
									v-on:click="removeAttachment(attachment.name)"
									title="Remove"
									style="z-index: 1; position: relative; left: 0px; top: 0px;"
									v-if="reimbursements.status == 1 | reimbursements.status == 0"></span>
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
			<card shadow v-if="attachments.length == 0 && !loadAttachment">
				<div class="row pl-4">
					<span class="col-sm-12">
						<h2 class="text-center">NO ATTACHMENT</h2>
					</span>
				</div>
			</card>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addAttachments()"
							:disabled="requestProcessing"
							v-if="reimbursements.status == 1 | reimbursements.status == 0">
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
						v-if="$v.newMode.$anyDirty && !$v.newMode.alphaNumCustomValidator">Invalid Characters</i>
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
		<!-- UPDATE TRANSPORTATION REIMBURSEMENT MODAL -->
		<b-modal size="lg"
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
	</div>
</template>
<script>
	import {dbUsers, dbExpense, dbMains, expenseStorage, db} from '@/main';
	import imageCompression from 'browser-image-compression';
	import {helpers, required} from "vuelidate/lib/validators";
	import { capitalCase } from "text-case";
	// import printJS from 'print-js';

	const commaNumber = require('comma-number');
	const format = commaNumber.bindWith(',', '.');
	const itemColumns = ["#", "Date", "Particular", "Amount", "Description", "Actions"];
	const transColumns = ["#", "Date", "Mode", "From", "To", "Purpose", "Amount", "Actions"];
	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ,. ]*$/);
	const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
	const moment  = require('moment');
	const today = new Date();
	const addZero = require('add-zero');

	export default{
		components: {},
		data() {
			return {
				// Reimbursement details
				companies: [],
				reimbursements: [],
				reimDesc: [],
				descriptions: [],
				company: {
					name: '',
					address: ''
				},
				departments: [],
				totalItem: 0,
				totalTrans: 0,
				// Reimbursement item table
				reimColumns: [{
						label: 'Date',
						field: 'date'
					},{
						label: 'Particular',
						field: 'particular'
					},{
						label: 'Amount',
						field: 'amount'
					},{
						label: 'Description',
						field: 'description'
					},{
						label: '',
						field: 'action',
						sortable: false,
						width: '100px'
					}
				],
				reimItems: [],
				items: [],
				reimItemsTable: {
					title: "Reimbursement Items Table",
					subTitle: "",
					columns: [...itemColumns]
				},
				currentPage: 1,
				// Reimbursement transportation table
				reimTransColumns: [{
						label: 'Date',
						field: 'date'
					},{
						label: 'Mode',
						field: 'transportationMode'
					},{
						label: 'From',
						field: 'from'
					},{
						label: 'To',
						field: 'to'
					},{
						label: 'Purpose',
						field: 'purpose'
					},{
						label: 'Amount',
						field: 'amount'
					},{
						label: '',
						field: 'action',
						sortable: false,
						width: '100px'
					}
				],
				reimTrans: [],
				trans: [],
				loadError: false,
				reimTransTable: {
					title: "Transportation Reimbursement Table",
					subTitle: "",
					columns: [...transColumns]
				},
				currentTransPage: 1,
				// Reimbursement attachment
				attachment: '',
				attachmentData: null,
				attachments: [],
				allAttachments: [],
				reimItemId: '',
				uploadValue: 0,
				desc: '',
				loadAttachment: true,
				// New reimbursement item and transportation
				newDesc: '',
				newDate: moment().format("YYYY-MM-DD"),
				newParticular: '',
				newAmount: '',
				newTransDate: moment().format("YYYY-MM-DD"),
				newMode: '',
				newFrom: '',
				newTo: '',
				newPurpose: '',
				newTransAmount: '',
				// Enable or disable buttons
				requestProcessing: false,
				processMaxDate: moment().format("YYYY-MM-DD"),
				// Edit reimbursement item
				editItem: {
					id: '',
					date: '',
					particular: '',
					amount: ''
				},
				// Edit reimbursement transportation
				editTrans: {
					id: '',
					date: '',
					mode: '',
					from: '',
					on: '',
					purpose: '',
					amount: ''
				},
				stats: [
					{'statId': 1, 'status': 'For Approval'},
					{'statId': 2, 'status': 'Approved'},
					{'statId': 0, 'status': 'Rejected'}
				],
				// Edit reimbursement
				editReim: {
					id: '',
					processDate: '',
					status: '',
					company: '',
					remarks: ''
				},
				// User
				userRole: '',
				user: {
					firstname: '',
					lastname: ''
				},
				reimSignatory: {
					prepared: '',
					approved: ''
				}
			}
		},
		validations: {
			// Add reimbursement item and transportation validations
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
			// Edit item validations
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
			// Edit transportation validations
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
			},
			// Edit reimbursement validations
			editReim: {
				processDate: {required},
				status: {required},
				remarks: {required}
			}
		},
		async mounted(){
			this.getUserRole();
			this.getReimbursement();
			this.getDesc();
			this.getReimItems(1);
			this.getReimTrans(1);
			this.getCompany();
			this.getDepartments();
			this.getUser(localStorage.getItem('aisname'));
			this.getCompanies();
		},
		methods: {
			getSignatory() {
				let data = dbMains.collection("printSignatoryTypes")
					.where("type","==", capitalCase('Reimbursement'));
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
								this.reimSignatory = {
									prepared: sigData[0].name,
									approved: sigData[1].name
								}
							}
						});
					}
				});
			},
			// Get user role details
			getUserRole(){
				let self = this;

				self.username = localStorage.getItem('aisname');
				self.accountName = self.username.toUpperCase();

				let userAccount = dbUsers.collection("users")
					.where("username", "==", self.username);
				let accounts = [];

				userAccount.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							accounts.push(doc.data());
						});
					}
					let userRole = dbUsers.collection("userRoles")
						.where("userRoleId", "==", accounts[0].userRoleReference);
					let roles = [];

					userRole.get().then((querySnapshot) => {
						if(!querySnapshot.empty){
							querySnapshot.forEach((doc) => {
								roles.push(doc.data());
							});
							self.userRole = roles[0].userRole;
						}
					});
				});
			},
			// Get company details
			getCompanies(){
				let self = this;
				let companyData = dbMains.collection("companies")
					.orderBy("companyName", "asc");

				companyData.get().then((querySnapshot) => {
					if(!querySnapshot.empty){
						querySnapshot.forEach((doc) => {
							self.companies.push(doc.data());
						});
					}
				});
			},
			// Display reimbursement details
			getReimbursement(){
				let self = this, reimData = null, id = "", userData = null, users = [];
				let reimId = this.$router.currentRoute.params.id;

				self.reimbursements = [];
				self.allAttachments = [];
				self.getSignatory();
				reimData = dbExpense.collection("reimbursements")
					.where("reimbursementId","==",reimId);
				reimData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.reimbursements.push(doc.data());
						id = doc.id;
					});
					userData = dbUsers.collection("users")
						.where("userId","==",self.reimbursements[0].nameReference);
					userData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							users.push(doc.data());
						});
						self.reimbursements[0]["id"] = id; 
						self.reimbursements[0]["fullName"] = users[0].firstname + ' ' + users[0].lastname;
						self.reimbursements[0].totalAmount = format(parseFloat(self.reimbursements[0].totalAmount.replaceAll(",","")).toFixed(2));
						if(self.reimbursements[0].status == 1){
							self.reimbursements[0]["statusName"] = "For Approval";
						}else if(self.reimbursements[0].status == 2){
							self.reimbursements[0]["statusName"] = "Approved";
						}else if(self.reimbursements[0].status == 3){
							self.reimbursements[0]["statusName"] = "Processed";
						}else if(self.reimbursements[0].status == 4){
							self.reimbursements[0]["statusName"] = "Received";
						}else if(self.reimbursements[0].status == 0){
							self.reimbursements[0]["statusName"] = "Rejected";
						}
						if(self.reimbursements[0].checkReference != ''){
							let checkData = db.collection("bankChecks")
								.where("bankCheckUid","==",self.reimbursements[0].checkReference);

							checkData.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									self.reimbursements[0]["checkNumber"] = doc.data().bankCheckNumber;
									self.reimbursements[0]["voucherNumber"] = doc.data().voucherNumber;
								});
								self.reimbursements = self.reimbursements[0];
							});
						}else{
							self.reimbursements = self.reimbursements[0];
						}
					});
				});
			},
			// Get reimbursement description details
			getDesc(){
				let self = this, descData = null;

				descData = dbMains.collection("reimbursementDescriptions")
					.orderBy("description","asc");
				descData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.descriptions.push(doc.data());
					});
					self.desc = self.descriptions[0].reimbursementDescId;
				});
			},
			// Display reimbursement item details on table
			getReimItems(page){
				let self = this, itemData = null, items = [], ids = [], descData = null, descs = [];
				let reimId = this.$router.currentRoute.params.id;
				// let firstRow = (page - 1) * 10;
				// let lastRow = (page * 10);
				let amount = 0;
				console.log(page);

				self.reimItems = [];
				self.items = [];
				descData = dbMains.collection("reimbursementDescriptions");
				descData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						descs.push(doc.data());
					});
					itemData = dbExpense.collection("reimbursementItems")
						.where("reimbursementReference","==",reimId)
						.orderBy("dateCreated","asc");
					itemData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							items.push(doc.data());
							ids.push(doc.id);
						});
						for(let e = 0; e < items.length; e++){
							items[e]["id"] = ids[e];
						}
						for(let a = 0; a < descs.length; a++){
							for(let b = 0;  b < items.length; b++){
								if(descs[a].reimbursementDescId == items[b].descriptionReference){
									if(descs[a].description != 'TRANSPORTATION'){
										self.reimItems.push(items[b]);
										self.getAllAttachments(items[b].reimburseItemId);
									}
								}
							}
						}
						for(let d = 0; d < self.reimItems.length; d++){
							self.reimItems[d]["rowNum"] = d + 1;
							amount = parseFloat(amount) + parseFloat(self.reimItems[d].amount.replaceAll(",",""));
							self.reimItems[d].amount = format(parseFloat(self.reimItems[d].amount.replaceAll(",","")).toFixed(2));
							self.items.push(self.reimItems[d]);
						}
						// for(let c = firstRow; c < lastRow; c++){
						// 	if(self.reimItems[c]){
						// 		self.items.push(self.reimItems[c]);
						// 	}
						// }
						self.totalItem = format(parseFloat(amount).toFixed(2));
					});
				});
			},
			// Reimbursement item table page change
			onPageChange(page) {
				this.getReimItems(page);
			},
			// Display reimbursement transportation details on table
			getReimTrans(page){
				let self = this, itemData = null, items = [], ids = [], descData = null, descs = [];
				let reimId = this.$router.currentRoute.params.id;
				// let firstRow = (page - 1) * 10;
				// let lastRow = (page * 10);
				let amount = 0;
				console.log(page);

				self.reimTrans = [];
				self.trans = [];
				descData = dbMains.collection("reimbursementDescriptions");
				descData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						descs.push(doc.data());
					});
					itemData = dbExpense.collection("reimbursementItems")
						.where("reimbursementReference","==",reimId)
						.orderBy("dateCreated","asc");
					itemData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							items.push(doc.data());
							ids.push(doc.id);
						});
						for(let e = 0; e < items.length; e++){
							items[e]["id"] = ids[e];
						}
						for(let a = 0; a < descs.length; a++){
							for(let b = 0;  b < items.length; b++){
								if(descs[a].reimbursementDescId == items[b].descriptionReference){
									if(descs[a].description == 'TRANSPORTATION'){
										self.reimTrans.push(items[b]);
										self.getAllAttachments(items[b].reimburseItemId);
									}
								}
							}
						}
						for(let d = 0; d < self.reimTrans.length; d++){
							self.reimTrans[d]["rowNum"] = d + 1;
							amount = parseFloat(amount) + parseFloat(self.reimTrans[d].amount.replaceAll(",",""));
							self.reimTrans[d].amount = format(parseFloat(self.reimTrans[d].amount.replaceAll(",","")).toFixed(2));
							self.trans.push(self.reimTrans[d]);
						}
						self.reimTrans.sort(function (a, b) {
							return b.dateCreated - a.dateCreated;
						});
						// for(let c = firstRow; c < lastRow; c++){
						// 	if(self.reimTrans[c]){
						// 		self.trans.push(self.reimTrans[c]);
						// 	}
						// }
						self.totalTrans = format(parseFloat(amount).toFixed(2));
					});
				});
			},
			// Reimbursement transportation table page change
			onTransPageChange(page) {
				this.getReimTrans(page);
			},
			// Show reimbursement attachment modal
			openAttachments(reim){
				this.reimItemId = reim.reimburseItemId;
				this.$bvModal.show("attachment-modal");
				this.getAttachments(this.reimItemId);
			},
			// Save new reimbursement attachment
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
				const storageRef = expenseStorage.ref('reimbursementFiles/' + self.reimItemId + '/' + data.name)
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
						self.getAttachments(self.reimItemId);
						self.getReimbursement();
						self.getReimItems(1);
						self.getReimTrans(1);
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
			// Display reimbursement attachment
			getAttachments(id){
				let self= this, rowNum = 0;
				let listRef = expenseStorage.ref('reimbursementFiles/' + id);

				self.loadAttachment = true;
				self.attachments = [];
				listRef.listAll()
				.then((res) => {
					res.items.forEach((itemRef) => {
					expenseStorage.ref('reimbursementFiles/' + id + '/' + itemRef.name)
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
						});
					});
				}).catch((error) => {
					console.log(error);
				});
				setTimeout(function() {
					self.loadAttachment = false;
				}, 5000);
			},
			// Display reimbursement attachment for printing
			getAllAttachments(id){
				let self= this, rowNum = 0;
				let listRef = expenseStorage.ref('reimbursementFiles/' + id);

				self.requestProcessing = true;
				listRef.listAll()
				.then((res) => {
					res.items.forEach((itemRef) => {
					expenseStorage.ref('reimbursementFiles/' + id + '/' + itemRef.name)
						.getDownloadURL()
						.then((url) => {
							rowNum = rowNum + 1;
							self.allAttachments.push({
								"rowNum":  rowNum,
								"name" : itemRef.name,
								"url" : url,
								"path": itemRef.fullPath,
								"status" : 1
							});
						});
					});
				}).catch((error) => {
					console.log(error);
				});
				setTimeout(function() {
					self.requestProcessing = false;
				}, 2000);
			},
			// Delete reimbursement attachment
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
						let deleteRef = expenseStorage.ref('reimbursementFiles/' + self.reimItemId + '/' + name);

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
									self.getAttachments(self.reimItemId);
									self.getReimbursement();
									self.getReimItems(1);
									self.getReimTrans(1);
								});
							});
						}catch(error){
							console.log(error);
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
			// Show new item or transportation form
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
				self.requestProcessing = false;
				if(!self.$v.newDate.$error && !self.$v.newParticular.$error && !self.$v.newAmount.$error){
					self.requestProcessing = true;
					self.reimItems = [];
					self.items = [];
					let getUserId = dbUsers.collection("users")
						.where("username","==",localStorage.getItem("aisname"));
					let users = [];
					let rIID = 'RII-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
					let reimId = this.$router.currentRoute.params.id;

					getUserId.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							users.push(doc.data());
						});
						dbExpense.collection("reimbursementItems").doc()
						.set({
							reimburseItemId: rIID,
							date: self.newDate,
							amount: self.newAmount,
							particular: self.newParticular,
							reimbursementReference: reimId,
							descriptionReference: self.desc,
							status: 1,
							userReference: users[0].userId,
							dateCreated: today,
							dateModified: today
						}).then(() => {
							let reims = dbExpense.collection("reimbursements")
								.where("reimbursementId","==",reimId);
							let getItems = dbExpense.collection("reimbursementItems")
								.where("reimbursementReference","==",reimId);
							let itemAmounts = [], reimTotal = 0, id = '';

							getItems.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									itemAmounts.push(doc.data());
								});
								reims.get().then((querySnapshot) => {
									querySnapshot.forEach((doc) => {
										id = doc.id;
									});
									for(let a = 0; a < itemAmounts.length; a++){
										reimTotal = parseFloat(reimTotal) + parseFloat(itemAmounts[a].amount.replaceAll(",",""));
									}
									reimTotal = format(parseFloat(reimTotal).toFixed(2));
									dbExpense.collection("reimbursements").doc(id)
									.update({
										totalAmount: reimTotal,
										dateModified: today
									}).then(() => {
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
											self.getReimbursement();
											self.getReimItems(1);
											self.getReimTrans(1);
											self.requestProcessing = false;
										});
									});
								});
							});
						});
					});
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
				self.requestProcessing = false;
				if(!self.$v.newTransDate.$error && !self.$v.newMode.$error && !self.$v.newFrom.$error && !self.$v.newTo.$error && !self.$v.newPurpose.$error && !self.$v.newTransAmount.$error){
					self.requestProcessing = true;
					self.reimTrans = [];
					self.trans = [];
					let getUserId = dbUsers.collection("users")
						.where("username","==",localStorage.getItem("aisname"));
					let users = [];
					let rTID = 'RTI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
					let reimId = this.$router.currentRoute.params.id;

					getUserId.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							users.push(doc.data());
						});
						dbExpense.collection("reimbursementItems").doc()
						.set({
							reimburseItemId: rTID,
							date: self.newTransDate,
							amount: self.newTransAmount,
							from: self.newFrom,
							to: self.newTo,
							transportationMode: self.newMode,
							purpose: self.newPurpose,
							reimbursementReference: reimId,
							descriptionReference: self.desc,
							status: 1,
							userReference: users[0].userId,
							dateCreated: today,
							dateModified: today
						}).then(() => {
							let reims = dbExpense.collection("reimbursements")
								.where("reimbursementId","==",reimId);
							let getItems = dbExpense.collection("reimbursementItems")
								.where("reimbursementReference","==",reimId);
							let itemAmounts = [], reimTotal = 0, id = '';

							getItems.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									itemAmounts.push(doc.data());
								});
								reims.get().then((querySnapshot) => {
									querySnapshot.forEach((doc) => {
										id = doc.id;
									});
									for(let a = 0; a < itemAmounts.length; a++){
										reimTotal = parseFloat(reimTotal) + parseFloat(itemAmounts[a].amount.replaceAll(",",""));
									}
									reimTotal = format(parseFloat(reimTotal).toFixed(2));
									dbExpense.collection("reimbursements")
									.doc(id)
									.update({
										totalAmount: reimTotal,
										dateModified: today
									}).then(() => {
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
											self.getReimbursement();
											self.getReimItems(1);
											self.getReimTrans(1);
											self.requestProcessing = false;
										});
									});
								});
							});
						});
					});
				}
			},
			// Show edit reimbursement item form
			openUpdateItemModal(row){
				this.editItem = {
					id: row.id,
					date: row.date,
					particular: row.particular,
					amount: row.amount
				}
				this.$bvModal.show('update-reim-item-modal');
			},
			// Change reimbursement item details
			updateReimItem(){
				let self = this;
				let reimId = this.$router.currentRoute.params.id;

				self.$v.editItem.$touch();
				self.requestProcessing = false;
				if(!self.$v.editItem.$error){
					self.requestProcessing = true;
					dbExpense.collection("reimbursementItems")
					.doc(self.editItem.id)
					.update({
						date: self.editItem.date,
						amount: self.editItem.amount,
						particular: self.editItem.particular,
						descriptionReference: self.desc,
						dateModified: today
					}).then(() => {
						let reims = dbExpense.collection("reimbursements")
							.where("reimbursementId","==",reimId);
						let getItems = dbExpense.collection("reimbursementItems")
							.where("reimbursementReference","==",reimId);
						let itemAmounts = [], reimTotal = 0, id = '';

						getItems.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								itemAmounts.push(doc.data());
							});
							reims.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									id = doc.id;
								});
								for(let a = 0; a < itemAmounts.length; a++){
									reimTotal = parseFloat(reimTotal) + parseFloat(itemAmounts[a].amount.replaceAll(",",""));
								}
								reimTotal = format(parseFloat(reimTotal).toFixed(2));
								dbExpense.collection("reimbursements")
								.doc(id)
								.update({
									totalAmount: reimTotal,
									dateModified: today
								}).then(() => {
									self.$swal({
										title: 'Success',
										text: 'Item updated successfully!',
										icon: 'success',
										confirmButtonColor: '#b80000',
										confirmButtonText: 'OK'
									}).then(() => {
										self.$v.editItem.$reset();
										self.$bvModal.hide('update-reim-item-modal');
										self.getReimbursement();
										self.getReimItems(1);
										self.requestProcessing = false;
									});
								});
							});
						});
					});
				}
			},
			// Show edit reimbursement transportation form
			openUpdateTransModal(row){
				this.editTrans = {
					id: row.id,
					date: row.date,
					mode: row.transportationMode,
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
				self.requestProcessing = false;
				if(!self.$v.editTrans.$error){
					self.requestProcessing = true;
					let reimId = this.$router.currentRoute.params.id;

					dbExpense.collection("reimbursementItems")
					.doc(self.editTrans.id)
					.update({
						date: self.editTrans.date,
						transportationMode: self.editTrans.mode,
						from: self.editTrans.from,
						to: self.editTrans.to,
						amount: self.editTrans.amount,
						purpose: self.editTrans.purpose,
						dateModified: today
					}).then(() => {
						let reims = dbExpense.collection("reimbursements")
							.where("reimbursementId","==",reimId);
						let getItems = dbExpense.collection("reimbursementItems")
							.where("reimbursementReference","==",reimId);
						let itemAmounts = [], reimTotal = 0, id = '';

						getItems.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								itemAmounts.push(doc.data());
							});
							reims.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									id = doc.id;
								});
								for(let a = 0; a < itemAmounts.length; a++){
									reimTotal = parseFloat(reimTotal) + parseFloat(itemAmounts[a].amount.replaceAll(",",""));
								}
								reimTotal = format(parseFloat(reimTotal).toFixed(2));
								dbExpense.collection("reimbursements")
								.doc(id)
								.update({
									totalAmount: reimTotal,
									dateModified: today
								}).then(() => {
									self.$swal({
										title: 'Success',
										text: 'Transportation updated successfully!',
										icon: 'success',
										confirmButtonColor: '#b80000',
										confirmButtonText: 'OK'
									}).then(() => {
										self.$v.editTrans.$reset();
										self.$bvModal.hide('update-trans-reim-modal');
										self.getReimbursement();
										self.getReimItems(1);
										self.getReimTrans(1);
										self.requestProcessing = false;
									});
								});
							});
						});
					});
				}
			},
			// Delete reimbursement item details
			removeItem(row){
				let self = this;
				self.$swal({
					title: 'Are you sure?',
					text: "You want to remove this item?",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#C72111',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						let reimId = this.$router.currentRoute.params.id;

						dbExpense.collection("reimbursementItems")
						.doc(row.id)
						.delete()
						.then(() => {
							let reims = dbExpense.collection("reimbursements")
								.where("reimbursementId","==",reimId);
							let getItems = dbExpense.collection("reimbursementItems")
								.where("reimbursementReference","==",reimId);
							let itemAmounts = [], reimTotal = 0, id = '';

							getItems.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									itemAmounts.push(doc.data());
								});
								reims.get().then((querySnapshot) => {
									querySnapshot.forEach((doc) => {
										id = doc.id;
									});
									for(let a = 0; a < itemAmounts.length; a++){
										reimTotal = parseFloat(reimTotal) + parseFloat(itemAmounts[a].amount.replaceAll(",",""));
									}
									reimTotal = format(parseFloat(reimTotal).toFixed(2));
									dbExpense.collection("reimbursements")
									.doc(id)
									.update({
										totalAmount: reimTotal,
										dateModified: today
									}).then(() => {
										self.$swal({
											title: 'Success',
											text: 'Item removed successfully!',
											icon: 'success',
											confirmButtonColor: '#b80000',
											confirmButtonText: 'OK'
										}).then(() => {
											self.getReimbursement();
											self.getReimItems(1);
											self.getReimTrans(1);
											self.requestProcessing = false;
										});
									});
								});
							});
						});
					}
				});
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
						let reimId = this.$router.currentRoute.params.id;

						dbExpense.collection("reimbursementItems")
						.doc(row.id)
						.delete()
						.then(() => {
							let reims = dbExpense.collection("reimbursements")
								.where("reimbursementId","==",reimId);
							let getItems = dbExpense.collection("reimbursementItems")
								.where("reimbursementReference","==",reimId);
							let itemAmounts = [], reimTotal = 0, id = '';

							getItems.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									itemAmounts.push(doc.data());
								});
								reims.get().then((querySnapshot) => {
									querySnapshot.forEach((doc) => {
										id = doc.id;
									});
									for(let a = 0; a < itemAmounts.length; a++){
										reimTotal = parseFloat(reimTotal) + parseFloat(itemAmounts[a].amount.replaceAll(",",""));
									}
									reimTotal = format(parseFloat(reimTotal).toFixed(2));
									dbExpense.collection("reimbursements")
									.doc(id)
									.update({
										totalAmount: reimTotal,
										dateModified: today
									}).then(() => {
										self.$swal({
											title: 'Success',
											text: 'Transportation removed successfully!',
											icon: 'success',
											confirmButtonColor: '#b80000',
											confirmButtonText: 'OK'
										}).then(() => {
											self.getReimbursement();
											self.getReimItems(1);
											self.getReimTrans(1);
											self.requestProcessing = false;
										});
									});
								});
							});
						});
					}
				});
			},
			// Show edit reimbursement form
			openUpdateReim(reim){
				let self = this;

				self.editReim = {
					id: reim.id,
					processDate: reim.processDate,
					status: reim.status,
					company: reim.companyReference,
					remarks: reim.remarks
				}
				self.$bvModal.show('update-modal');
			},
			// Change reimbursement details
			updateReim(){
				let self = this, month = '', date = '', addError = false;

				if(self.editReim.status != 1 && self.editReim.status != 0){
					date = self.editReim.processDate;
					month = moment(self.editReim.processDate).format("YYYY-MM");
				}
				self.$v.editReim.$touch();
				self.requestProcessing = false;
				if(self.editReim.status == 2){
					if(self.$v.editReim.processDate.$error){
						addError = true;
					}
					self.editReim.remarks = '';
				}else if(self.editReim.status == 0){
					if(self.$v.editReim.remarks.$error){
						addError = true;
					}
				}else if(self.editReim.status == 1){
					self.editReim.remarks = '';
				}
				if(!addError){
					self.requestProcessing = true;
					dbExpense.collection("reimbursements")
					.doc(self.editReim.id)
					.update({
						processDate: date,
						monthOf: month,
						status: self.editReim.status,
						companyReference: self.editReim.company,
						remarks: self.editReim.remarks,
						dateModified: today
					}).then(() => {
						self.$swal({
							title: 'Success',
							text: 'Reimbursement updated successfully!',
							icon: 'success',
							confirmButtonColor: '#b80000',
							confirmButtonText: 'OK'
						}).then(() => {
							self.$v.editReim.$reset();
							self.$bvModal.hide('update-modal');
							self.getReimbursement();
							self.getReimItems(1);
							self.getReimTrans(1);
							self.requestProcessing = false;
						});
					});
				}
			},
			// Close view reimbursement page
			cancelView(){
				this.$router.push("/reimbursement");
			},
			// Get company details
			getCompany(){
				let self = this, data = [];
				let companyData = dbMains.collection("companyProfile");

				self.company = [];
				companyData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						data.push(doc.data());
					});
					self.company = {
						name: data[0].name,
						address: data[0].address
					}
				});
			},
			// Get departments details
			getDepartments(){
				let self = this;
				let departmentData = dbUsers.collection("departments")
					.orderBy("departmentName", "asc");

				self.departments = [];
				departmentData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.departments.push(doc.data());
					});
				});
			},
			// Get user details
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
			// Print reimbursement details
			printReim(){
				// printJS({
				// 	printable: 'viewSummary',
				// 	type: 'html',
				// 	style: '#viewSummary {font-family: "Calibri";} #particularStyle {text-align: center;} #particular {text-align: center;} #centerStyle {text-align: center;} #headerStyle {text-align: center; padding-top: 20px;} #borderStyle {border-width: 1px; border-style: solid;} #attachmentStyle {padding-top: 50px;}',
				// 	documentTitle: 'Reimbursement'
				// });
				this.$htmlToPaper('viewSummary');
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