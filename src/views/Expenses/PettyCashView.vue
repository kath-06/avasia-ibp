<template>
	<div id="textStyle"> 
		<base-header class="pb-6 pb-8 pt-5"></base-header>     
		<div class="col-12 container-fluid mt--7">
			<!-- Petty cash details for current status -->
			<card>
				<div class="row pl-4">
					<span class="col-sm-12">
						<b>Petty Cash No. {{pettyCash.pettyCashNumber}}</b>
						<b v-if="pettyCash.status == 1"> (Current)</b>
						<b v-if="pettyCash.status == 2"> (Checked)</b>
						<b v-if="pettyCash.status == 3"> (Processed)</b>
					</span>
				</div>
				<hr>
				<div class="row pl-4 pt-2">
					<span class="col-sm-6">
						<b>Date:</b> {{pettyCash.pettyCashDate | moment("MMMM DD, YYYY")}}
					</span>
					<span class="col-sm-6">
						<b>Department:</b> {{pettyCash.department}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>To:</b> {{pettyCash.name}}
					</span>
					<span class="col-sm-6">
						<b>From:</b> {{pettyCash.from}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Amount Received:</b> ₱ {{pettyCash.amountReceive}}
					</span>
					<span class="col-sm-6">
						<b>Total Petty Cash:</b> {{pettyCash.totalPetty == '' ? '----------' : '₱ ' + pettyCash.totalPetty}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>Type:</b> {{pettyCash.pettyType}}
					</span>
					<span class="col-sm-6">
						<b>Received By:</b> {{pettyCash.receivedBy}}
					</span>
				</div>
				<div class="row pl-4">
					<span class="col-sm-6"
						v-if="pettyCash.checkReference != ''">
						<b>Check No.:</b> {{pettyCash.checkNumber}}
					</span>
				</div>
				<hr class="mt-2 mb-2">
				<div class="row pl-4">
					<span class="col-sm-6">
						<b>CASH ON HAND:</b> ₱ {{pettyCash.cashOnHand}}
					</span>
					<span class="col-sm-6">
						<b>Liquidation Amount:</b> ₱ {{liquidateAmount}}
					</span>
				</div>
				<hr class="mt-2 mb-2">
				<div class="row pl-4"
					v-if="pettyCash.status == 3">
					<span class="col-sm-6">
						<b>Prepared by:</b> {{pettySignatory.prepared || preparedBy}}
					</span>
					<span class="col-sm-6">
						<b>Checked by:</b> {{pettySignatory.checked}}
					</span>
				</div>
				<div class="row pl-4"
					v-if="pettyCash.status == 3">
					<span class="col-sm-6">
						<b>Approved by:</b> {{pettySignatory.approved}}
					</span>
				</div>
				<hr class="mb-1">
				<div class="text-left pl-2">
					<h2 class="display-5"
						id="sideBarTxt">Liquidations</h2>
				</div>       
				<div class="table-full-width pt-2">
					<vue-good-table :columns="columns"
						:rows="liquidationList"
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
							<span v-if="props.column.field == 'name'">
								<span v-for="emp in employees"
									v-bind:key="emp.userId">
									<span v-if="emp.userId == props.row.nameReference">{{emp.name}}</span>
								</span>
							</span>
							<span v-if="props.column.field == 'particular'">
								<span id="particular">{{props.row.particular}}</span>
							</span>
							<span v-if="props.column.field == 'amountReceived'">
								<span id="particular">₱ {{props.row.amountReceived}}</span>
							</span>
							<span v-if="props.column.field == 'totalAmount'">
								<span id="particular">₱ {{props.row.totalAmount}}</span>
							</span>
							<span v-if="props.column.field == 'returnAmount'">
								<span id="particular">₱ {{props.row.returnAmount}}</span>
							</span>
							<span v-if="props.column.field == 'action'">
								<span class="pointer ml-2 fa fa-file"
									id="sideBarTxt"
									v-on:click="openAttachments(props.row)"
									title="Attachment"></span>
								<span class="pointer ml-2 far fa-edit"
									id="sideBarTxt"
									v-on:click="openUpdateLiquidateModal(props.row)"
									v-if="pettyCash.status == 1"
									title="Update"></span>
								<span class="pointer ml-2 far fa-times-circle text-red"
									v-on:click="removeLiquidation(props.row)"
									v-if="pettyCash.status == 1"
									title="Remove"></span>
							</span></b>
						</template>
					</vue-good-table>
				</div>
				<hr class="mt-2 mb-2">
				<div class="row pl-4" v-if="userRole != 'Administrator'">
					<div class="col-6"></div>
					<div class="col-3"
						v-if="pettyCash.status != 2"></div>
					<div class="col-3"
						v-if="pettyCash.status == 2 | pettyCash.status == 3">
						<base-button @click.native="printLiqui()"
							id="darkBtn" block>Print</base-button>
					</div>
					<div class="col-3">
						<base-button @click.native="closePetty"
							id="darkBtn" block>Close</base-button>
					</div>
				</div>
				<div class="row pl-4"
					v-if="userRole == 'Administrator'">
					<div class="col-3"
						v-if="pettyCash.status == 3"></div>
					<div class="col-3"
						v-if="pettyCash.status == 1">
						<base-button @click.native="openAddLiquidationModal()"
							id="darkBtn" block>Add Liquidation</base-button>
					</div>
					<div class="col-3"
						v-if="pettyCash.status == 1">
						<base-button @click.native="openUpdatePettyModal(pettyCash)"
							id="darkBtn" block>Update</base-button>
					</div>
					<div class="col-3"
						v-if="pettyCash.status == 2 | pettyCash.status == 3">
						<base-button @click.native="printLiqui()"
							id="darkBtn" block>Print</base-button>
					</div>
					<div class="col-3"
						v-if="pettyCash.status == 2">
						<base-button @click.native="changeStatus(pettyCash, 1)"
							id="darkBtn" block>Current</base-button>
					</div>
					<div class="col-3"
						v-if="pettyCash.status == 1 || pettyCash.status == 3">
						<base-button @click.native="changeStatus(pettyCash, 2)"
							id="darkBtn" block>Checked</base-button>
					</div>
					<div class="col-3"
						v-if="pettyCash.status == 2">
						<base-button @click.native="changeStatus(pettyCash, 3)"
							id="darkBtn" block>Processed</base-button>
					</div>
					<div class="col-3">
						<base-button @click.native="closePetty"
							id="darkBtn" block>Close</base-button>
					</div>
				</div>
			</card>
			<!-- Petty cash details for checked and processed status -->
			<div id="viewSummary"
				v-if="pettyCash.status == 3 | pettyCash.status == 2"
				class="col-10">
				<card class="pl-4 pt-2 pb-5 shadow">
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
					<div class="row pt-4 pb-2"
						id="headerStyle">
						<span class="col-sm-12 text-center">
							<b>Liquidation</b><br>
							<b>{{pettyCash.department}}</b>
						</span>
					</div>
					<div class="row">
						<span class="col-sm-6">
							<b>Petty Cash No.:</b> {{pettyCash.pettyCashNumber}}
						</span>
						<div class="col-sm-2"></div>
						<span class="col-sm-4">
							<b>Date:</b> {{pettyCash.pettyCashDate | moment("MMMM DD, YYYY")}}
						</span>
					</div>
					<div class="row">
						<span class="col-sm-6">
							<b>To:</b> {{pettyCash.name}}
						</span>
						<div class="col-sm-2"></div>
						<span class="col-sm-4">
							<b>From:</b> {{pettyCash.from}}
						</span>
					</div>
					<div class="row">
						<span class="col-sm-6">
							<b>Type:</b> {{pettyCash.pettyType}}
						</span>
						<div class="col-sm-2"></div>
						<span class="col-sm-4"
							v-if="pettyCash.checkReference != ''">
							<b>Check No.:</b> {{pettyCash.checkNumber}}
						</span>
					</div>
					<div class="row">
						<span class="col-sm-6"
							v-if="pettyCash.receivedBy != ''">
							<b>Received By:</b> {{pettyCash.receivedBy}}
						</span>
					</div>
					<hr class="mt-2">
					<div class="row pb-0 text-center pl-4 pr-4"
						id="particularStyle"
						v-if="liquidations.length != 0">
						<span class="col-sm-2"
							id="borderStyle">
							<span><b>Date</b></span>
						</span>
						<span class="col-sm-2"
							id="borderStyle">
							<span><b>Name</b></span>
						</span>
						<span class="col-sm-5"
							id="borderStyle">
							<span><b>Particular</b></span>
						</span>
						<span class="col-sm-3"
							id="borderStyle">
							<span><b>Total Amount</b></span>
						</span>
					</div>
					<div class="row pl-4 pr-4 text-center"
						v-for="liqui in liquidations"
						v-bind:key="liqui.pettyLiquidationId"
						id="particularStyle">
						<span class="col-sm-2"
							id="borderStyle">
							<span>{{liqui.date | moment("MMM DD, YYYY")}}</span>
						</span>
						<span class="col-sm-2"
							id="borderStyle">
							<span v-for="emp in employees"
								v-bind:key="emp.userId">
								<span v-if="emp.userId == liqui.nameReference">{{emp.name}}</span>
							</span>
						</span>
						<span class="col-sm-5"
							id="borderStyle">
							<span>{{liqui.particular}}</span>
						</span>
						<span class="col-sm-3"
							id="borderStyle">
							<span>₱ {{liqui.totalAmount}}</span>
						</span>
					</div>
					<hr class="mt-4">
					<div class="row">
						<span class="col-sm-12">
							<b>Total Petty Cash:</b> ₱ {{pettyCash.totalPetty}}
						</span>
					</div>
					<div class="row">
						<span class="col-sm-12">
							<b>Total Liquidation:</b> ₱ {{liquidateAmount}}
						</span>
					</div>
					<div class="row">
						<span class="col-sm-12">
							<b>Balance:</b> ₱ {{pettyCash.cashOnHand}}
						</span>
					</div>
					<div class="row">
						<span class="col-sm-12">
							<b>Total Requested Amount:</b> ₱ {{totalRequestedAmount}}
						</span>
					</div><br><br><br>
					<div class="row">
						<span class="col-sm-12">{{pettySignatory.prepared || preparedBy}}</span>
					</div>
					<div class="row">
						<span class="col-sm-12">
							<b>Prepared by</b>
						</span>
					</div><br>
					<div class="row">
						<span class="col-sm-12">{{pettySignatory.checked}}</span>
					</div>
					<div class="row">
						<span class="col-sm-12">
							<b>Checked by</b>
						</span>
					</div><br>
					<div class="row">
						<span class="col-sm-12">{{pettySignatory.approved}}</span>
					</div>
					<div class="row">
						<span class="col-sm-12">
							<b>Approved by</b>
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
		</div>
		<!-- UPDATE PETTY CASH MODAL -->
		<b-modal size="xl"
			id="update-petty-cash-modal"
			title="Update Petty Cash" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Departments:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="pettyEdit.date"
						type="date"
						id="inputStyle"
						:max="maxDate"></base-input>
					<i class="text-red"
						v-if="$v.pettyEdit.$anyDirty && !$v.pettyEdit.date.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="departments"
						:reduce="department => department.departmentUid"
						label="departmentName"
						v-model="pettyEdit.department"
						:clearable="false"
						@input="getNames(pettyEdit.department,'edit')"></v-select>
					<i class="text-red"
						v-if="$v.pettyEdit.$anyDirty && !$v.pettyEdit.department.required">Field Required</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>To:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>From:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5"
					v-if="names.length != 0">
					<v-select id="inputStyle"
						:options="names"
						:reduce="name => name.userId"
						label="name"
						v-model="pettyEdit.to"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.pettyEdit.$anyDirty && !$v.pettyEdit.to.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5"
					v-if="names.length == 0">
					<span class="text-red">No Employee</span>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="pettyEdit.from"
						type="text"
						placeholder="From"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.pettyEdit.$anyDirty && !$v.pettyEdit.from.required">Field Required</i>
					<i class="text-red"
						v-if="$v.pettyEdit.$anyDirty && !$v.pettyEdit.from.alphaCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Amount Received:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Total Petty Cash:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="pettyEdit.amount"
						type="text"
						placeholder="Amount Received"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.pettyEdit.$anyDirty && !$v.pettyEdit.amount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.pettyEdit.$anyDirty && !$v.pettyEdit.amount.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="pettyEdit.totalPetty"
						type="text"
						placeholder="Total Petty Cash"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.pettyEdit.$anyDirty && !$v.pettyEdit.totalPetty.amountCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Type:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Received by:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="types"
						:reduce="type => type.typeId"
						label="typeName"
						v-model="pettyEdit.type"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.pettyEdit.$anyDirty && !$v.pettyEdit.type.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="pettyEdit.receivedBy"
						type="text"
						placeholder="Received by"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.pettyEdit.$anyDirty && !$v.pettyEdit.receivedBy.alphaCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label"
					v-if="pettyEdit.type == 'check'">
					<b>Check No:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-4 pl-5"	
					v-if="pettyEdit.type == 'check'">
					<base-input v-model="pettyEdit.checkNumber"
						id="inputStyle"
						type="text"
						placeholder="Check Number"
						class="mb-0"
						@input="clearCheck"></base-input>
					<i class="text-red"
						v-if="$v.pettyEdit.$anyDirty && !$v.pettyEdit.checkNumber.required">Field Required</i>
					<i class="text-red"
						v-if="$v.pettyEdit.$anyDirty && !$v.pettyEdit.checkNumber.numCustomValidator">Invalid Characters</i>
				</div>
				<div class=" col-sm-2 pr-5"
					v-if="pettyEdit.type == 'check'">
					<base-button block id="darkBtn"
						v-b-modal.choose-check-number-modal
						:disabled="requestProcessing">Choose</base-button>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="editPettyCash()"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Update
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('update-petty-cash-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
        </b-modal>
        <!-- CHOOSE CHECK NUMBER MODAL -->
        <b-modal size="lg"
			id="choose-check-number-modal"
			title="Choose Check Number" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Bank Name:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Bank Account:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<v-select id="inputStyle"
						:options="banks"
						:reduce="bank => bank.bankUid"
						label="bank"
						v-model="bank"
						@input="getBankAccounts(bank)"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.bank.$anyDirty && !$v.bank.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5"
					v-if="bankAccounts == ''">
					<span class="text-red">No Bank Account</span>
				</div>
				<div class="col-sm-6 pl-5 pr-5" v-else>
					<v-select id="inputStyle"
						:options="bankAccounts"
						:reduce="bankAccount => bankAccount.bankAccountUid"
						label="bankAccountNumber"
						v-model="bankAccount"
						@input="getCheckSeries(bank, bankAccount)"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.bankAccount.$anyDirty && !$v.bankAccount.required">Field Required</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Check Series:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Check Number:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5"
					v-if="checkSeries == '' || bankAccounts == ''">
					<span class="text-red">No Check Series</span>
				</div>
				<div class="col-sm-6 pl-5 pr-5" v-else>
					<v-select input="inputStyle"
						:options="checkSeries"
						:reduce="series => series.bankCheckSeriesUid"
						label="bankCheckSeries"
						v-model="series"
						@input="getCheckNumber(bank, bankAccount, series, 'used')"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.series.$anyDirty && !$v.series.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5"
					v-if="checkSeries == '' || bankAccounts == '' || checkNumbers == ''">
					<span class="text-red">No Check Number</span>
				</div>
				<div class="col-sm-6 pl-5 pr-5" v-else>
					<v-select id="inputStyle"
						:options="checkNumbers"
						:reduce="checkNumber => checkNumber.checkNumber"
						label="checkNumber"
						v-model="checkNumber"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.checkNumber.$anyDirty && !$v.checkNumber.required">Field Required</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="chooseCheckNumber"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							OK
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('choose-check-number-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- ADD LIQUIDATION MODAL -->
		<b-modal size="xl"
			id="add-liquidation-modal"
			title="Add Liquidation" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Name:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5"
					v-if="employees.length != 0">
					<v-select id="inputStyle"
						:options="employees"
						:reduce="emp => emp.userId"
						label="name"
						v-model="liquidate.name"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.liquidate.$anyDirty && !$v.liquidate.name.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="liquidate.date"
						type="date"
						id="inputStyle"
						:max="maxDate"></base-input>
					<i class="text-red"
						v-if="$v.liquidate.$anyDirty && !$v.liquidate.date.required">Field Required</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Amount Received:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Total Amount:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="liquidate.amountReceived"
						type="text"
						placeholder="Amount Received"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.liquidate.$anyDirty && !$v.liquidate.amountReceived.required">Field Required</i>
					<i class="text-red"
						v-if="$v.liquidate.$anyDirty && !$v.liquidate.amountReceived.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="liquidate.totalAmount"
						type="text"
						placeholder="Total Amount"
						id="inputStyle"
						disabled></base-input>
					<i class="text-red"
						v-if="$v.liquidate.$anyDirty && !$v.liquidate.totalAmount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.liquidate.$anyDirty && !$v.liquidate.totalAmount.amountCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Return Amount:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="liquidate.returnAmount"
						type="text"
						placeholder="Return Amount"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.liquidate.$anyDirty && !$v.liquidate.returnAmount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.liquidate.$anyDirty && !$v.liquidate.returnAmount.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-2 pl-5">
					<base-button id="darkBtn" block
						@click.native="openItemModal(liquidateDesc)"
						:disabled="requestProcessing">Add Item</base-button>
				</div>
				<div class="col-sm-4 pl-2 pr-5"
					v-if="descs.length != 0">
					<v-select id="inputStyle"
						:options="descs"
						:reduce="desc => desc.liquidationDescId"
						label="description"
						v-model="liquidateDesc"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.liquidateDesc.$anyDirty && !$v.liquidateDesc.required">Field Required</i>
				</div>
			</div>
			<hr class="mb-1">
			<div class="card-header bg-transparent pb-1">
				<div class="text-left">
					<h2 class="display-5"
						id="sideBarTxt">Particulars</h2>
				</div>       
			</div>
			<div class="table-full-width pt-2">
				<paper-table  type="hover"
					:loading="false"
					:loadError="loadError"
					:title="itemsTable.title"
					:sub-title="itemsTable.subTitle"
					:data="tbItems"
					:columns="itemsTable.columns">
					<template slot-scope="{ row }">
						<td>{{row.id}}</td>
						<td>{{row.date | moment('MMM DD, YYYY')}}</td>
						<td>
							<span id="particular">{{row.particular}}</span>
						</td>
						<td>₱ {{row.amount}}</td>
						<td>
							<span v-for="desc in descs"
								v-bind:key="desc.liquidationDescId" >
								<span v-if="desc.liquidationDescId == row.desc">{{desc.description}}</span>
							</span>
						</td>
						<td>
							<span id="particular">{{row.refNo}}</span>
						</td>
						<td align="right">
							<span class="pointer ml-2 far fa-times-circle text-red"
								v-on:click="removeItem(row)"
								v-if="row.rowNum != ''"
								title="Remove"></span>
						</td>
					</template>
				</paper-table>
			</div>
			<hr v-if="itemList.length">
			<div class="row pl-4"
				v-if="itemList.length">
				<div class="col-8">
					<span class="pagination-results">{{itemList[itemList.length - 1].id}} of {{itemsCount}}</span>
				</div>
				<pagination :searching="false"
					:searchTotalPage="itemList"
					:totalPages="itemsCount"
					:currentPage="currentItemPage"
					@pagechanged="onItemPageChange"></pagination>
			</div>
			<hr class="mb-1">
			<div class="card-header bg-transparent pb-1">
				<div class="text-left">
					<h2 class="display-5"
						id="sideBarTxt">Transportations</h2>
				</div>       
			</div>
			<div class="table-full-width pt-2">
				<paper-table type="hover"
					:loading="false"
					:loadError="loadError"
					:title="transTable.title"
					:sub-title="transTable.subTitle"
					:data="tbTrans"
					:columns="transTable.columns">
					<template slot-scope="{ row }">
						<td>{{row.id}}</td>
						<td>{{row.date | moment('MMM DD, YYYY')}}</td>
						<td>₱ {{row.amount}}</td>
						<td>
							<span v-for="desc in descs"
								v-bind:key="desc.liquidationDescId" >
								<span v-if="desc.liquidationDescId == row.desc">{{desc.description}}</span>
							</span>
						</td>
						<td>
							<span id="particular">{{row.from}}</span>
						</td>
						<td>
							<span id="particular">{{row.to}}</span>
						</td>
						<td>
							<span id="particular">{{row.mode}}</span>
						</td>
						<td>
							<span id="particular">{{row.purpose}}</span>
						</td>
						<td>
							<span id="particular">{{row.refNo}}</span>
						</td>
						<td align="right">
							<span class="pointer ml-2 far fa-times-circle text-red"
								v-on:click="removeTrans(row)"
								v-if="row.rowNum != ''"
								title="Remove"></span>
						</td>
					</template>
				</paper-table>
			</div>
			<hr v-if="transList.length">
			<div class="row pl-4"
				v-if="transList.length">
				<div class="col-8">
					<span class="pagination-results">{{transList[transList.length - 1].id}} of {{transCount}}</span>
				</div>
				<pagination :searching="false"
					:searchTotalPage="transList"
					:totalPages="transCount"
					:currentPage="currentTransPage"
					@pagechanged="onTransPageChange"></pagination>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addLiquidation"
							:disabled="requestProcessing"
							v-if="itemList.length != 0 | transList.length != 0">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('add-liquidation-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- EDIT LIQUIDATION MODAL -->
		<b-modal size="xl"
			id="update-liquidation-modal"
			title="Update Liquidation" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Name:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5"
					v-if="employees.length != 0">
					<v-select id="inputStyle"
						:options="employees"
						:reduce="emp => emp.userId"
						label="name"
						v-model="editLiquidate.name"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.editLiquidate.$anyDirty && !$v.editLiquidate.name.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editLiquidate.date"
						type="date"
						id="inputStyle"
						:max="maxDate"></base-input>
					<i class="text-red"
						v-if="$v.editLiquidate.$anyDirty && !$v.editLiquidate.date.required">Field Required</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Amount Received:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Total Amount:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editLiquidate.amountReceived"
						type="text"
						placeholder="Amount Received"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.editLiquidate.$anyDirty && !$v.editLiquidate.amountReceived.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editLiquidate.$anyDirty && !$v.editLiquidate.amountReceived.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editLiquidate.totalAmount"
						type="text"
						placeholder="Total Amount"
						id="inputStyle"
						disabled></base-input>
					<i class="text-red"
						v-if="$v.editLiquidate.$anyDirty && !$v.editLiquidate.totalAmount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editLiquidate.$anyDirty && !$v.editLiquidate.totalAmount.amountCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Return Amount:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editLiquidate.returnAmount"
						type="text"
						placeholder="Return Amount"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.editLiquidate.$anyDirty && !$v.editLiquidate.returnAmount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editLiquidate.$anyDirty && !$v.editLiquidate.returnAmount.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-2 pl-5">
					<base-button id="darkBtn" block
						@click.native="editLiquiItemModal(liquidateDesc)"
						:disabled="requestProcessing">Add Item</base-button>
				</div>
				<div class="col-sm-4 pl-2 pr-5"
					v-if="descs.length != 0">
					<v-select id="inputStyle"
						:options="descs"
						:reduce="desc => desc.liquidationDescId"
						label="description"
						v-model="liquidateDesc"
						:clearable="false"></v-select>
					<i class="text-red"
						v-if="$v.liquidateDesc.$anyDirty && !$v.liquidateDesc.required">Field Required</i>
				</div>
			</div>
			<hr class="mb-1">
			<div class="card-header bg-transparent pb-1">
				<div class="text-left">
					<h2 class="display-5"
						id="sideBarTxt">Particulars</h2>
				</div>       
			</div>
			<div class="table-full-width pt-2">
				<paper-table type="hover"
					:loading="false"
					:loadError="loadError"
					:title="itemsTable.title"
					:sub-title="itemsTable.subTitle"
					:data="tbEditItems"
					:columns="itemsTable.columns">
					<template slot-scope="{ row }">
						<td>{{row.rowNum}}</td>
						<td>{{row.date | moment('MMM DD, YYYY')}}</td>
						<td>
							<span id="particular">{{row.particular}}</span>
						</td>
						<td>₱ {{row.amount}}</td>
						<td>
							<span v-for="desc in descs"
								v-bind:key="desc.liquidationDescId" >
								<span v-if="desc.liquidationDescId == row.descriptionReference">{{desc.description}}</span>
							</span>
						</td>
						<td>
							<span id="particular">{{row.referenceNumber}}</span>
						</td>
						<td align="right">
							<span class="pointer ml-2 far fa-edit"
								id="sideBarTxt"
								v-on:click="openUpdateItemModal(row)"
								title="Update"></span>
							<span class="pointer ml-2 far fa-times-circle text-red"
								v-on:click="removeLiquidateItem(row)"
								title="Remove"></span>
						</td>
					</template>
				</paper-table>
			</div>
			<hr v-if="itemEditList.length">
			<div class="row pl-4"
				v-if="itemEditList.length">
				<div class="col-8">
					<span class="pagination-results">{{itemEditList[itemEditList.length - 1].rowNum}} of {{itemsEditCount}}</span>
				</div>
				<pagination :searching="false"
					:searchTotalPage="itemEditList"
					:totalPages="itemsEditCount"
					:currentPage="currentItemEditPage"
					@pagechanged="onUpdateItemPageChange"></pagination>
			</div>
			<hr class="mb-1">
			<div class="card-header bg-transparent pb-1">
				<div class="text-left">
					<h2 class="display-5"
						id="sideBarTxt">Transportations</h2>
				</div>       
			</div>
			<div class="table-full-width pt-2">
				<paper-table type="hover"
					:loading="false"
					:loadError="loadError"
					:title="transTable.title"
					:sub-title="transTable.subTitle"
					:data="tbEditTrans"
					:columns="transTable.columns">
					<template slot-scope="{ row }">
						<td>{{row.rowNum}}</td>
						<td>{{row.date | moment('MMM DD, YYYY')}}</td>
						<td>₱ {{row.amount}}</td>
						<td>
							<span v-for="desc in descs"
								v-bind:key="desc.liquidationDescId" >
								<span v-if="desc.liquidationDescId == row.descriptionReference">{{desc.description}}</span>
							</span>
						</td>
						<td>
							<span id="particular">{{row.from}}</span>
						</td>
						<td>
							<span id="particular">{{row.to}}</span>
						</td>
						<td>
							<span id="particular">{{row.transportationMode}}</span>
						</td>
						<td>
							<span id="particular">{{row.purpose}}</span>
						</td>
						<td>
							<span id="particular">{{row.referenceNumber}}</span>
						</td>
						<td align="right">
							<span class="pointer ml-2 far fa-edit"
								id="sideBarTxt"
								v-on:click="openUpdateTransModal(row)"
								title="Update"></span>
							<span class="pointer ml-2 far fa-times-circle text-red"
								v-on:click="removeLiquidateTrans(row)"
								title="Remove"></span>
						</td>
					</template>
				</paper-table>
			</div>
			<hr v-if="transEditList.length">
			<div class="row pl-4"
				v-if="transEditList.length">
				<div class="col-8">
					<span class="pagination-results">{{transEditList[transEditList.length - 1].rowNum}} of {{transEditCount}}</span>
				</div>
				<pagination :searching="false"
					:searchTotalPage="transEditList"
					:totalPages="transEditCount"
					:currentPage="currentTransEditPage"
					@pagechanged="onUpdateTransPageChange"></pagination>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="updateLiquidation"
							:disabled="requestProcessing"
							v-if="itemEditList.length != 0 | transEditList.length != 0">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Update
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('update-liquidation-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- ADD ITEM MODAL -->
		<b-modal size="lg"
			id="add-item-modal"
			title="Add Item"
			centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Particular:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="items.date"
						type="date"
						id="inputStyle"
						:max="maxDate"></base-input>
					<i class="text-red"
						v-if="$v.items.$anyDirty && !$v.items.date.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="items.particular"
						type="text"
						placeholder="Particular"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.items.$anyDirty && !$v.items.particular.required">Field Required</i>
					<i class="text-red"
						v-if="$v.items.$anyDirty && !$v.items.particular.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Amount:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Reference No.:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="items.amount"
						type="text"
						placeholder="Amount"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.items.$anyDirty && !$v.items.amount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.items.$anyDirty && !$v.items.amount.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="items.refNo"
						type="text"
						placeholder="Reference No."
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.items.$anyDirty && !$v.items.refNo.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addItem"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('add-item-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- LIQUIDATION ADD ITEM MODAL -->
		<b-modal size="lg"
			id="liquidation-add-item-modal"
			title="Add Item" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Particular:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="addItems.date"
						type="date"
						id="inputStyle"
						:max="maxDate"></base-input>
					<i class="text-red"
						v-if="$v.addItems.$anyDirty && !$v.addItems.date.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="addItems.particular"
						type="text"
						placeholder="Particular"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.addItems.$anyDirty && !$v.addItems.particular.required">Field Required</i>
					<i class="text-red"
						v-if="$v.addItems.$anyDirty && !$v.addItems.particular.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Amount:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Reference No.:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="addItems.amount"
						type="text"
						placeholder="Amount"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.addItems.$anyDirty && !$v.addItems.amount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.addItems.$anyDirty && !$v.addItems.amount.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="addItems.refNo"
						type="text"
						placeholder="Reference No."
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.addItems.$anyDirty && !$v.addItems.refNo.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addLiquidateItem"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('liquidation-add-item-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- LIQUIDATION EDIT ITEM MODAL -->
		<b-modal size="lg"
			id="liquidation-edit-item-modal"
			title="Edit Item" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Particular:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editItems.date"
						type="date"
						id="inputStyle"
						:max="maxDate"></base-input>
					<i class="text-red"
						v-if="$v.editItems.$anyDirty && !$v.editItems.date.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editItems.particular"
						type="text"
						placeholder="Particular"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.editItems.$anyDirty && !$v.editItems.particular.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editItems.$anyDirty && !$v.editItems.particular.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Amount:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Reference No.:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editItems.amount"
						type="text"
						placeholder="Amount"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.editItems.$anyDirty && !$v.editItems.amount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editItems.$anyDirty && !$v.editItems.amount.amountCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editItems.refNo"
						type="text"
						placeholder="Reference No."
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.editItems.$anyDirty && !$v.editItems.refNo.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="editLiquidateItem"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Update
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('liquidation-edit-item-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- ADD TRANSPORTATION MODAL -->
		<b-modal size="lg"
			id="add-trans-modal"
			title="Add Transportation" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Amount:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="trans.date"
						type="date"
						id="inputStyle"
						:max="maxDate"></base-input>
					<i class="text-red"
						v-if="$v.trans.$anyDirty && !$v.trans.date.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="trans.amount"
						type="text"
						placeholder="Amount"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.trans.$anyDirty && !$v.trans.amount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.trans.$anyDirty && !$v.trans.amount.amountCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Transportation Mode:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Purpose:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="trans.mode"
						type="text"
						placeholder="Transportation Mode"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.trans.$anyDirty && !$v.trans.mode.required">Field Required</i>
					<i class="text-red"
						v-if="$v.trans.$anyDirty && !$v.trans.mode.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="trans.purpose"
						type="text"
						placeholder="Purpose"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.trans.$anyDirty && !$v.trans.purpose.required">Field Required</i>
					<i class="text-red"
						v-if="$v.trans.$anyDirty && !$v.trans.purpose.alphaNumCustomValidator">Invalid Characters</i>
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
						v-model="trans.from"
						id="inputStyle"
						placeholder="From"></textarea>
					<i class="text-red"
						v-if="$v.trans.$anyDirty && !$v.trans.from.required">Field Required</i>
					<i class="text-red"
						v-if="$v.trans.$anyDirty && !$v.trans.from.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<textarea rows="4"
						cols="39"
						v-model="trans.to"
						id="inputStyle"
						placeholder="To"></textarea>
					<i class="text-red"
						v-if="$v.trans.$anyDirty && !$v.trans.to.required">Field Required</i>
					<i class="text-red"
						v-if="$v.trans.$anyDirty && !$v.trans.to.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Reference No.:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="trans.refNo"
						type="text"
						placeholder="Reference No."
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.trans.$anyDirty && !$v.trans.refNo.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addTrans"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('add-trans-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- LIQUDATION ADD TRANSPORTATION MODAL -->
		<b-modal size="lg"
			id="liquidation-add-trans-modal"
			title="Add Transportation" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Amount:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="addTran.date"
						type="date"
						id="inputStyle"
						:max="maxDate"></base-input>
					<i class="text-red"
						v-if="$v.addTran.$anyDirty && !$v.addTran.date.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="addTran.amount"
						type="text"
						placeholder="Amount"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.addTran.$anyDirty && !$v.addTran.amount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.addTran.$anyDirty && !$v.addTran.amount.amountCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Transportation Mode:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Purpose:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="addTran.mode"
						type="text"
						placeholder="Tranportation Mode"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.addTran.$anyDirty && !$v.addTran.mode.required">Field Required</i>
					<i class="text-red"
						v-if="$v.addTran.$anyDirty && !$v.addTran.mode.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="addTran.purpose"
						type="text"
						placeholder="Purpose"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.addTran.$anyDirty && !$v.addTran.purpose.required">Field Required</i>
					<i class="text-red"
						v-if="$v.addTran.$anyDirty && !$v.addTran.purpose.alphaNumCustomValidator">Invalid Characters</i>
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
						v-model="addTran.from"
						id="inputStyle"
						placeholder="From"></textarea>
					<i class="text-red"
						v-if="$v.addTran.$anyDirty && !$v.addTran.from.required">Field Required</i>
					<i class="text-red"
						v-if="$v.addTran.$anyDirty && !$v.addTran.from.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<textarea rows="4"
						cols="39"
						v-model="addTran.to"
						id="inputStyle"
						placeholder="To"></textarea>
					<i class="text-red"
						v-if="$v.addTran.$anyDirty && !$v.addTran.to.required">Field Required</i>
					<i class="text-red"
						v-if="$v.addTran.$anyDirty && !$v.addTran.to.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Reference No.:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="addTran.refNo"
						type="text"
						placeholder="Reference No."
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.addTran.$anyDirty && !$v.addTran.refNo.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="addLiquidateTrans"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Add
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('liquidation-add-trans-modal')"
							:disabled="requestProcessing">Close</base-button>
					</div>
				</div>
			</template>
		</b-modal>
		<!-- LIQUDATION EDIT TRANSPORTATION MODAL -->
		<b-modal size="lg"
			id="liquidation-edit-trans-modal"
			title="Edit Transportation" centered
			:hide-header-close="true"
			:no-close-on-backdrop="true"
			:no-close-on-esc="true">
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Date:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Amount:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editTran.date"
						type="date"
						id="inputStyle"
						:max="maxDate"></base-input>
					<i class="text-red"
						v-if="$v.editTran.$anyDirty && !$v.editTran.date.required">Field Required</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editTran.amount"
						type="text"
						placeholder="Amount"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.editTran.$anyDirty && !$v.editTran.amount.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editTran.$anyDirty && !$v.editTran.amount.amountCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Transportation Mode:</b>
					<b class="text-red">*</b>
				</label>
				<label class="col-sm-6 col-form-label">
					<b>Purpose:</b>
					<b class="text-red">*</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editTran.mode"
						type="text"
						placeholder="Tranportation Mode"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.editTran.$anyDirty && !$v.editTran.mode.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editTran.$anyDirty && !$v.editTran.mode.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editTran.purpose"
						type="text"
						placeholder="Purpose"
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.editTran.$anyDirty && !$v.editTran.purpose.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editTran.$anyDirty && !$v.editTran.purpose.alphaNumCustomValidator">Invalid Characters</i>
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
						v-model="editTran.from"
						id="inputStyle"
						placeholder="From"></textarea>
					<i class="text-red"
						v-if="$v.editTran.$anyDirty && !$v.editTran.from.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editTran.$anyDirty && !$v.editTran.from.alphaNumCustomValidator">Invalid Characters</i>
				</div>
				<div class="col-sm-6 pl-5 pr-5">
					<textarea rows="4"
						cols="39"
						v-model="editTran.to"
						id="inputStyle"
						placeholder="To"></textarea>
					<i class="text-red"
						v-if="$v.editTran.$anyDirty && !$v.editTran.to.required">Field Required</i>
					<i class="text-red"
						v-if="$v.editTran.$anyDirty && !$v.editTran.to.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<div class="form-group row mb-0">
				<label class="col-sm-6 col-form-label">
					<b>Reference No.:</b>
				</label>
			</div>
			<div class="form-group row mb-0">
				<div class="col-sm-6 pl-5 pr-5">
					<base-input v-model="editTran.refNo"
						type="text"
						placeholder="Reference No."
						id="inputStyle"></base-input>
					<i class="text-red"
						v-if="$v.editTran.$anyDirty && !$v.editTran.refNo.alphaNumCustomValidator">Invalid Characters</i>
				</div>
			</div>
			<template v-slot:modal-footer>
				<div class="w-100">
					<div class="text-right">
						<base-button id="darkBtn"
							@click.native="editLiquidateTrans"
							:disabled="requestProcessing">
							<i v-if="requestProcessing"
								class="fa fa-spinner fa-spin"></i>
							Update
						</base-button>
						<base-button id="darkInlineBtn"
							@click.native="$bvModal.hide('liquidation-edit-trans-modal')"
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
			<card shadow
				v-if="attachments.length > 0 && !loadAttachment">
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
									v-if="pettyCash.status == 1"></span>
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
							v-if="pettyCash.status == 1">
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
</template>
<script>
	import {dbUsers, dbExpense, db, dbMains, expenseStorage} from '@/main';
	import {upperCase, capitalCase} from "text-case";
	import {helpers, required} from "vuelidate/lib/validators";
	import imageCompression from 'browser-image-compression';
	import printJS from 'print-js';

	const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ,. ]*$/);
	const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ -.A-Za-z ]*$/);
	const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
	const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
	const itemColumns = ["#", "Date", "Particular", "Amount", "Description", "Reference No.", "Actions"];
	const transColumns = ["#", "Date", "Amount", "Description", "From", "To", "Mode", "Purpose", "Reference No.", "Actions"];
	const liquidateColumns = ["#", "Date", "Name", "Amount Received", "Total Amount", "Return Amount", "Actions"];
	const moment  = require('moment');
	const today = new Date();
	let commaNumber = require('comma-number');
	let format = commaNumber.bindWith(',', '.');
	const addZero = require('add-zero');

	export default{
		components: {},
		data() {
			return {
				// Petty cash particular items table
				columns: [{
						label: 'Date',
						field: 'date'
					},{
						label: 'Name',
						field: 'name',
						width: '150px'
					},{
						label: 'Particular',
						field: 'particular',
						width: '150px'
					},{
						label: 'Amount Received',
						field: 'amountReceived'
					},{
						label: 'Total Amount',
						field: 'totalAmount'
					},{
						label: 'Return Amount',
						field: 'returnAmount'
					},{
						label: '',
						field: 'action',
						sortable: false,
						width: '100px'
					}
				],
				pettyCash: [],
				maxDate: moment().format("YYYY-MM-DD"),
				departments: [],
				names: [],
				types: [
					{"typeId": 'cash', "typeName": 'Cash'},
					{"typeId": 'check', "typeName": 'Check'}
				],
				// Edit petty cash
				pettyEdit: {
					id: '',
					pettyId: '',
					date: '',
					department: '',
					to: '',
					from: '',
					amount: '',
					totalPetty: '',
					type: '',
					receivedBy: '',
					checkNumber: '',
					checkReference: ''
				},
				// Enable or disable buttons
				requestProcessing: false,
				banks: [],
				bank: '',
				bankAccounts: [],
				bankAccount: '',
				checkSeries: [],
				series: '',
				checkNumbers: [],
				checkNumber: '',
				employees: [],
				// Petty cash liquidations
				liquidate: {
					name: '',
					date: moment().format("YYYY-MM-DD"),
					amountReceived: '',
					totalAmount: '',
					returnAmount: ''
				},
				descs: [],
				liquidateDesc: '',
				// Liquidation items
				items: {
					date: moment().format("YYYY-MM-DD"),
					particular: '',
					amount: '',
					refNo: '',
					desc: ''
				},
				itemList: [],
				itemEditList: [],
				// Liquidation transportation
				trans: {
					date: moment().format("YYYY-MM-DD"),
					amount: '',
					mode: '',
					purpose: '',
					from: '',
					to: '',
					refNo: ''
				},
				transList: [],
				transEditList: [],
				// Liquidation item table
				tbItems: [],
				tbEditItems: [],
				loading: true,
				loadError: false,
				itemsTable: {
					title: "Items Table",
					subTitle: "",
					columns: [...itemColumns]
				},
				itemsCount: 0,
				itemsEditCount: 0,
				currentItemPage: 1,
				currentItemEditPage: 1,
				// Liquidation transportation table
				tbTrans: [],
				tbEditTrans: [],
				transTable: {
					title: "Transportation Table",
					subTitle: "",
					columns: [...transColumns]
				},
				transCount: 0,
				transEditCount: 0,
				currentTransPage: 1,
				currentTransEditPage: 1,
				totalItemAmount: 0,
				totalTransAmount: 0,
				// Liquidation table
				liquidations: [],
				liquidationList: [],
				liquidateTable: {
					title: "Liquidations Table",
					subTitle: "",
					columns: [...liquidateColumns]
				},
				liquidateCount: 0,
				currentLiquidatePage: 1,
				liquidateAmount: '',
				// Edit liquidation
				editLiquidate: {
					name: '',
					date: '',
					amountReceived: '',
					totalAmount: '',
					returnAmount: ''
				},
				// Add liquidation item
				addItems: {
					date: moment().format("YYYY-MM-DD"),
					particular: '',
					amount: '',
					refNo: '',
					desc: ''
				},
				// Add liquidation transportation
				addTran: {
					date: moment().format("YYYY-MM-DD"),
					amount: '',
					mode: '',
					purpose: '',
					from: '',
					to: '',
					refNo: '',
					desc: ''
				},
				// Edit liquidation item
				editItems: {
					id: '',
					itemID: '',
					date: moment().format("YYYY-MM-DD"),
					particular: '',
					amount: '',
					refNo: '',
					desc: ''
				},
				oldAmount: '',
				// Edit liquidation transportation
				editTran: {
					id: '',
					tranId: '',
					date: moment().format("YYYY-MM-DD"),
					amount: '',
					mode: '',
					purpose: '',
					from: '',
					to: '',
					refNo: '',
					desc: ''
				},
				// Liquidation attachment
				attachment: '',
				attachmentData: null,
				attachments: [],
				attachId: '',
				uploadValue: 0,
				allAttachments: [],
				loadAttachment: true,
				// Company
				company: {
					name: '',
					address: ''
				},
				// User
				user: {
					firstname: '',
					lastname: ''
				},
				userRole: '',
				totalRequestedAmount: 0,
				preparedBy: '',
				pettySignatory: {
					prepared: '',
					checked: '',
					approved: ''
				}
			}
		},
		validations:{
			// Edit petty cash validations
			pettyEdit: {
				date: {required},
				department: {required},
				to: {required},
				from: {
					required,
					alphaCustomValidator
				},
				amount: {
					required,
					amountCustomValidator
				},
				totalPetty: {amountCustomValidator},
				type: {required},
				receivedBy: {
					alphaCustomValidator
				},
				checkNumber: {
					required,
					numCustomValidator
				}
			},
			// Liquidate validations
			bank: {required},
			bankAccount: {required},
			series: {required},
			checkNumber: {required},
			liquidate: {
				name: {required},
				date: {required},
				amountReceived: {
					required,
					amountCustomValidator
				},
				totalAmount: {
					required,
					amountCustomValidator
				},
				returnAmount: {
					required,
					amountCustomValidator
				}
			},
			liquidateDesc: {required},
			// Petty cash item validations
			items: {
				date: {required},
				particular: {
					required,
					alphaNumCustomValidator
				},
				amount: {
					required,
					amountCustomValidator
				},
				refNo: {alphaNumCustomValidator}
			},
			// Petty cash transportation validations
			trans: {
				date: {required},
				amount: {
					required,
					amountCustomValidator
				},
				mode: {
					required,
					alphaNumCustomValidator
				},
				purpose: {
					required,
					alphaNumCustomValidator
				},
				from: {
					required,
					alphaNumCustomValidator
				},
				to: {
					required,
					alphaNumCustomValidator
				},
				refNo: {alphaNumCustomValidator}
			},
			// Edit liquidate validations
			editLiquidate: {
				name: {required},
				date: {required},
				amountReceived: {
					required,
					amountCustomValidator
				},
				totalAmount: {
					required,
					amountCustomValidator
				},
				returnAmount: {
					required,
					amountCustomValidator
				}
			},
			// Add liquidate item validations
			addItems: {
				date: {required},
				particular: {
					required,
					alphaNumCustomValidator
				},
				amount: {
					required,
					amountCustomValidator
				},
				refNo: {alphaNumCustomValidator}
			},
			// Add liquidate transportation validations
			addTran: {
				date: {required},
				amount: {
					required,
					amountCustomValidator
				},
				mode: {
					required,
					alphaNumCustomValidator
				},
				purpose: {
					required,
					alphaNumCustomValidator
				},
				from: {
					required,
					alphaNumCustomValidator
				},
				to: {
					required,
					alphaNumCustomValidator
				},
				refNo: {alphaNumCustomValidator}
			},
			// Edit liquidate item validations
			editItems: {
				date: {required},
				particular: {
					required,
					alphaNumCustomValidator
				},
				amount: {
					required,
					amountCustomValidator
				},
				refNo: {alphaNumCustomValidator}
			},
			// Edit liquidate transportation validations
			editTran: {
				date: {required},
				amount: {
					required,
					amountCustomValidator
				},
				mode: {
					required,
					alphaNumCustomValidator
				},
				purpose: {
					required,
					alphaNumCustomValidator
				},
				from: {
					required,
					alphaNumCustomValidator
				},
				to: {
					required,
					alphaNumCustomValidator
				},
				refNo: {alphaNumCustomValidator}
			},
		},
		async created(){
			this.getUserRole();
		},
		async mounted(){
			this.getPettyCash();
			this.getLiquidations(1, 'list');
			this.getEmployees();
			this.getCompany();
			this.getUser(localStorage.getItem('aisname'));
		},
		methods: {
			getSignatory() {
				let data = dbMains.collection("printSignatoryTypes")
					.where("type","==", capitalCase('Petty Cash'));
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
								this.pettySignatory = {
									prepared: sigData[0].name,
									checked: sigData[1].name,
									approved: sigData[2].name
								}
							}
						});
					}
				});
			},
			// Close view petty cash page
			closePetty(){
				this.$router.push('/petty/cash');
			},
			// Get  user role details
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
			// Display petty cash details
			getPettyCash(){
				let self = this, id = '', department = '', name = '', check = '';
				let pettyData = dbExpense.collection("pettyCash")
					.where("pettyCashId","==",this.$router.currentRoute.params.id);

				self.pettyCash = [];
				self.allAttachments = [];
				self.getSignatory();
				pettyData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.pettyCash.push(doc.data());
						id = doc.id;
					});
					let deptData = dbUsers.collection("departments")
						.where("departmentUid","==",self.pettyCash[0].departmentReference);
					let nameData = dbUsers.collection("users")
						.where("userId","==",self.pettyCash[0].nameToReference);
					let checkData = db.collection("bankChecks")
						.where("bankCheckUid","==",self.pettyCash[0].checkReference);

					deptData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							department = doc.data().departmentName;
						});
						nameData.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								name = doc.data().firstname + ' ' + doc.data().lastname;
							});
							checkData.get().then((querySnapshot) => {
								querySnapshot.forEach((doc) => {
									check = doc.data().bankCheckNumber;
								});
								self.pettyCash[0]["id"] = id;
								self.pettyCash[0]["department"] = department;
								self.pettyCash[0]["name"] = name;
								self.pettyCash[0].["pettyType"] = upperCase(self.pettyCash[0].type);
								self.pettyCash[0]["checkNumber"] = check;
								self.totalRequestedAmount =  parseFloat(2000) - parseFloat(self.pettyCash[0].cashOnHand);
								self.pettyCash[0].amountReceive = format(parseFloat(self.pettyCash[0].amountReceive));
								self.totalRequestedAmount = format(self.totalRequestedAmount);
								if(self.pettyCash[0].totalPetty != ''){
									self.pettyCash[0].totalPetty = format(parseFloat(self.pettyCash[0].totalPetty).toFixed(2));
								}
								self.pettyCash[0].cashOnHand = format(parseFloat(self.pettyCash[0].cashOnHand).toFixed(2));
								self.pettyCash = self.pettyCash[0];
							});
						});
					});
				});
			},
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
				});
			},
			// Get employee names
			getNames(department, type){
				let self = this;
				let nameData = dbUsers.collection("users")
					.where("status","==",1)
					.where("departmentReference","==",department)
					.orderBy("lastname", "asc");

				self.names = [];
				nameData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.names.push(doc.data());
					});
					for(let a = 0; a < self.names.length; a++){
						self.names[a]["name"] = self.names[a].lastname + ', ' + self.names[a].firstname;
					}
					if(type == 'edit'){
						self.pettyEdit.to = self.names[0].userId;
					}
				});
			},
			// Cleare check input value
			clearCheck(){
				this.pettyEdit.checkReference = '';
			},
			// Show edit petty cash form
			openUpdatePettyModal(petty){
				this.getDepartments();
				this.getNames(petty.departmentReference, 'load');
				this.getBanks();
				this.pettyEdit = {
					id: petty.id,
					pettyId: petty.pettyCashId,
					date: petty.pettyCashDate,
					department: petty.departmentReference,
					from: petty.from,
					to: petty.nameToReference,
					amount: petty.amountReceive,
					totalPetty: petty.totalPetty,
					type: petty.type,
					receivedBy: petty.receivedBy,
					checkNumber: petty.checkNumber,
					checkReference: petty.checkReference,
				}
				this.$bvModal.show('update-petty-cash-modal');
			},
			// Get bank details
			getBanks(){
				let self = this;
				let bankData = dbMains.collection("banks")
					.orderBy("bank", "asc");

				self.banks = [];
				bankData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.banks.push(doc.data());
					});
					self.bank = self.banks[0].bankUid;
					self.getBankAccounts(self.banks[0].bankUid);
				});
			},
			// Get bank account details
			getBankAccounts(bank){
				let self = this;
				let bankAccountData = dbMains.collection("bankAccounts")
					.where("bankReference", "==", bank)
					.orderBy("bankAccountNumber", "asc");

				self.bankAccounts = [];
				bankAccountData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.bankAccounts.push(doc.data());
					});
					self.bankAccount = self.bankAccounts[0].bankAccountUid;
					self.getCheckSeries(self.bank, self.bankAccount);
				});
			},
			// Get check series details
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
					self.series = self.checkSeries[0].bankCheckSeriesUid;
					self.getCheckNumber(self.bank, self.bankAccount, self.series, 'used');
				});
			},
			// Get check number details
			getCheckNumber(bank, bankAccount, series, status){
				let self = this;
				let bankCheckNumberData = db.collection("bankCheckSeriesReports")
					.where("bankReference", "==", bank)
					.where("bankAccountReference", "==", bankAccount)
					.where("checkSeriesReference", "==", series)
					.where("status", "==", status)
					.orderBy("checkNumber", "asc");

				self.checkNumbers = [];
				self.checkNumber = '';
				bankCheckNumberData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.exists){
							self.checkNumbers.push(doc.data());
						}
					});
					if(self.checkNumbers.length != 0){
						self.checkNumber = self.checkNumbers[0].checkNumber;
					}
				});
			},
			// Get check number value
			chooseCheckNumber(){
				let self = this;

				self.pettyEdit.checkNumber = self.checkNumber;
				for(let a = 0; a < self.checkNumbers.length; a++){
					if(self.checkNumber == self.checkNumbers[a].checkNumber){
						self.pettyEdit.checkReference = self.checkNumbers[a].checkReference;
					}
				}
				self.$bvModal.hide('choose-check-number-modal');
			},
			// Change petty cash details
			editPettyCash(){
				let self = this, addError = true;

				self.$v.pettyEdit.$touch();
				if(self.pettyEdit.type == 'check'){
					if(!self.$v.pettyEdit.$error){
						addError = false;
					}
				}else if(self.pettyEdit.type == 'cash'){
					if(!self.$v.pettyEdit.date.$error && !self.$v.pettyEdit.department.$error && !self.$v.pettyEdit.to.$error && !self.$v.pettyEdit.from.$error && !self.$v.pettyEdit.amount.$error && self.$v.pettyEdit.totalPetty){
						addError = false;
						self.pettyEdit.checkReference = '';
					}
				}
				if(!addError){
					self.requestProcessing = true;
					try{
						dbExpense.collection("pettyCash")
						.doc(self.pettyEdit.id)
						.update({
							pettyCashDate: self.pettyEdit.date,
							amountReceive: self.pettyEdit.amount.replaceAll(",",""),
							totalPetty: self.pettyEdit.totalPetty.replaceAll(",",""),
							cashOnHand: self.pettyEdit.amount.replaceAll(",",""),
							type: self.pettyEdit.type,
							departmentReference: self.pettyEdit.department,
							nameToReference: self.pettyEdit.to,
							from: self.pettyEdit.from,
							receivedBy: self.pettyEdit.receivedBy,
							checkReference: self.pettyEdit.checkReference,
							dateModified: today
						}).then(() => {
							self.$swal({
								title: 'Success',
								text: 'Petty cash updated successfully!',
								icon: 'success',
								confirmButtonColor: '#b80000',
								confirmButtonText: 'OK'
							}).then(() => {
								self.$v.pettyEdit.$reset();
								self.$bvModal.hide('update-petty-cash-modal');
								self.getLiquidations(1, "change");
								self.requestProcessing = false;
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
			},
			// Get employee details
			getEmployees(){
				let self = this;
				let nameData = dbUsers.collection("users")
					.where("status","==",1)
					.orderBy("lastname", "asc");

				self.employees = [];
				nameData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.employees.push(doc.data());
					});
					for(let a = 0; a < self.employees.length; a++){
						self.employees[a]["name"] = self.employees[a].lastname + ', ' + self.employees[a].firstname;
					}
					self.liquidate.name = self.employees[0].userId
				});
			},
			// Show add liquidation form
			openAddLiquidationModal(){
				this.getEmployees();
				this.getDescriptions();
				this.$bvModal.show("add-liquidation-modal");
				this.getItems(1);
				this.getTrans(1);
				this.getTotalAmount();
			},
			// Get liquidation description details
			getDescriptions(){
				let self = this;
				let descData = dbMains.collection("liquidationDescriptions")
					.where("status","==",1)
					.orderBy("description","asc");

				self.descs = [];
				descData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.descs.push(doc.data());
					});
					self.liquidateDesc = self.descs[0].liquidationDescId;
				});
			},
			// Show add item or transportation form
			openItemModal(desc){
				let descData = dbMains.collection("liquidationDescriptions")
					.where("liquidationDescId", "==", desc);
				let descsLiquidate = [];

				descData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						descsLiquidate.push(doc.data());
					});
					if(descsLiquidate[0].description == "TRANSPORTATION" || descsLiquidate[0].description == "TRANSPORTATIONS"){
						this.$bvModal.show('add-trans-modal');
					}else{
						this.$bvModal.show('add-item-modal');
					}
				});
			},
			// Add new item details
			addItem(){
				let self = this;

				self.$v.items.$touch();
				if(!self.$v.items.$error){
					self.requestProcessing = true;
					if(self.itemList.length == 0){
						self.itemList = [];
					}
					let newItem = {
						"id": self.itemList.length + 1,
						"date": self.items.date,
						"particular": self.items.particular,
						"amount": format(parseFloat(self.items.amount.replaceAll(",","")).toFixed(2)),
						"refNo": self.items.refNo,
						"desc": self.liquidateDesc
					}

					self.itemList.push(newItem);
					self.$swal({
						title: 'Success',
						text: 'New item added successfully!',
						icon: 'success',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.items.date = moment().format('YYYY-MM-DD');
						self.items.particular = '';
						self.items.amount = '';
						self.items.refNo = '';
						self.$v.items.$reset();
						self.$bvModal.hide('add-item-modal');
						self.getItems(1);
					});
					self.requestProcessing = false;
				}
			},
			// Add new transportation details
			addTrans(){
				let self = this;

				self.$v.trans.$touch();
				if(!self.$v.trans.$error){
					self.requestProcessing = true;
					if(self.transList.length == 0){
						self.transList = [];
					}
					let newTrans = {
						"id": self.transList.length + 1,
						"date": self.trans.date,
						"amount": format(parseFloat(self.trans.amount.replaceAll(",","")).toFixed(2)),
						"mode": self.trans.mode,
						"purpose": self.trans.purpose,
						"from": self.trans.from,
						"to": self.trans.to,
						"refNo": self.trans.refNo,
						"desc": self.liquidateDesc
					}

					self.transList.push(newTrans);
					self.$swal({
						title: 'Success',
						text: 'New item added successfully!',
						icon: 'success',
						confirmButtonColor: '#b80000',
						confirmButtonText: 'OK'
					}).then(() => {
						self.trans.date = moment().format('YYYY-MM-DD');
						self.trans.amount = '';
						self.trans.mode = '';
						self.trans.purpose = '';
						self.trans.from = '';
						self.trans.to = '';
						self.trans.refNo = '';
						self.$v.trans.$reset();
						self.$bvModal.hide('add-trans-modal');
						self.getTrans(1);
					});
					self.requestProcessing = false;
				}
			},
			// Display items details on table
			getItems(page){
				let self = this;
				let firstRow = (page - 1) * 10;
				let lastRow = (page * 10);
				let amount = 0;

				self.tbItems = [];
				self.totalItemAmount = 0;
				for(let a = firstRow; a < lastRow; a++){
					if(self.itemList[a]){
						self.tbItems.push(self.itemList[a]);
					}
				}
				for(let b = 0; b < self.itemList.length; b++){
					amount += parseFloat(self.itemList[b].amount.replaceAll(",",""));
				}
				if(self.itemList.length > 0){
					self.totalItemAmount = amount;
				}
				self.itemsCount = self.itemList.length;
				self.currentItemPage = page;
				self.getTotalAmount();
			},
			// Item table page change
			onItemPageChange(page) {
				this.getItems(page);
			},
			// Display transportation details on table
			getTrans(page){
				let self = this;
				let firstRow = (page - 1) * 10;
				let lastRow = (page * 10);
				let amount = 0;

				self.tbTrans = [];
				self.totalTransAmount = 0;
				for(let a = firstRow; a < lastRow; a++){
					if(self.transList[a]){
						self.tbTrans.push(self.transList[a]);
					}
				}
				for(let b = 0; b < self.transList.length; b++){
					amount += parseFloat(self.transList[b].amount.replaceAll(",",""));
				}
				if(self.transList.length > 0){
					self.totalTransAmount = amount;
				}
				self.transCount = self.transList.length;
				self.currentTransPage = page;
				self.getTotalAmount();
			},
			// Transportation table page change
			onTransPageChange(page) {
				this.getTrans(page);
			},
			// Delete item details
			removeItem(row){
				let self = this;
				self.$swal({
					title: 'Are you sure?',
					text: "You want to remove this particular",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#C72111',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						let num = parseInt(row.rowNum) - 1;

						self.itemList.splice(num, 1);
						self.$swal({
							title: 'Success',
							text: 'Particular removed successfully!',
							icon: 'success',
							confirmButtonColor: '#b80000',
							confirmButtonText: 'OK'
						}).then(() => {
							for(let a = 0; a < self.itemList.length; a++){
								self.itemList[a].id = a + 1;
							}
							self.getItems(1);
						});
					}
				});
			},
			// Delete transportation details
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

						self.transList.splice(num, 1);
						self.$swal({
							title: 'Success',
							text: 'Transportation removed successfully!',
							icon: 'success',
							confirmButtonColor: '#b80000',
							confirmButtonText: 'OK'
						}).then(() => {
							for(let a = 0; a < self.transList.length; a++){
								self.transList[a].id = a + 1;
							}
							self.getTrans(1);
						});
					}
				});
			},
			// Compute petty cash total amount
			getTotalAmount(){
				let self = this;
				let total = 0;
				let tItems = self.totalItemAmount;
				let tTrans = self.totalTransAmount;

				self.liquidate.totalAmount = 0;
				total = parseFloat(tItems) + parseFloat(tTrans);
				self.liquidate.totalAmount = format(parseFloat(total).toFixed(2));
			},
			// Save new liquidation details
			addLiquidation(){
				let self = this;

				self.$v.liquidate.$touch();
				if(!self.$v.liquidate.$error){
					self.requestProcessing = true;
					try{
						let getUserId = dbUsers.collection("users")
							.where("username","==",localStorage.getItem("aisname"));
						let users = [];

						getUserId.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								users.push(doc.data());
							});
							let dataId = 'PLI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

							dbExpense.collection("pettyLiquidation")
							.doc().set({
								pettyLiquidationId: dataId,
								date: self.liquidate.date,
								amountReceived: self.liquidate.amountReceived,
								totalAmount: self.liquidate.totalAmount,
								returnAmount: self.liquidate.returnAmount,
								nameReference: self.liquidate.name,
								pettyCashReference: self.$router.currentRoute.params.id,
								status: 1,
								userReference: users[0].userId,
								dateCreated: today,
								dateModified: today
							}).then(() => {
								if(self.itemList.length != 0){
									for(let a = 0; a < self.itemList.length; a++){
										let lIID = 'PLI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

										dbExpense.collection("pettyLiquidationItems").doc()
										.set({
											liquidationItemId: lIID,
											date: self.itemList[a].date,
											amount: self.itemList[a].amount,
											particular: self.itemList[a].particular,
											referenceNumber: self.itemList[a].refNo,
											pettyLiquidationReference: dataId,
											descriptionReference: self.itemList[a].desc,
											status: 1,
											userReference: users[0].userId,
											dateCreated: today,
											dateModified: today
										});
									}
								}
								if(self.transList.length != 0){
									for(let b = 0; b < self.transList.length; b++){
										let lTID = 'PLI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

										dbExpense.collection("pettyLiquidationItems").doc()
										.set({
											liquidationItemId: lTID,
											date: self.transList[b].date,
											amount: self.transList[b].amount,
											from: self.transList[b].from,
											to: self.transList[b].to,
											transportationMode: self.transList[b].mode,
											purpose: self.transList[b].purpose,
											referenceNumber: self.transList[b].refNo,
											pettyLiquidationReference: dataId,
											descriptionReference: self.transList[b].desc,
											status: 1,
											userReference: users[0].userId,
											dateCreated: today,
											dateModified: today
										});
									}
								}
								self.liquidate.name = "";
								self.liquidate.date = "";
								self.liquidate.amountReceived = '';
								self.liquidate.totalAmount = '';
								self.liquidate.returnAmount = '';
								self.itemList = [];
								self.transList = [];
								self.$v.liquidate.$reset();
								self.requestProcessing = false;
								self.$swal({
									title: 'Success',
									text: 'New Liquidation added successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								}).then(() => {
									self.$bvModal.hide("add-liquidation-modal");
									self.getLiquidations(1, 'change');
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
			},
			// Display liquidation attachment for printing
			getAllAttachments(id){
				let self= this, rowNum = 0;
				let listRef = expenseStorage.ref('pettyCashFiles/' + id);

				self.requestProcessing = true;
				listRef.listAll()
				.then((res) => {
					res.items.forEach((itemRef) => {
					expenseStorage.ref('pettyCashFiles/' + id + '/' + itemRef.name)
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
			// Display liquidation details
			getLiquidations(page, type){
				let self = this;
				// let firstRow = (page - 1) * 10;
				// let lastRow = (page * 10);
				let liquidateData = dbExpense.collection("pettyLiquidation")
					.where("pettyCashReference","==",self.$router.currentRoute.params.id)
					.orderBy("date","asc");
				let pettyData = null;
				let amount = 0, petty = [], cash = 0, ids = [], id = '';

				self.liquidations = [];
				self.liquidationList = [];
				self.loading = true;
				liquidateData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						self.liquidations.push(doc.data());
						ids.push(doc.id);
					});
					for(let b = 0; b < self.liquidations.length; b++){
						self.liquidations[b]["rowNum"] = b + 1;
						self.liquidations[b]["id"] = ids[b];
						self.liquidations[b]["particular"] = '';
						self.liquidations[b].amountReceived = format(parseFloat(self.liquidations[b].amountReceived).toFixed(2));
						self.liquidations[b].totalAmount = format(parseFloat(self.liquidations[b].totalAmount).toFixed(2));
						self.liquidations[b].returnAmount = format(parseFloat(self.liquidations[b].returnAmount).toFixed(2));
						amount = parseFloat(amount) + parseFloat(self.liquidations[b].totalAmount.replaceAll(",",""));
						let particularData = dbExpense.collection("pettyLiquidationItems")
							.where("pettyLiquidationReference","==",self.liquidations[b].pettyLiquidationId);
						let count = 0;

						particularData.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								count++;
								if(count <= 1){
									if(doc.data().particular != undefined){
										self.liquidations[b].particular = doc.data().particular;
									}else if(doc.data().particular == undefined){
										self.liquidations[b].particular = 'Transpo: ' + doc.data().purpose;
									}
								}else if(count > 1){
									if(doc.data().particular != undefined){
										self.liquidations[b].particular += ", " + doc.data().particular;
									}else if(doc.data().particular == undefined){
										self.liquidations[b].particular += ', Transpo: ' + doc.data().purpose;
									}
								}
							});
							self.liquidationList.push(self.liquidations[b]);
							self.getAllAttachments(self.liquidations[b].pettyLiquidationId);
						});
					}
					// for(let a = firstRow; a < lastRow; a++){
					// 	if(self.liquidations[a]){
					// 		self.liquidationList.push(self.liquidations[a]);
					// 	}
					// }
					if(type == 'change'){
						pettyData = dbExpense.collection("pettyCash")
							.where("pettyCashId","==",self.$router.currentRoute.params.id);
						pettyData.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								petty.push(doc.data());
								id = doc.id;
							});
							if(petty[0].totalPetty == ''){
								if(self.liquidateAmount.replaceAll(",","") <= parseFloat(petty[0].amountReceive.replaceAll(",",""))){
									cash = parseFloat(petty[0].amountReceive.replaceAll(",","")) - self.liquidateAmount.replaceAll(",","");
								}else if(self.liquidateAmount.replaceAll(",","") > parseFloat(petty[0].amountReceive.replaceAll(",",""))){
									cash = 0;
								}
							}else if(petty[0].totalPetty != ''){
								if(self.liquidateAmount.replaceAll(",","") <= parseFloat(petty[0].totalPetty.replaceAll(",",""))){
									cash = parseFloat(petty[0].totalPetty.replaceAll(",","")) - self.liquidateAmount.replaceAll(",","");
								}else if(self.liquidateAmount.replaceAll(",","") > parseFloat(petty[0].totalPetty.replaceAll(",",""))){
									cash = 0;
								}
							}
							dbExpense.collection("pettyCash")
							.doc(id)
							.update({
								cashOnHand: parseFloat(cash).toFixed(2),
								dateModified: today
							}).then(() => {
								self.getPettyCash();
							});
						});
					}
					self.liquidateAmount = format(parseFloat(amount).toFixed(2));
					self.liquidateCount = self.liquidations.length;
					self.currentLiquidatePage = page;
					setTimeout(function() {
						self.loading = false;
					}, 1000);
				});
			},
			// Liquidation table page change
			onLiquidatePageChange(page) {
				this.getLiquidations(page, 'list');
			},
			// Show edit liquidation form
			openUpdateLiquidateModal(liqui){
				this.getEmployees();
				this.getDescriptions();
				this.editLiquidate = {
					id: liqui.id,
					liquidationId: liqui.pettyLiquidationId,
					date: liqui.date,
					amountReceived: liqui.amountReceived,
					totalAmount: liqui.totalAmount,
					returnAmount: liqui.returnAmount,
					name: liqui.nameReference,
				}
				this.$bvModal.show('update-liquidation-modal');
				this.getUpdateItems(1);
				this.getUpdateTrans(1);
			},
			// Display liquidation item details for table in edit liquidation form
			getUpdateItems(page){
				let self = this;
				let firstRow = (page - 1) * 10;
				let lastRow = (page * 10);
				let amount = 0, ids = [], dData = [], items = [];
				let itemData = dbExpense.collection("pettyLiquidationItems")
					.where("pettyLiquidationReference","==",self.editLiquidate.liquidationId);
				let descData = dbMains.collection("liquidationDescriptions")
					.orderBy("description","asc");

				self.tbEditItems = [];
				self.totalItemAmount = 0;
				self.itemEditList = [];
				itemData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						items.push(doc.data());
						ids.push(doc.id);
					});
					descData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							dData.push(doc.data());
						});
						for(let b = 0; b < items.length; b++){
							items[b]["id"] = ids[b];
							for(let c = 0; c < dData.length; c++){
								if(items[b].descriptionReference == dData[c].liquidationDescId){
									if(dData[c].description != 'TRANSPORTATION'){
										self.itemEditList.push(items[b]);
									}
								}
							}
						}
						for(let d = 0; d < self.itemEditList.length; d++){
							self.itemEditList[d]["rowNum"] = d + 1;
							amount += parseFloat(self.itemEditList[d].amount.replaceAll(",",""));
							self.itemEditList[d].amount = format(parseFloat(self.itemEditList[d].amount).toFixed(2));
						}
						for(let a = firstRow; a < lastRow; a++){
							if(self.itemEditList[a]){
								self.tbEditItems.push(self.itemEditList[a]);
							}
						}
						if(self.itemEditList.length > 0){
							self.totalItemAmount = amount;
						}
						self.itemsEditCount = self.itemEditList.length;
						self.currentItemEditPage = page;
					});
				});
			},
			// Liquidation item table page change in edit liquidation form
			onUpdateItemPageChange(page) {
				this.getUpdateItems(page);
			},
			// Display liquidation transportation details for table in edit liquidation form
			getUpdateTrans(page){
				let self = this;
				let firstRow = (page - 1) * 10;
				let lastRow = (page * 10);
				let amount = 0, ids = [], dData = [], trans = [];
				let transData = dbExpense.collection("pettyLiquidationItems")
					.where("pettyLiquidationReference","==",self.editLiquidate.liquidationId);
				let descData = dbMains.collection("liquidationDescriptions")
					.orderBy("description","asc");

				self.tbEditTrans = [];
				self.totalTransAmount = 0;
				self.transEditList = [];
				transData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						trans.push(doc.data());
						ids.push(doc.id);
					});
					descData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							dData.push(doc.data());
						});
						for(let b = 0; b < trans.length; b++){
							trans[b]["id"] = ids[b];
							for(let c = 0; c < dData.length; c++){
								if(trans[b].descriptionReference == dData[c].liquidationDescId){
									if(dData[c].description == 'TRANSPORTATION'){
										self.transEditList.push(trans[b]);
									}
								}
							}
						}
						for(let d = 0; d < self.transEditList.length; d++){
							self.transEditList[d]["rowNum"] = d + 1;
							amount += parseFloat(self.transEditList[d].amount.replaceAll(",",""));
							self.transEditList[d].amount = format(parseFloat(self.transEditList[d].amount).toFixed(2));
						}
						for(let a = firstRow; a < lastRow; a++){
							if(self.transEditList[a]){
								self.tbEditTrans.push(self.transEditList[a]);
							}
						}
						if(self.transEditList.length > 0){
							self.totalTransAmount = amount;
						}
						self.transEditCount = self.transEditList.length;
						self.currentTransEditPage = page;
					});
				});
			},
			// Liquidation transporation table page change in edit liquidation form
			onUpdateTransPageChange(page) {
				this.getUpdateTrans(page);
			},
			// Show add item or transportation form in edit liquidation form
			editLiquiItemModal(desc){
				let descData = dbMains.collection("liquidationDescriptions")
					.where("liquidationDescId", "==", desc);
				let descsLiquidate = [];

				descData.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						descsLiquidate.push(doc.data());
					});
					if(descsLiquidate[0].description == "TRANSPORTATION" || descsLiquidate[0].description == "TRANSPORTATIONS"){
						this.addTran.desc = desc;
						this.$bvModal.show('liquidation-add-trans-modal');
					}else{
						this.addItems.desc = desc;
						this.$bvModal.show('liquidation-add-item-modal');
					}
				});
			},
			// Save new liquidation item details
			addLiquidateItem(){
				let self = this;

				self.$v.addItems.$touch();
				if(!self.$v.addItems.$error){
					self.requestProcessing = true;
					try{
						let getUserId = dbUsers.collection("users")
							.where("username","==",localStorage.getItem("aisname"));
						let lIID = 'PLI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
						let users = [];

						getUserId.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								users.push(doc.data());
							});
							dbExpense.collection("pettyLiquidationItems").doc()
							.set({
								liquidationItemId: lIID,
								date: self.addItems.date,
								amount: self.addItems.amount,
								particular: self.addItems.particular,
								referenceNumber: self.addItems.refNo,
								pettyLiquidationReference: self.editLiquidate.liquidationId,
								descriptionReference: self.addItems.desc,
								status: 1,
								userReference: users[0].userId,
								dateCreated: today,
								dateModified: today
							}).then(() => {
								let addAmount = parseFloat(self.editLiquidate.totalAmount.replaceAll(",","")) + parseFloat(self.addItems.amount.replaceAll(",",""));
								let changeReturn = parseFloat(self.editLiquidate.amountReceived.replaceAll(",","")) - parseFloat(addAmount);

								if(addAmount >= self.editLiquidate.amountReceived){
									changeReturn = 0;
								}
								dbExpense.collection("pettyLiquidation")
								.doc(self.editLiquidate.id)
								.update({
									totalAmount: parseFloat(addAmount).toFixed(2),
									returnAmount: parseFloat(changeReturn),
									dateModified: today
								}).then(() => {
									self.editLiquidate.totalAmount = format(parseFloat(addAmount).toFixed(2));
									self.editLiquidate.returnAmount = format(parseFloat(changeReturn).toFixed(2));
								});
								self.$swal({
									title: 'Success',
									text: 'New item added successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								}).then(() => {
									self.addItems.date = moment().format('YYYY-MM-DD');
									self.addItems.particular = '';
									self.addItems.amount = '';
									self.addItems.refNo = '';
									self.$v.addItems.$reset();
									self.$bvModal.hide('liquidation-add-item-modal');
									self.getUpdateItems(1);
									self.getLiquidations(1, 'change');
								});
								self.requestProcessing = false;
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
			},
			// Save new liquidation transportation details
			addLiquidateTrans(){
				let self = this;

				self.$v.addTran.$touch();
				if(!self.$v.addTran.$error){
					self.requestProcessing = true;
					try{
						let getUserId = dbUsers.collection("users")
							.where("username","==",localStorage.getItem("aisname"));
						let lIID = 'TLI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
						let users = [];

						getUserId.get().then((querySnapshot) => {
							querySnapshot.forEach((doc) => {
								users.push(doc.data());
							});
							dbExpense.collection("pettyLiquidationItems").doc()
							.set({
								liquidationItemId: lIID,
								date: self.addTran.date,
								amount: self.addTran.amount,
								from: self.addTran.from,
								to: self.addTran.to,
								transportationMode: self.addTran.mode,
								purpose: self.addTran.purpose,
								referenceNumber: self.addTran.refNo,
								pettyLiquidationReference: self.editLiquidate.liquidationId,
								descriptionReference: self.addTran.desc,
								status: 1,
								userReference: users[0].userId,
								dateCreated: today,
								dateModified: today
							}).then(() => {
								let addAmount = parseFloat(self.editLiquidate.totalAmount.replaceAll(",","")) + parseFloat(self.addTran.amount.replaceAll(",",""));
								let changeReturn = parseFloat(self.editLiquidate.amountReceived.replaceAll(",","")) - parseFloat(addAmount);

								if(addAmount >= self.editLiquidate.amountReceived){
									changeReturn = 0;
								}
								dbExpense.collection("pettyLiquidation")
								.doc(self.editLiquidate.id)
								.update({
									totalAmount: parseFloat(addAmount).toFixed(2),
									returnAmount: parseFloat(changeReturn),
									dateModified: today
								}).then(() => {
									self.editLiquidate.totalAmount = format(parseFloat(addAmount).toFixed(2));
									self.editLiquidate.returnAmount = format(parseFloat(changeReturn).toFixed(2));
								});
								self.$swal({
									title: 'Success',
									text: 'New transportation added successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								}).then(() => {
									self.addTran.date = moment().format('YYYY-MM-DD');
									self.addTran.amount = '';
									self.addTran.mode = '';
									self.addTran.purpose = '';
									self.addTran.from = '';
									self.addTran.to = '';
									self.addTran.refNo = '';
									self.addTran.desc = '';
									self.$v.addTran.$reset();
									self.$bvModal.hide('liquidation-add-trans-modal');
									self.getUpdateTrans(1);
									self.getLiquidations(1, 'change');
								});
								self.requestProcessing = false;
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
			},
			// Show edit liquidation item form in edit liquidation modal
			openUpdateItemModal(item){
				this.editItems = {
					id: item.id,
					itemId: item.liquidationItemId,
					date: item.date,
					amount: item.amount,
					particular: item.particular,
					refNo: item.referenceNumber
				}
				this.oldAmount = item.amount;
				this.$bvModal.show('liquidation-edit-item-modal');
			},
			// Change liquidate item details in edit liquidation modal
			editLiquidateItem(){
				let self = this;

				self.$v.editItems.$touch();
				if(!self.$v.editItems.$error){
					self.requestProcessing = true;
					try{
						dbExpense.collection("pettyLiquidationItems")
						.doc(self.editItems.id)
						.update({
							date: self.editItems.date,
							amount: self.editItems.amount,
							particular: self.editItems.particular,
							referenceNumber: self.editItems.refNo,
							dateModified: today
						}).then(() => {
							let editAmount = parseFloat(self.editLiquidate.totalAmount.replaceAll(",","")) - parseFloat(self.oldAmount.replaceAll(",",""));

							editAmount = editAmount + parseFloat(self.editItems.amount.replaceAll(",",""));
							let changeReturn = parseFloat(self.editLiquidate.amountReceived.replaceAll(",","")) - parseFloat(editAmount);

							if(editAmount >= self.editLiquidate.amountReceived){
								changeReturn = 0;
							}
							dbExpense.collection("pettyLiquidation")
							.doc(self.editLiquidate.id)
							.update({
								totalAmount: parseFloat(editAmount).toFixed(2),
								returnAmount: parseFloat(changeReturn),
								dateModified: today
							}).then(() => {
								self.editLiquidate.totalAmount = format(parseFloat(editAmount).toFixed(2));
								self.editLiquidate.returnAmount = format(parseFloat(changeReturn).toFixed(2));
							});
							self.$swal({
								title: 'Success',
								text: 'Item updated successfully!',
								icon: 'success',
								confirmButtonColor: '#b80000',
								confirmButtonText: 'OK'
							}).then(() => {
								self.editItems.date = '';
								self.editItems.particular = '';
								self.editItems.amount = '';
								self.editItems.refNo = '';
								self.$v.editItems.$reset();
								self.$bvModal.hide('liquidation-edit-item-modal');
								self.getUpdateItems(1);
								self.getLiquidations(1, 'change');
							});
							self.requestProcessing = false;
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
			// Show edit liquidate transportation form in edit liquidation modal
			openUpdateTransModal(trans){
				this.editTran = {
					id: trans.id,
					tranId: trans.liquidationItemId,
					date: trans.date,
					amount: trans.amount,
					from: trans.from,
					to: trans.to,
					mode: trans.transportationMode,
					purpose: trans.purpose,
					refNo: trans.referenceNumber
				}
				this.oldAmount = trans.amount;
				this.$bvModal.show('liquidation-edit-trans-modal');
			},
			// Change liquidate transportation details
			editLiquidateTrans(){
				let self = this;

				self.$v.editTran.$touch();
				if(!self.$v.editTran.$error){
					self.requestProcessing = true;
					try{
						dbExpense.collection("pettyLiquidationItems")
						.doc(self.editTran.id)
						.update({
							date: self.editTran.date,
							amount: self.editTran.amount,
							from: self.editTran.from,
							to: self.editTran.to,
							transportationMode: self.editTran.mode,
							purpose: self.editTran.purpose,
							referenceNumber: self.editTran.refNo,
							dateModified: today
						}).then(() => {
							let editAmount = parseFloat(self.editLiquidate.totalAmount.replaceAll(",","")) - parseFloat(self.oldAmount.replaceAll(",",""));

							editAmount = editAmount + parseFloat(self.editTran.amount.replaceAll(",",""));
							let changeReturn = parseFloat(self.editLiquidate.amountReceived.replaceAll(",","")) - parseFloat(editAmount);

							if(editAmount >= self.editLiquidate.amountReceived){
								changeReturn = 0;
							}
							dbExpense.collection("pettyLiquidation")
							.doc(self.editLiquidate.id)
							.update({
								totalAmount: parseFloat(editAmount).toFixed(2),
								returnAmount: parseFloat(changeReturn),
								dateModified: today
							}).then(() => {
								self.editLiquidate.totalAmount = format(parseFloat(editAmount).toFixed(2));
								self.editLiquidate.returnAmount = format(parseFloat(changeReturn).toFixed(2));
							});
							self.$swal({
								title: 'Success',
								text: 'Transportation updated successfully!',
								icon: 'success',
								confirmButtonColor: '#b80000',
								confirmButtonText: 'OK'
							}).then(() => {
								self.editTran.date = '';
								self.editTran.amount = '';
								self.editTran.from = '';
								self.editTran.to = '';
								self.editTran.mode = '';
								self.editTran.purpose = '';
								self.editTran.refNo = '';
								self.$v.editTran.$reset();
								self.$bvModal.hide('liquidation-edit-trans-modal');
								self.getUpdateTrans(1);
								self.getLiquidations(1, 'change');
							});
							self.requestProcessing = false;
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
			// Delete liquidation item details
			removeLiquidateItem(row){
				let self = this;
				self.$swal({
					title: 'Are you sure?',
					text: "You want to remove this particular",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#C72111',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						self.requestProcessing = true;
						let editAmount = parseFloat(self.editLiquidate.totalAmount.replaceAll(",","")) - parseFloat(row.amount.replaceAll(",",""));
						let changeReturn = parseFloat(self.editLiquidate.amountReceived.replaceAll(",","")) - parseFloat(editAmount);

						try{
							dbExpense.collection("pettyLiquidationItems")
							.doc(row.id)
							.delete()
							.then(() => {
								dbExpense.collection("pettyLiquidation")
								.doc(self.editLiquidate.id)
								.update({
									totalAmount: parseFloat(editAmount).toFixed(2),
									returnAmount: parseFloat(changeReturn),
									dateModified: today
								}).then(() => {
									self.editLiquidate.totalAmount = format(parseFloat(editAmount).toFixed(2));
									self.editLiquidate.returnAmount = format(parseFloat(changeReturn).toFixed(2));
								});
								self.$swal({
									title: 'Success',
									text: 'Particular removed successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								}).then(() => {
									self.getUpdateItems(1);
									self.getLiquidations(1, 'change');
								});
								self.requestProcessing = false;
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
			// Delete liquidation transportation details
			removeLiquidateTrans(row){
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
						self.requestProcessing = true;
						let editAmount = parseFloat(self.editLiquidate.totalAmount.replaceAll(",","")) - parseFloat(row.amount.replaceAll(",",""));
						let changeReturn = parseFloat(self.editLiquidate.amountReceived.replaceAll(",","")) - parseFloat(editAmount);

						try{
							dbExpense.collection("pettyLiquidationItems")
							.doc(row.id)
							.delete()
							.then(() => {
								dbExpense.collection("pettyLiquidation")
								.doc(self.editLiquidate.id)
								.update({
									totalAmount: parseFloat(editAmount).toFixed(2),
									returnAmount: parseFloat(changeReturn),
									dateModified: today
								}).then(() => {
									self.editLiquidate.totalAmount = format(parseFloat(editAmount).toFixed(2));
									self.editLiquidate.returnAmount = format(parseFloat(changeReturn).toFixed(2));
								});
								self.$swal({
									title: 'Success',
									text: 'Transportation removed successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								}).then(() => {
									self.getUpdateTrans(1);
									self.getLiquidations(1, 'change');
								});
								self.requestProcessing = false;
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
			// Change liquidation details
			updateLiquidation(){
				let self = this;

				self.$v.editLiquidate.$touch();
				if(!self.$v.editLiquidate.$error){
					self.requestProcessing = true;
					try{
						let editAmount = parseFloat(self.editLiquidate.amountReceived.replaceAll(",","")) - parseFloat(self.editLiquidate.totalAmount.replaceAll(",",""));

						if(parseFloat(self.editLiquidate.totalAmount.replaceAll(",","")) >= parseFloat(self.editLiquidate.amountReceived.replaceAll(",",""))){
							editAmount = 0;
						}
						dbExpense.collection("pettyLiquidation").
						doc(self.editLiquidate.id)
						.update({
							date: self.editLiquidate.date,
							amountReceived: parseFloat(self.editLiquidate.amountReceived.replaceAll(",","")),
							totalAmount: self.editLiquidate.totalAmount,
							returnAmount: parseFloat(editAmount).toFixed(2),
							nameReference: self.editLiquidate.name,
							dateModified: today
						}).then(() => {
							self.$swal({
								title: 'Success',
								text: 'Liquidation updated successfully!',
								icon: 'success',
								confirmButtonColor: '#b80000',
								confirmButtonText: 'OK'
							}).then(() => {
								self.$bvModal.hide("update-liquidation-modal");
								self.getLiquidations(1, 'change');
							});
							self.requestProcessing = false;
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
			// Delete liquidation details
			removeLiquidation(row){
				let self = this;
				self.$swal({
					title: 'Are you sure?',
					text: "You want to remove this liquidation",
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#C72111',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						self.requestProcessing = true;

						try{
							dbExpense.collection("pettyLiquidation")
							.doc(row.id)
							.delete()
							.then(() => {
								self.$swal({
									title: 'Success',
									text: 'Liquidation removed successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								}).then(() => {
									self.getLiquidations(1, 'change');
								});
								self.requestProcessing = false;
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
			// Show liquidation attachment modal
			openAttachments(liqui){
				this.attachId = liqui.pettyLiquidationId;
				this.$bvModal.show("attachment-modal");
				this.getAttachments(this.attachId);
			},
			// Save new liquidation attachment
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
				const storageRef = expenseStorage.ref('pettyCashFiles/' + self.attachId + '/' + data.name)
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
						self.getAttachments(self.attachId);
						self.getLiquidations(1,"list");
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
			// Display liquidation attachments
			getAttachments(id){
				let self= this, rowNum = 0;
				let listRef = expenseStorage.ref('pettyCashFiles/' + id);

				self.loadAttachment = true;
				self.attachments = [];
				listRef.listAll()
				.then((res) => {
					res.items.forEach((itemRef) => {
					expenseStorage.ref('pettyCashFiles/' + id + '/' + itemRef.name)
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
			// Delete liquidation attachment
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
						let deleteRef = expenseStorage.ref('pettyCashFiles/' + self.attachId + '/' + name);

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
									self.getAttachments(self.attachId);
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
			// Change petty cash status
			changeStatus(petty, status){
				let self = this;
				let msg = '';

				if(status == 1){
					msg = 'current'
				}else if(status == 2){
					msg = 'checked';
				}else if(status == 3){
					msg = 'processed';
				}
				self.$swal({
					title: 'Are you sure?',
					text: "You want to change the status to " + msg,
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#b80000',
					cancelButtonColor: '#C72111',
					confirmButtonText: 'CONFIRM' ,
				}).then((result) => {
					if(result.value){
						self.requestProcessing = true;

						try{
							dbExpense.collection("pettyCash")
							.doc(petty.id)
							.update({
								status: status,
								dateModified: today
							}).then(() => {
								self.$swal({
									title: 'Success',
									text: 'Petty cash status change successfully!',
									icon: 'success',
									confirmButtonColor: '#b80000',
									confirmButtonText: 'OK'
								}).then(() => {
									self.getPettyCash();
									self.getLiquidations(1, 'change');
								});
								self.requestProcessing = false;
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
					this.$router.push('/');
				}else if(userID != ''){
					let self = this;
					let userData = dbUsers.collection("users")
					.where("username", "==", userID);
					let users = [];

					userData.get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							users.push(doc.data());
						});
						self.preparedBy = users[0].firstname + ' ' + users[0].lastname;
					});
				}
			},
			// Print liquidation details
			printLiqui(){
				printJS({
					printable: 'viewSummary',
					type: 'html',
					style: '#viewSummary {font-family: "Calibri"; padding-left: 2px;} #particularStyle {text-align: center;} #particular {text-align: center;} #centerStyle {text-align: center;} #headerStyle {text-align: center; padding-top: 20px;} #borderStyle {border-width: 1px; border-style: solid;}',
					documentTitle: 'Liquidation'
				});
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
	#docStyle {
		display: block;
		overflow: inherit;
		white-space: normal;
	}
</style>