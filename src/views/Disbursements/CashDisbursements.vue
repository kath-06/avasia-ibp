<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5"></base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--7">
        <card>
          <!-- Cash disbursement status links -->
          <div class="row">
            <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
              <badge class="badge-dot ml-2 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Release'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getCashDisbursements('Release')">Release</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Cleared'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getCashDisbursements('Cleared')">Cleared</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'All'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getCashDisbursements('All')">All</span>
              </badge>
            </div>
          </div>
          <!-- Filter records -->
          <div class="row">
            <span class="col-sm-5"></span>
            <span class="col-2 pb-3 pl-4 text-right">
              <b>Filter by:</b>
            </span>
            <span class="col-sm-2 pb-2 text-right">
              <v-select id="inputStyle"
                :options="filters"
                :reduce="filter => filter.filterId"
                label="filter"
                v-model="filter"
                :clearable="false" readonly
                @input="getCashDisbursements(listType)"
                style="width: 150px;"></v-select>
            </span>
            <span class="col-sm-2 pl-0">
              <base-input class="pb-2"
                type="month"
                :max="maxDate"
                min="1997-01"
                v-model="dateCreated"
                @input="getCashDisbursements(listType)"
                style="width: 230px;"
                id="inputStyle"
                v-if="filter == 'month'"></base-input>
            </span>
          </div>
          <div class="table-full-width">
            <!-- Cash Disbursement table -->
            <vue-good-table :columns="columns"
              :rows="cashDisbursements"
              :search-options="{enabled: true}"
              :pagination-options="{
                enabled: true,
                perPageDropdown: [10, 15, 20],
              }"
              :sort-options="{enabled: true}"
              :line-numbers="true"
              :isLoading="loading"
              ref="cash-disbursement-table">
              <template slot="table-row" slot-scope="props">
                <b><span v-if="props.column.field == 'voucherNumber'">
                  <span v-on:click="openViewCashDisbursementModal(props.row)"
                    id="sideBarTxt"
                    class="pointer">{{props.row.voucherNumber}}</span>
                </span>
                <span v-if="props.column.field == 'amount'">
                  <span class="tableSpan">₱ {{props.row.amount}}</span>
                </span>
                <span v-if="props.column.field == 'transactionDate'">
                  <span>{{props.row.transactionDate | moment("MMM DD, YYYY")}}</span>
                </span>
                <span v-if="props.column.field == 'payeeName'">
                  <span>{{props.row.payeeName}}</span>
                </span>
                <span v-if="props.column.field == 'cdType'">
                  <span>{{props.row.cdType}}</span>
                </span>
                <span v-if="props.column.field == 'userReference'">
                  <span v-for="user in users"
                    v-bind:key="user.userId">
                    <span v-if="user.userId == props.row.userReference">{{ user.firstname }} {{ user.lastname }}</span>
                  </span>
                  <span v-if="props.row.userReference == ''"> 
                    <span>----------</span>
                  </span>
                </span>
                <span v-if="props.column.field == 'status'">
                  <span v-if="props.row.status == 1"
                    id="sideBarTxt">RELEASE</span>
                  <span v-if="props.row.status == 2"
                    id="sideBarTxt">CLEARED</span>
                </span>
                <span v-if="props.column.field == 'action'">
                  <span class="pointer ml-2 far fa-edit"
                    id="sideBarTxt"
                    v-on:click="openUpdateCDModal(props.row)"
                    v-if="props.row.status == 1"
                    title="Update"></span>
                  <span class="pointer ml-2 far fa-check-square"
                    id="sideBarTxt"
                    v-on:click="changeStatus(props.row, 2)"
                    v-if="props.row.status == 1 && userRole != 'User'"
                    title="Cleared"></span>
                  <span class="pointer ml-2 far fa-square"
                    id="sideBarTxt"
                    v-on:click="changeStatus(props.row, 1)"
                    v-if="props.row.status == 2 && userRole != 'User'"
                    title="Release"></span>
                  <span class="pointer ml-2 fa fa-file"
                    id="sideBarTxt"
                    v-if="props.row.status == 1"
                    v-on:click="openAttachments(props.row)"
                    title="Attachment"></span>
                </span></b>
              </template>
            </vue-good-table>
          </div>
          <hr class="mb-2 mt-2">
          <!-- Limit records -->
          <div class="row pl-4"
            v-if="cashDisbursements.length">
            <div class="col-9"></div>
            <span class="col-1 pt-2 text-right">
              <b>View:</b>
            </span>
            <span class="col-sm-2">
              <v-select id="inputStyle"
                :options="views"
                :reduce="view => view.limitId"
                label="limit"
                v-model="limit"
                :clearable="false"
                @input="getCashDisbursements(listType)"></v-select>
            </span>
          </div>
          <hr class="mb-2 mt-2">
          <!-- New cash disbursment button -->
          <div class="text-right pt-2">
            <base-button v-b-modal.new-cash-disbursement-modal
              id="darkBtn"
              class="col-md-4 ml-2 mr-2">New Cash Disbursement</base-button>
          </div>
        </card>
        <!-- Print duplicate view -->
        <div class="pl-4 shadow"
          id="duplicateView">
          <div class="row">
            <span class="col-sm-6">
              <b>CASH DISBURSEMENT</b>
            </span>
            <span class="col-sm-6">
              <b>Voucher Number: {{view.voucherNumber}}</b>
            </span>
          </div>
          <hr>
          <div class="row">
            <span class="col-sm-6">
              <b>Transaction Date: </b>{{view.transactionDate | moment("MMMM DD, YYYY")}}
            </span>
            <span class="col-sm-6">
              <b>Amount: </b>₱ {{view.amount}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-12">
              <b>Payee Name: </b>{{view.payeeName}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Disbursement Type: </b>{{view.cdType}}
            </span>
            <span class="col-sm-6">
              <b>Chart of Account: </b>{{view.coa}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Business Type: </b>{{view.businessType}}
            </span>
          </div>
          <hr/>
          <div class="row">
            <span class="col-sm-5">
              <b>Received Payment by : </b>
            </span>
            <span class="col-sm-1"></span>
            <span class="col-sm-5">
              <b>Prepared by :</b> {{user.firstname}} {{user.lastname}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-5">
              <b>Certified by : </b>
            </span>
            <span class="col-sm-1"></span>
            <span class="col-sm-5">
              <b>Approved by : </b>
            </span>
          </div>
          <br>
          <span v-for="index in breakCounts" :key="index"><br></span>
          <br>
          <div class="row">
            <span class="col-sm-6">
                <b>CASH DISBURSEMENT</b>
              </span>
            <span class="col-sm-6">
            <b>Voucher Number: {{view.voucherNumber}}</b>
          </span>
          </div>
          <hr>
          <div class="row">
            <span class="col-sm-6">
              <b>Transaction Date: </b>{{view.transactionDate | moment("MMMM DD, YYYY")}}
            </span>
            <span class="col-sm-6">
              <b>Amount: </b>₱ {{view.amount}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-12">
              <b>Payee Name: </b>{{view.payeeName}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Disbursement Type: </b>{{view.cdType}}
            </span>
            <span class="col-sm-6">
              <b>Chart of Account: </b>{{view.coa}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Business Type: </b>{{view.businessType}}
            </span>
          </div>
          <hr/>
          <div class="row">
            <span class="col-sm-5">
              <b>Received Payment by : </b>
            </span>
            <span class="col-sm-1"></span>
            <span class="col-sm-5">
              <b>Prepared by :</b> {{user.firstname}} {{user.lastname}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-5">
              <b>Certified by : </b>
            </span>
            <span class="col-sm-1"></span>
            <span class="col-sm-5">
              <b>Approved by : </b>
            </span>
          </div>
        </div>
        <!-- NEW CASH DISBURSEMENT MODAL -->
        <b-modal size="xl"
          id="new-cash-disbursement-modal"
          title="New Cash Disbursement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Transaction Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Payee Name:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newTransDate"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.newTransDate.$anyDirty && !$v.newTransDate.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newPayeeName"
                type="text"
                placeholder="Payee Name"></base-input>
              <i class="text-red"
                v-if="$v.newPayeeName.$anyDirty && !$v.newPayeeName.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newPayeeName.$anyDirty && !$v.newPayeeName.alphaCustomValidator">Invalid Characters</i>
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
                placeholder="Amount"></base-input>
              <i class="text-red"
                v-if="$v.newAmount.$anyDirty && !$v.newAmount.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newAmount.$anyDirty && !$v.newAmount.amountCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-4 pl-5">
              <v-select id="inputStyle"
                :options="cdTypes"
                :reduce="cdType => cdType.cashDisbursementTypeId"
                label="type"
                v-model="newCDType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newCDType.$anyDirty && !$v.newCDType.required">Field Required</i>
            </div>
            <div class="col-sm-2 pr-5">
              <base-button block id="darkBtn"
                v-b-modal.new-cash-disbursement-type-modal
                :disabled="requestProcessing">Add</base-button>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Chart of Accounts:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Business Types:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="coas"
                :reduce="coa => coa.accountId"
                label="account"
                v-model="newCOA"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newCOA.$anyDirty && !$v.newCOA.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="businessTypes"
                :reduce="type => type.businessTypeId"
                label="type"
                v-model="newBusinessType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newBusinessType.$anyDirty && !$v.newBusinessType.required">Field Required</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="newCashDisbursement"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Add
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('new-cash-disbursement-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- ADD CASH DISBURSEMENT TYPE MODAL -->
        <b-modal size="md"
          id="new-cash-disbursement-type-modal"
          title="New Cash Disbursement Type" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Type:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <base-input v-model="newType"
                id="inputStyle"
                type="text"
                placeholder="Type"></base-input>
              <i class="text-red"
                v-if="$v.newType.$anyDirty && !$v.newType.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newType.$anyDirty && !$v.newType.alphaNumCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="addCDType"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Add
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('new-cash-disbursement-type-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- VIEW CASH ADVANCE MODAL -->
        <b-modal size="xl"
          id="view-cash-disbursement-modal"
          title="View Cash Disbursement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <card class="pl-4 pt-5 pb-5 shadow"
            id="singleView">
            <div class="row">
              <span class="col-sm-6">
                <b>CASH DISBURSEMENT</b>
              </span>
              <span class="col-sm-6">
              <b>Voucher Number: {{view.voucherNumber}}</b>
            </span>
            </div>
            <hr>
            <div class="row">
              <span class="col-sm-6">
                <b>Transaction Date: </b>{{view.transactionDate | moment("MMMM DD, YYYY")}}
              </span>
              <span class="col-sm-6">
                <b>Amount: </b>₱ {{view.amount}}
              </span>
            </div>
            <div class="row">
              <span class="col-sm-12">
                <b>Payee Name: </b>{{view.payeeName}}
              </span>
            </div>
            <div class="row">
              <span class="col-sm-6">
                <b>Disbursement Type: </b>{{view.cdType}}
              </span>
              <span class="col-sm-6">
                <b>Chart of Account: </b>{{view.coa}}
              </span>
            </div>
            <div class="row">
              <span class="col-sm-6">
                <b>Business Type: </b>{{view.businessType}}
              </span>
            </div>
            <hr/>
            <div class="row">
              <span class="col-sm-5">
                <b>Received Payment by : </b>
              </span>
              <span class="col-sm-1"></span>
              <span class="col-sm-5">
                <b>Prepared by :</b> {{user.firstname}} {{user.lastname}}
              </span>
            </div>
            <div class="row">
              <span class="col-sm-5">
                <b>Certified by : </b>
              </span>
              <span class="col-sm-1"></span>
              <span class="col-sm-5">
                <b>Approved by : </b>
              </span>
            </div>
          </card>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="printCashDisbursment"
                  :disabled="requestProcessing">
                  Print
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('view-cash-disbursement-modal')"
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
          <card shadow v-if="attachments.length > 0 && !loadAttachment">
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
        <!-- UPDATE CASH DISBURSEMENT MODAL -->
        <b-modal size="xl"
          id="edit-cash-disbursement-modal"
          title="Edit Cash Disbursement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Transaction Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Payee Name:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.transDate"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.transDate.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.payeeName"
                type="text"
                placeholder="Payee Name"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.payeeName.required">Field Required</i>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.payeeName.alphaCustomValidator">Invalid Characters</i>
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
              <base-input v-model="edit.amount"
                type="text"
                placeholder="Amount"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.amount.required">Field Required</i>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.amount.amountCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-4 pl-5">
              <v-select id="inputStyle"
                :options="cdTypes"
                :reduce="cdType => cdType.cashDisbursementTypeId"
                label="type"
                v-model="edit.cdType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.cdType.required">Field Required</i>
            </div>
            <div class="col-sm-2 pr-5">
              <base-button block id="darkBtn"
                v-b-modal.new-cash-disbursement-type-modal
                :disabled="requestProcessing">Add</base-button>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Chart of Accounts:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Business Types:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="coas"
                :reduce="coa => coa.accountId"
                label="account"
                v-model="edit.coa"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.coa.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="businessTypes"
                :reduce="type => type.businessTypeId"
                label="type"
                v-model="edit.businessType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.businessType.required">Field Required</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="updateCashDisbursement"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Update
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('edit-cash-disbursement-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
      </div>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbMains, storageMains} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import imageCompression from 'browser-image-compression';
  import {upperCase} from "text-case";
  import printJS from "print-js";
  import {mapGetters} from "vuex";

  const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z ., ]*$/);
  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ., ]*$/);
  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Cash disbursement table
        columns: [{
            label: 'Voucher No.',
            field: 'voucherNumber'
          },{
            label: 'Amount',
            field: 'amount'
          },{
            label: 'Transaction Date',
            field: 'transactionDate'
          },{
            label: 'Payee Name',
            field: 'payeeName'
          },{
            label: 'Disbursement Type',
            field: 'cdType'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: 'Status',
            field: 'status'
          },{
            label: '',
            field: 'action',
            width: '100px',
            sortable: false
          }
        ],
        userRole: '',
        loading: true,
        cashDisbursements: [],
        requestProcessing: false,
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "30",
        filters: [
          {"filterId": "month", "filter": 'Month'}
        ],
        filter: 'month',
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        // New cash disbursement type
        newType: '',
        // New cash disbursement
        cdTypes: [],
        coas: [],
        businessTypes: [],
        newTransDate: moment().format("YYYY-MM-DD"),
        newPayeeName: '',
        newAmount: '',
        newCDType: '',
        newCOA:'',
        newBusinessType: '',
        // View cash disbursement
        view: {
          voucherNumber: '',
          amount: '',
          transactionDate: '',
          payeeName: '',
          cdType: '',
          coa: '',
          businessType: ''
        },
        // Cash disbursement attachment
        attachment: '',
        attachmentData: null,
        attachments: [],
        cdId: '',
        uploadValue: 0,
        loadAttachment: true,
        // Edit cash disbursement
        edit: {
          id: '',
          cdId: '',
          transDate: '',
          payeeName: '',
          amount: '',
          cdType: '',
          coa: '',
          businessType: '',
        }, 
        user: {
          firstname: '',
          lastname: ''
        },
        breakCounts: 18,
      };
    },
    async mounted() {
      this.getUserRole();
      this.getCashDisbursements("Release");
      this.getCashDisbursementTypes();
      this.getChartOfAccounts();
      this.getBusinessTypes();
      this.getUser();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New cash disbursement validations
      newTransDate: {required},
      newPayeeName: {
        required,
        alphaCustomValidator
      },
      newAmount: {
        required,
        amountCustomValidator
      },
      newCDType: {required},
      newCOA: {required},
      newBusinessType: {required},
      newType: {
        required,
        alphaNumCustomValidator
      },
      // Edit cash disbursement validations
      edit: {
        transDate: {required},
        payeeName: {
          required,
          alphaCustomValidator
        },
        amount: {
          required,
          amountCustomValidator
        },
        cdType: {required},
        coa: {required},
        businessType: {required}
      }
    },
    methods: {
      // Get user role
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
      // Get cash disbursement type data
      getCashDisbursementTypes(){
        let self = this;
        let cdTypeData = dbMains.collection("cashDisbursementTypes")
          .orderBy("type","asc");

        self.cdTypes = [];
        cdTypeData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.cdTypes.push(doc.data());
          });
          self.newCDType = self.cdTypes[0].cashDisbursementTypeId;
        });
      },
      // Get chart of account data
      getChartOfAccounts(){
        let self = this;
        let coaData = dbMains.collection("chartOfAccounts")
          .orderBy("account","asc");

        self.coas = [];
        coaData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.coas.push(doc.data());
          });
          self.newCOA = self.coas[0].accountId;
        });
      },
      // Get business type data
      getBusinessTypes(){
        let self = this;
        let typeData = dbMains.collection("businessTypes")
          .orderBy("type","asc");

        self.businessTypes = [];
        typeData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.businessTypes.push(doc.data());
          });
          self.newBusinessType = self.businessTypes[0].businessTypeId;
        });
      },
      // Add new cash disbursement type
      addCDType(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newType.$touch();
        if(!self.$v.newType.$error){
          let cdData = null;

          self.requestProcessing = true;
          cdData = dbMains.collection('cashDisbursementTypes')
            .where("type", "==", upperCase(self.newType));
          cdData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Cash disbursement type already exists.',
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
              let dataId = 'CDTI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('cashDisbursementTypes').doc()
                  .set({
                    cashDisbursementTypeId: dataId,
                    type: upperCase(self.newType),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newType = '';
                    self.requestProcessing = false;
                    self.$v.newType.$reset();
                    self.$bvModal.hide('new-cash-disbursement-type-modal');
                    self.getCashDisbursementTypes();
                    self.$swal({
                      title: 'Success',
                      text: 'New cash disbursement type added successfully!',
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
      // Save new cash disbursement data
      newCashDisbursement(){
        let self = this;

        self.$v.newTransDate.$touch();
        self.$v.newPayeeName.$touch();
        self.$v.newAmount.$touch();
        self.$v.newCDType.$touch();
        self.$v.newCOA.$touch();
        self.$v.newBusinessType.$touch();
        if(!self.$v.newTransDate.$error && !self.$v.newPayeeName.$error && !self.$v.newAmount.$error && !self.$v.newCDType.$error && !self.$v.newCOA.$error && !self.$v.newBusinessType.$error){
          self.requestProcessing = true;
          try{
            let getUserId = dbUsers.collection('users')
              .where("username", '==', localStorage.getItem('aisname'));
            let users = [];
            let dataId = 'CDI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
            let voucher = dbUsers.collection('cashDisbursements')
                .orderBy('dateCreated', 'desc').limit(1);
            let vouch = '';

            voucher.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  vouch = doc.data().voucherNumber;
                }
              });
              let lastVoucher = '';
              let genVoucherNo = new Date();

              if(vouch != ''){
                lastVoucher = addZero(parseInt(vouch.slice(7)) + 1, 4);
                if(lastVoucher.toString() == '1000'){
                  lastVoucher = '0001';
                }
              }else{
                lastVoucher = '0001';
              }
              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  users.push(doc.data());
                });
                dbUsers.collection("cashDisbursements").doc()
                .set({
                  cashDisbursementId: dataId,
                  transactionDate: self.newTransDate,
                  payeeName: self.newPayeeName,
                  amount: self.newAmount,
                  voucherNumber: addZero(genVoucherNo.getMonth() + 1) + '' + (genVoucherNo.getFullYear().toString()).slice(2,4) + '-1' + lastVoucher,
                  disbursementTypeReference: self.newCDType,
                  accountReference: self.newCOA,
                  businessTypeReference: self.newBusinessType,
                  status: 1,
                  userReference: users[0].userId,
                  dateCreated: today,
                  dateModified: today
                }).then(() => {
                  self.newTransDate = moment().format("YYYY-MM-DD");
                  self.newPayeeName = '';
                  self.newAmount = '';
                  self.newCDType = '';
                  self.newCOA = '';
                  self.newBusinessType = '';
                  self.requestProcessing = false;
                  self.$v.newTransDate.$reset();
                  self.$v.newPayeeName.$reset();
                  self.$v.newAmount.$reset();
                  self.$v.newCDType.$reset();
                  self.$v.newCOA.$reset();
                  self.$v.newBusinessType.$reset();
                  self.$bvModal.hide('new-cash-disbursement-modal');
                  self.$refs['cash-disbursement-table'].reset();
                  self.getChartOfAccounts();
                  self.getBusinessTypes();
                  self.getCashDisbursements(self.listType);
                  self.$swal({
                    title: 'Success',
                    text: 'New cash disbursement added successfully!',
                    icon: 'success',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
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
              confirmButtonColor: '#b80000',
              confirmButtonText: 'OK'
            });
          }
        }
      },
      // Display cash disbursement data on table
      getCashDisbursements(type) {
        let self = this, cdData = null, ids = [], cd = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');
        self.username = localStorage.getItem('aisname');
        self.accountName = self.username.toUpperCase();

        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let accounts = [], user = '', accountId = '';

        userAccount.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            accounts.push(doc.data());
          });
          accountId = accounts[0].userId;
          let userRole = dbUsers.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let roles = [];

          userRole.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              roles.push(doc.data());
            });
            user = roles[0].userRole;
            self.loading = true;
            self.cashDisbursements = [];
            self.listType = type;
            if(user == 'Administrator' || user == 'Manager'){
              if(type == "Release"){
                if(self.limit != "all"){
                  cdData = dbUsers.collection("cashDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==",1)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  cdData = dbUsers.collection("cashDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==",1);
                }
              }else if(type == "Cleared"){
                if(self.limit != "all"){
                  cdData = dbUsers.collection("cashDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==", 2)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  cdData = dbUsers.collection("cashDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==", 2)
                }
              }else if(type == "All"){
                if(self.limit != "all"){
                  cdData = dbUsers.collection("cashDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  cdData = dbUsers.collection("cashDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end);
                }
              }
            }else if(user == 'User'){
              if(type == "Release"){
                if(self.limit != "all"){
                  cdData = dbUsers.collection("cashDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==",1)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  cdData = dbUsers.collection("cashDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==",1);
                }
              }else if(type == "Cleared"){
                if(self.limit != "all"){
                  cdData = dbUsers.collection("cashDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==", 2)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  cdData = dbUsers.collection("cashDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==", 2)
                }
              }else if(type == "All"){
                if(self.limit != "all"){
                  cdData = dbUsers.collection("cashDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  cdData = dbUsers.collection("cashDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId);
                }
              }
            }
            cdData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  cd.push(doc.data());
                  ids.push(doc.id);
                });
                let cdTypeData = dbMains.collection("cashDisbursementTypes");
                let coaData = dbMains.collection("chartOfAccounts");
                let bTypeData = dbMains.collection("businessTypes");
                let cdts = [], accounts = [], types = [];

                cdTypeData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    cdts.push(doc.data());
                  });
                  coaData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      accounts.push(doc.data());
                    });
                    bTypeData.get().then((querySnapshot) => {
                      querySnapshot.forEach((doc) => {
                        types.push(doc.data());
                      });
                      for(let i = 0; i < cd.length; i++){
                        cd[i]["id"] = ids[i];
                        cd[i]["cdType"] = '';
                        cd[i]["coa"] = '';
                        cd[i]["businessType"] = '';
                        cd[i].amount = format(parseFloat(cd[i].amount.replaceAll(",","")).toFixed(2));
                        self.cashDisbursements.push(cd[i]);
                        for(let a = 0; a < cdts.length; a++){
                          if(cdts[a].cashDisbursementTypeId == cd[i].disbursementTypeReference){
                            cd[i].cdType = cdts[a].type;
                          }
                        }
                        for(let b = 0; b < accounts.length; b++){
                          if(accounts[b].accountId == cd[i].accountReference){
                            cd[i].coa = accounts[b].account;
                          }
                        }
                        for(let c = 0; c < types.length; c++){
                          if(types[c].businessTypeId == cd[i].businessTypeReference){
                            cd[i].businessType = types[c].type;
                          }
                        }
                      }
                    });
                  });
                });
              }
              setTimeout(function() {
                self.loading = false;
              }, 1000);
            });
          });
        });
      },
      // View cash disbursement details
      openViewCashDisbursementModal(row){
        let self = this;

        self.view = {
          voucherNumber: row.voucherNumber,
          amount: row.amount,
          transactionDate: row.transactionDate,
          payeeName: row.payeeName,
          cdType: row.cdType,
          coa: row.coa,
          businessType: row.businessType
        };
        self.$bvModal.show("view-cash-disbursement-modal");
      },
      // Add new cash disbursement attachment
      openAttachments(row){
        this.cdId = row.cashDisbursementId;
        this.attachmentStatus = row.status;
        this.$bvModal.show("attachment-modal");
        this.getAttachments(this.cdId);
      },
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
        const storageRef = storageMains.ref('cashDisbursements/' + self.cdId + '/' + data.name)
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
            self.getAttachments(self.cdId);
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
      // Get cash disbursement attachment
      getAttachments(id){
        let self= this, rowNum = 0;
        let listRef = storageMains.ref('cashDisbursements/' + id);

        self.loadAttachment = true;
        self.attachments = [];
        listRef.listAll()
        .then((res) => {
          res.items.forEach((itemRef) => {
          storageMains.ref('cashDisbursements/' + id + '/' + itemRef.name)
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
      // Delete cash disbursement attachment
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
            let deleteRef = storageMains.ref('cashDisbursements/' + self.cdId + '/' + name);

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
                  self.getAttachments(self.cdId);
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
      // Show edit cash disbursement form
      openUpdateCDModal(row){
        let self = this;

        self.edit = {
          id: row.id,
          cdId: row.cashDisbursementId,
          transDate: row.transactionDate,
          payeeName: row.payeeName,
          amount: row.amount,
          cdType: row.disbursementTypeReference,
          coa: row.accountReference,
          businessType: row.businessTypeReference
        };
        self.$bvModal.show("edit-cash-disbursement-modal");
      },
      // Change cash disbursement details
      updateCashDisbursement(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          try{
            dbUsers.collection("cashDisbursements")
            .doc(self.edit.id)
            .update({
              transactionDate: self.edit.transDate,
              payeeName: self.edit.payeeName,
              amount: self.edit.amount,
              disbursementType: self.edit.cdType,
              accountReference: self.edit.coa,
              businessTypeReference: self.edit.businessType,
              dateModified: today
            }).then(() => {
              self.edit = {
                id: '',
                cdId: '',
                transDate: '',
                payeeName: '',
                amount: '',
                cdType: '',
                coa: '',
                businessType: ''
              };
              self.requestProcessing = false;
              self.$v.edit.$reset();
              self.$bvModal.hide('edit-cash-disbursement-modal');
              self.$refs['cash-disbursement-table'].reset();
              self.getCashDisbursements(self.listType);
              self.$swal({
                title: 'Success',
                text: 'Cash disbursment updated successfully!',
                icon: 'success',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
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
      // Change cash disbursement status
      changeStatus(row, stat){
        let self = this, msg =  '';

        if(stat == 1){
          msg = 'Release';
        }else if(stat == 2){
          msg = "Cleared";
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
            dbUsers.collection("cashDisbursements")
            .doc(row.id)
            .update({
              status: stat,
              dateModified: today
            }).then(() => {
              self.$refs['cash-disbursement-table'].reset();
              self.getCashDisbursements(msg);
              self.$swal({
                title: 'Success',
                text: 'Cash disbursement status change successfully!',
                icon: 'success',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            });
          }
        });
      },
      // Print cash disbursement details
      printCashDisbursment(){
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
              documentTitle: 'Cash Disbursement Voucher',
            });
          }else{
            printJS({
              printable: 'singleView',
              type: 'html',
              style: '#singleView {font-family: "Calibri";} #borderStyle {border-width: 1px; border-style: solid;} #docStyle {display: block; overflow: inherit; white-space: normal; font-size: 12px;}',
              documentTitle: 'Cash Disbursement Voucher',
            });
          }
        });
      },
    }
  }
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem;}
  #duplicateView {
    position: absolute;
    visibility: hidden;
    width: 95%;
    top: -500px;
  }
</style>
