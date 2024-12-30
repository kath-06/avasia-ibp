<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5"></base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--7">
        <card>
          <!-- Remittance disbursement status links -->
          <div class="row">
            <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
              <badge class="badge-dot ml-2 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Release'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getRemittanceDisbursements('Release')">Release</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Cleared'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getRemittanceDisbursements('Cleared')">Cleared</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'All'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getRemittanceDisbursements('All')">All</span>
              </badge>
            </div>
          </div>
          <!-- Filter records on table -->
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
                @input="getRemittanceDisbursements(listType)"
                style="width: 150px;"></v-select>
            </span>
            <span class="col-sm-2 pl-0">
              <base-input class="pb-2"
                type="month"
                :max="maxDate"
                min="1997-01"
                v-model="dateCreated"
                @input="getRemittanceDisbursements(listType)"
                style="width: 230px;"
                id="inputStyle"
                v-if="filter == 'month'"></base-input>
            </span>
          </div>
          <div class="table-full-width">
            <!-- Remittance disbursment table -->
            <vue-good-table :columns="columns"
              :rows="remittanceDisbursements"
              :search-options="{enabled: true}"
              :pagination-options="{
                enabled: true,
                perPageDropdown: [10, 15, 20],
              }"
              :sort-options="{enabled: true}"
              :line-numbers="true"
              :isLoading="loading"
              ref="remittance-disbursement-table">
              <template slot="table-row" slot-scope="props">
                <b><span v-if="props.column.field == 'voucherNumber'">
                  <span v-on:click="openViewRemittanceDisbursementModal(props.row)"
                    id="sideBarTxt"
                    class="pointer">{{props.row.voucherNumber}}</span>
                </span>
                <span v-if="props.column.field == 'transactionDate'">
                  <span>{{props.row.transactionDate | moment("MMM DD, YYYY")}}</span>
                </span>
                <span v-if="props.column.field == 'amount'">
                  <span class="tableSpan">₱ {{props.row.amount}}</span>
                </span>
                <span v-if="props.column.field == 'name'">
                  <span>{{props.row.name}}</span>
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
                    v-on:click="openUpdateRDModal(props.row)"
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
          <!-- Limit records on table -->
          <div class="row pl-4"
            v-if="remittanceDisbursements.length">
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
                @input="getRemittanceDisbursements(listType)"></v-select>
            </span>
          </div>
          <hr class="mb-2 mt-2">
          <!-- New remittance disbursement button -->
          <div class="text-right pt-2">
            <base-button v-b-modal.new-remittance-disbursement-modal
              id="darkBtn"
              class="col-md-4 ml-2 mr-2">New Remittance Disbursement</base-button>
          </div>
        </card>
        <!-- Remittance disbursement print duplicate -->
        <div class="pl-4"
          id="duplicateView">
          <div class="row">
            <span class="col-sm-6">
              <b>REMITTANCE DISBURSEMENT</b>
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
            <span class="col-sm-6">
              <b>ID Number: </b>{{view.idNumber}}
            </span>
            <span class="col-sm-6">
              <b>Name: </b>{{view.name}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Description: </b>{{view.description}}
            </span>
            <span class="col-sm-6">
              <b>Email: </b>{{view.email}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Contact Number: </b>{{view.contactNumber}}
            </span>
            <span class="col-sm-6">
              <b>Penalty: </b>{{view.penalty}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Payment Type: </b>{{view.paymentType}}
            </span>
            <span class="col-sm-6"
              v-if="view.paymentType == 'Check'">
              <b>Check No: </b>{{view.checkReference}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Type: </b>{{view.type}}
            </span>
            <span class="col-sm-6">
              <b>Account: </b>{{view.account}}
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
              <b>REMITTANCE DISBURSEMENT</b>
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
            <span class="col-sm-6">
              <b>ID Number: </b>{{view.idNumber}}
            </span>
            <span class="col-sm-6">
              <b>Name: </b>{{view.name}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Description: </b>{{view.description}}
            </span>
            <span class="col-sm-6">
              <b>Email: </b>{{view.email}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Contact Number: </b>{{view.contactNumber}}
            </span>
            <span class="col-sm-6">
              <b>Penalty: </b>{{view.penalty}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Payment Type: </b>{{view.paymentType}}
            </span>
            <span class="col-sm-6"
              v-if="view.paymentType == 'Check'">
              <b>Check No: </b>{{view.checkReference}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Type: </b>{{view.type}}
            </span>
            <span class="col-sm-6">
              <b>Account: </b>{{view.account}}
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
        <!-- NEW REMITTANCE DISBURSEMENT MODAL -->
        <b-modal size="xl"
          id="new-remittance-disbursement-modal"
          title="New Remittance Disbursement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Transaction Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Amount:</b>
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
              <base-input v-model="newAmount"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newAmount.$anyDirty && !$v.newAmount.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newAmount.$anyDirty && !$v.newAmount.amountCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>ID Number:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Name:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newIDNumber"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newIDNumber.$anyDirty && !$v.newIDNumber.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newIDNumber.$anyDirty && !$v.newIDNumber.numCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newName"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newName.$anyDirty && !$v.newName.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newName.$anyDirty && !$v.newName.alphaCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Description:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Email:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <textarea v-model="newDescription"
                rows="4"
                cols="59"
                id="inputStyle"></textarea>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newEmail"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newEmail.$anyDirty && !$v.newEmail.email">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Contact Number:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Penalty Amount:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newContactNumber"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newContactNumber.$anyDirty && !$v.newContactNumber.numCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newPenalty"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newPenalty.$anyDirty && !$v.newPenalty.amountCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Payment Type:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label"
              v-if="newPaymentType == 'Check'">
              <b>Check Number:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="paymentTypes"
                :reduce="type => type.type"
                label="type"
                v-model="newPaymentType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newPaymentType.$anyDirty && !$v.newPaymentType.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5"
              v-if="newPaymentType == 'Check'">
              <base-input v-model="newCheckNo"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newCheckNo.$anyDirty && !$v.newCheckNo.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newCheckNo.$anyDirty && !$v.newCheckNo.numCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Type:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Chart of Accounts:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-4 pl-5">
              <v-select id="inputStyle"
                :options="rdTypes"
                :reduce="rdType => rdType.remittanceDisbursementTypeId"
                label="type"
                v-model="newRType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newRType.$anyDirty && !$v.newRType.required">Field Required</i>
            </div>
            <div class="col-sm-2 pr-5">
              <base-button block id="darkBtn"
                v-b-modal.new-remittance-disbursement-type-modal
                :disabled="requestProcessing">Add</base-button>
            </div>
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
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Business Types:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
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
                  @click.native="newRemittanceDisbursement"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Add
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('new-remittance-disbursement-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- ADD REMITTANCE DISBURSEMENT TYPE MODAL -->
        <b-modal size="md"
          id="new-remittance-disbursement-type-modal"
          title="New Remittance Disbursement Type" centered
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
                  @click.native="addRDType"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Add
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('new-remittance-disbursement-type-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- VIEW REMITTANCE DISBURSEMENT MODAL -->
        <b-modal size="xl"
          id="view-remittance-disbursement-modal"
          title="View Remittance Disbursement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <card class="pl-4 pt-5 pb-5 shadow"
            id="singleView">
            <div class="row">
              <span class="col-sm-6">
                <b>REMITTANCE DISBURSEMENT</b>
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
              <span class="col-sm-6">
                <b>ID Number: </b>{{view.idNumber}}
              </span>
              <span class="col-sm-6">
                <b>Name: </b>{{view.name}}
              </span>
            </div>
            <div class="row">
              <span class="col-sm-6">
                <b>Description: </b>{{view.description}}
              </span>
              <span class="col-sm-6">
                <b>Email: </b>{{view.email}}
              </span>
            </div>
            <div class="row">
              <span class="col-sm-6">
                <b>Contact Number: </b>{{view.contactNumber}}
              </span>
              <span class="col-sm-6">
                <b>Penalty: </b>{{view.penalty}}
              </span>
            </div>
            <div class="row">
              <span class="col-sm-6">
                <b>Payment Type: </b>{{view.paymentType}}
              </span>
              <span class="col-sm-6"
                v-if="view.paymentType == 'Check'">
                <b>Check No: </b>{{view.checkReference}}
              </span>
            </div>
            <div class="row">
              <span class="col-sm-6">
                <b>Type: </b>{{view.type}}
              </span>
              <span class="col-sm-6">
                <b>Account: </b>{{view.account}}
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
                  @click.native="printRemittanceDisbursement"
                  :disabled="requestProcessing">
                  Print
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('view-remittance-disbursement-modal')"
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
        <!-- UPDATE REMITTANCE DISBURSEMENT MODAL -->
        <b-modal size="xl"
          id="edit-remittance-disbursement-modal"
          title="Edit Remittance Disbursement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Transaction Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Amount:</b>
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
              <base-input v-model="edit.amount"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.amount.required">Field Required</i>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.amount.amountCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>ID Number:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Name:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.idNumber"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.idNumber.required">Field Required</i>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.idNumber.numCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.name"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.name.required">Field Required</i>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.name.alphaCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Description:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Email:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <textarea v-model="edit.description"
                rows="4"
                cols="59"
                id="inputStyle"></textarea>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.email"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.email.email">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Contact Number:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Penalty Amount:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.contactNumber"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.contactNumber.numCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.penalty"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.penalty.amountCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Payment Type:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label"
              v-if="newPaymentType == 'Check'">
              <b>Check Number:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="paymentTypes"
                :reduce="type => type.type"
                label="type"
                v-model="edit.paymentType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.paymentType.required">Field Required</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5"
              v-if="edit.paymentType == 'Check'">
              <base-input v-model="edit.checkNo"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.checkNo.required">Field Required</i>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.checkNo.numCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Type:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Chart of Accounts:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <v-select id="inputStyle"
                :options="rdTypes"
                :reduce="rdType => rdType.remittanceDisbursementTypeId"
                label="type"
                v-model="edit.rType"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.rType.required">Field Required</i>
            </div>
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
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Business Types:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
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
                  @click.native="updateRemittanceDisbursement"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Update
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('edit-remittance-disbursement-modal')"
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
  import {helpers, required, email} from "vuelidate/lib/validators";
  import imageCompression from 'browser-image-compression';
  import printJS from "print-js";
  import {upperCase} from "text-case";
  import {mapGetters} from "vuex";

  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ., ]*$/);
  const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z -., ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
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
        // Remittance disbursement table
        columns: [{
            label: 'Voucher No.',
            field: 'voucherNumber'
          },{
            label: 'Transaction Date',
            field: 'transactionDate'
          },{
            label: 'Amount',
            field: 'amount'
          },{
            label: 'Name',
            field: 'name'
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
        loading: true,
        remittanceDisbursements: [],
        // Users
        userRole: '',
        user: {
          firstname: '',
          lastname: ''
        },
        // Enable or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "30",
        // Filter records
        filters: [
          {"filterId": "month", "filter": 'Month'}
        ],
        filter: 'month',
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        // New remittance disbursement
        newType: '',
        banks: [],
        bankAccounts: [],
        paymentTypes: [
          {"type": 'Cash'},
          {"type": 'Check'}
        ],
        rdTypes: [],
        coas: [],
        businessTypes: [],
        newTransDate: moment().format("YYYY-MM-DD"),
        newAmount: '',
        newIDNumber: '',
        newName: '',
        newDescription:'',
        newEmail: '',
        newContactNumber: '',
        newPenalty: '',
        newPaymentType: 'Cash',
        newCheckNo: '',
        newRType: '',
        newCOA: '',
        newBusinessType: '',
        // View remittance disbursement
        view: {
          voucherNumber: '',
          amount: '',
          transactionDate: '',
          idNumber: '',
          name: '',
          description: '',
          email: '',
          contactNumber: '',
          penalty: '',
          paymentType: '',
          checkReference: '',
          type: '',
          account: '',
          businessType: ''
        },
        // Remittance disbursement attachment
        attachment: '',
        attachmentData: null,
        attachments: [],
        rdId: '',
        uploadValue: 0,
        loadAttachment: true,
        // Edit remittance disbursement
        edit: {
          id: '',
          rdId: '',
          transDate: '',
          amount: '',
          idNumber: '',
          name: '',
          description: '',
          email: '',
          contactNumber: '',
          penalty: '',
          paymentType: '',
          checkNo: '',
          rType: '',
          coa: '',
          businessType: ''
        },
        // Remittance disbursement print space breaks
        breakCounts: 15,
      };
    },
    async mounted() {
      this.getUserRole();
      this.getRemittanceDisbursements("Release");
      this.getRemittanceDisbursementTypes();
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
      // New remittance disbursement validations
      newType: {
        required,
        alphaNumCustomValidator
      },
      newTransDate: {required},
      newAmount: {
        required,
        amountCustomValidator
      },
      newIDNumber: {
        required,
        numCustomValidator
      },
      newName: {
        required,
        alphaCustomValidator
      },
      newEmail: {email},
      newContactNumber: {numCustomValidator},
      newPenalty: {amountCustomValidator},
      newPaymentType: {required},
      newCheckNo: {
        required,
        numCustomValidator
      },
      newRType: {required},
      newCOA: {required},
      newBusinessType: {required},
      // Edit remittance disbursement validations
      edit: {
        transDate: {required},
        amount: {
          required,
          amountCustomValidator
        },
        idNumber: {
          required,
          numCustomValidator
        },
        name: {
          required,
          alphaCustomValidator
        },
        email: {email},
        contactNumber: {numCustomValidator},
        penalty: {amountCustomValidator},
        paymentType: {required},
        checkNo: {
          required,
          numCustomValidator
        },
        rType: {required},
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
          self.newBankAccount = self.bankAccounts[0].bankAccountUid;
        });
      },
      // Get remittance disbursement type details
      getRemittanceDisbursementTypes(){
        let self = this;
        let rdTypeData = dbMains.collection("remittanceDisbursementTypes")
          .orderBy("type","asc");

        self.rdTypes = [];
        rdTypeData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.rdTypes.push(doc.data());
          });
          self.newRType = self.rdTypes[0].remittanceDisbursementTypeId;
        });
      },
      // Get chart of account details
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
      // Get business type details
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
      // Add new remittance disbursement type
      addRDType(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newType.$touch();
        if(!self.$v.newType.$error){
          let rdData = null;

          self.requestProcessing = true;
          rdData = dbMains.collection('remittanceDisbursementTypes')
            .where("type", "==", upperCase(self.newType));
          rdData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Remittance disbursement type already exists.',
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
              let dataId = 'RDTI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('remittanceDisbursementTypes').doc()
                  .set({
                    remittanceDisbursementTypeId: dataId,
                    type: upperCase(self.newType),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newType = '';
                    self.requestProcessing = false;
                    self.$v.newType.$reset();
                    self.$bvModal.hide('new-remittance-disbursement-type-modal');
                    self.getRemittanceDisbursementTypes();
                    self.$swal({
                      title: 'Success',
                      text: 'New remittance disbursement type added successfully!',
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
      // Save new remittance disbursement details
      newRemittanceDisbursement(){
        let self = this, foundError = false;

        self.$v.newTransDate.$touch();
        self.$v.newAmount.$touch();
        self.$v.newIDNumber.$touch();
        self.$v.newName.$touch();
        self.$v.newEmail.$touch();
        self.$v.newContactNumber.$touch();
        self.$v.newPenalty.$touch();
        self.$v.newPaymentType.$touch();
        self.$v.newCheckNo.$touch();
        self.$v.newRType.$touch();
        self.$v.newCOA.$touch();
        self.$v.newBusinessType.$touch();
        if(self.newPaymentType == 'Cash'){
          if(self.$v.newTransDate.$error || self.$v.newAmount.$error || self.$v.newIDNumber.$error || self.$v.newName.$error || self.$v.newEmail.$error || self.$v.newContactNumber.$error || self.$v.newPenalty.$error || self.$v.newPaymentType.$error || self.$v.newRType.$error || self.$v.newCOA.$error || self.$v.newBusinessType.$error){
            foundError = true;
          }
        }else if(self.newPaymentType == 'Check'){
          if(self.$v.newTransDate.$error || self.$v.newAmount.$error || self.$v.newIDNumber.$error || self.$v.newName.$error || self.$v.newEmail.$error || self.$v.newContactNumber.$error || self.$v.newPenalty.$error || self.$v.newPaymentType.$error || self.$v.newCheckNo.$error || self.$v.newRType.$error || self.$v.newCOA.$error || self.$v.newBusinessType.$error){
            foundError = true;
          }
        }
        if(!foundError){
          self.requestProcessing = true;
          try{
            let getUserId = dbUsers.collection('users')
              .where("username", '==', localStorage.getItem('aisname'));
            let users = [];
            let dataId = 'ReDI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
            let voucher = dbUsers.collection('remittanceDisbursements')
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
                dbUsers.collection("remittanceDisbursements").doc()
                .set({
                  remittanceDisbursementId: dataId,
                  transactionDate: self.newTransDate,
                  amount: self.newAmount,
                  voucherNumber: addZero(genVoucherNo.getMonth() + 1) + '' + (genVoucherNo.getFullYear().toString()).slice(2,4) + '-4' + lastVoucher,
                  idNumber: self.newIDNumber,
                  name: self.newName,
                  description: self.newDescription,
                  email: self.newEmail,
                  contactNumber: self.newContactNumber,
                  penalty: self.newPenalty,
                  paymentType: self.newPaymentType,
                  checkReference: self.newCheckNo,
                  remittanceTypeReference: self.newRType,
                  accountReference: self.newCOA,
                  businessTypeReference: self.newBusinessType,
                  status: 1,
                  userReference: users[0].userId,
                  dateCreated: today,
                  dateModified: today
                }).then(() => {
                  self.$swal({
                    title: 'Success',
                    text: 'New remittance disbursement added successfully!',
                    icon: 'success',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    self.newTransDate = moment().format("YYYY-MM-DD");
                    self.newAmount = '';
                    self.newIDNumber = '';
                    self.newName = '';
                    self.newDescription = '';
                    self.newEmail = '';
                    self.newContactNumber = '';
                    self.newPenalty = '';
                    self.newPaymentType = 'Cash';
                    self.newCheckNo = '';
                    self.newRType = '';
                    self.newCOA = '';
                    self.newBusinessType = '';
                    self.requestProcessing = false;
                    self.$v.newTransDate.$reset();
                    self.$v.newAmount.$reset();
                    self.$v.newIDNumber.$reset();
                    self.$v.newName.$reset();
                    self.$v.newEmail.$reset();
                    self.$v.newContactNumber.$reset();
                    self.$v.newPenalty.$reset();
                    self.$v.newPaymentType.$reset();
                    self.$v.newCheckNo.$reset();
                    self.$v.newRType.$reset();
                    self.$v.newCOA.$reset();
                    self.$v.newBusinessType.$reset();
                    self.$bvModal.hide('new-remittance-disbursement-modal');
                    self.$refs['remittance-disbursement-table'].reset();
                    self.getRemittanceDisbursementTypes();
                    self.getChartOfAccounts();
                    self.getBusinessTypes();
                    self.getRemittanceDisbursements(self.listType);
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
      // Display remittance disbursement details on table
      getRemittanceDisbursements(type) {
        let self = this, rdData = null, ids = [], rd = [];
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
            self.remittanceDisbursements = [];
            self.listType = type;
            if(user == 'Administrator' || user == 'Manager'){
              if(type == "Release"){
                if(self.limit != "all"){
                  rdData = dbUsers.collection("remittanceDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==",1)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  rdData = dbUsers.collection("remittanceDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==",1);
                }
              }else if(type == "Cleared"){
                if(self.limit != "all"){
                  rdData = dbUsers.collection("remittanceDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==", 2)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  rdData = dbUsers.collection("remittanceDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==", 2)
                }
              }else if(type == "All"){
                if(self.limit != "all"){
                  rdData = dbUsers.collection("remittanceDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  rdData = dbUsers.collection("remittanceDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end);
                }
              }
            }else if(user == 'User'){
              if(type == "Release"){
                if(self.limit != "all"){
                  rdData = dbUsers.collection("remittanceDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==",1)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  rdData = dbUsers.collection("remittanceDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==",1);
                }
              }else if(type == "Cleared"){
                if(self.limit != "all"){
                  rdData = dbUsers.collection("remittanceDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==", 2)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  rdData = dbUsers.collection("remittanceDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==", 2)
                }
              }else if(type == "All"){
                if(self.limit != "all"){
                  rdData = dbUsers.collection("remittanceDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  rdData = dbUsers.collection("remittanceDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId);
                }
              }
            }
            rdData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  rd.push(doc.data());
                  ids.push(doc.id);
                });
                let rTypeData = dbMains.collection("remittanceDisbursementTypes");
                let coaData = dbMains.collection("chartOfAccounts");
                let bTypeData = dbMains.collection("businessTypes");
                let rTypes = [], accounts = [], types = [];

                rTypeData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    rTypes.push(doc.data());
                  });
                  coaData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      accounts.push(doc.data());
                    });
                    bTypeData.get().then((querySnapshot) => {
                      querySnapshot.forEach((doc) => {
                        types.push(doc.data());
                      });
                      for(let i = 0; i < rd.length; i++){
                        rd[i]["id"] = ids[i];
                        rd[i]["type"] = '';
                        rd[i]["coa"] = '';
                        rd[i]["businessType"] = '';
                        rd[i].amount = format(parseFloat(rd[i].amount.replaceAll(",","")).toFixed(2));
                        self.remittanceDisbursements.push(rd[i]);
                        for(let a = 0; a < rTypes.length; a++){
                          if(rTypes[a].remittanceDisbursementTypeId == rd[i].remittanceTypeReference){
                            rd[i].type = rTypes[a].type;
                          }
                        }
                        for(let b = 0; b < accounts.length; b++){
                          if(accounts[b].accountId == rd[i].accountReference){
                            rd[i].coa = accounts[b].account;
                          }
                        }
                        for(let c = 0; c < types.length; c++){
                          if(types[c].businessTypeId == rd[i].businessTypeReference){
                            rd[i].businessType = types[c].type;
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
      // View remittance disbursement details
      openViewRemittanceDisbursementModal(row){
        let self = this;

        self.view = {
          voucherNumber: row.voucherNumber,
          amount: row.amount,
          transactionDate: row.transactionDate,
          idNumber: row.idNumber,
          name: row.name,
          description: row.description,
          email: row.email,
          contactNumber: row.contactNumber,
          penalty: row.penalty,
          paymentType: row.paymentType,
          checkReference: row.checkReference,
          type: row.type,
          account: row.coa,
          businessType: row.businessType
        };
        self.$bvModal.show("view-remittance-disbursement-modal");
      },
      // Show remittance disbursement attachments
      openAttachments(row){
        this.rdId = row.remittanceDisbursementId;
        this.attachmentStatus = row.status;
        this.$bvModal.show("attachment-modal");
        this.getAttachments(this.rdId);
      },
      // Save new remittance disbursement attachment
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
        const storageRef = storageMains.ref('remittanceDisbursements/' + self.rdId + '/' + data.name)
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
      // Display remittance disbursement attachments
      getAttachments(id){
        let self= this, rowNum = 0;
        let listRef = storageMains.ref('remittanceDisbursements/' + id);

        self.loadAttachment = true;
        self.attachments = [];
        self.uploadValue = 0;
        listRef.listAll()
        .then((res) => {
          res.items.forEach((itemRef) => {
          storageMains.ref('remittanceDisbursements/' + id + '/' + itemRef.name)
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
        setTimeout(function() {
          self.loadAttachment = false;
        }, 5000);
      },
      // Delete remittance disbursement attachment
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
            let deleteRef = storageMains.ref('remittanceDisbursements/' + self.rdId + '/' + name);

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
                  self.getAttachments(self.rdId);
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
      // Show edit remittance disbursement form
      openUpdateRDModal(row){
        let self = this;

        self.edit = {
          id: row.id,
          rdId: row.refundDisbursementId,
          transDate: row.transactionDate,
          amount: row.amount,
          idNumber: row.idNumber,
          name: row.name,
          description: row.description,
          email: row.email,
          contactNumber: row.contactNumber,
          penalty: row.penalty,
          paymentType: row.paymentType,
          checkNo: row.checkReference,
          rType: row.remittanceTypeReference,
          coa: row.accountReference,
          businessType: row.businessTypeReference
        };
        self.$bvModal.show("edit-remittance-disbursement-modal");
      },
      // Change remittance disbursement details
      updateRemittanceDisbursement(){
        let self = this, foundError = false;

        self.$v.edit.transDate.$touch();
        self.$v.edit.amount.$touch();
        self.$v.edit.idNumber.$touch();
        self.$v.edit.name.$touch();
        self.$v.edit.email.$touch();
        self.$v.edit.contactNumber.$touch();
        self.$v.edit.penalty.$touch();
        self.$v.edit.paymentType.$touch();
        self.$v.edit.checkNo.$touch();
        self.$v.edit.rType.$touch();
        self.$v.edit.coa.$touch();
        self.$v.edit.businessType.$touch();
        if(self.paymentType == 'Cash'){
          if(self.$v.edit.transDate.$error || self.$v.edit.amount.$error || self.$v.edit.idNumber.$error || self.$v.edit.name.$error || self.$v.edit.email.$error || self.$v.edit.contactNumber.$error || self.$v.edit.penalty.$error || self.$v.edit.paymentType.$error || self.$v.edit.rType.$error || self.$v.edit.coa.$error || self.$v.edit.businessType.$error){
            foundError = true;
          }
        }else if(self.paymentType == 'Check'){
          if(self.$v.edit.transDate.$error || self.$v.edit.amount.$error || self.$v.edit.idNumber.$error || self.$v.edit.name.$error || self.$v.edit.email.$error || self.$v.edit.contactNumber.$error || self.$v.edit.penalty.$error || self.$v.edit.paymentType.$error || self.$v.edit.checkNo.$error || self.$v.edit.rType.$error || self.$v.edit.coa.$error || self.$v.edit.businessType.$error){
            foundError = true;
          }
        }
        if(!foundError){
          self.requestProcessing = true;
          try{
            dbUsers.collection("remittanceDisbursements")
            .doc(self.edit.id)
            .update({
              transactionDate: self.edit.transDate,
              amount: self.edit.amount,
              idNumber: self.edit.idNumber,
              name: self.edit.name,
              description: self.edit.description,
              email: self.edit.email,
              contactNumber: self.edit.contactNumber,
              penalty: self.edit.penalty,
              paymentType: self.edit.paymentType,
              checkReference: self.edit.checkNo,
              remittanceTypeReference: self.edit.rType,
              accountReference: self.edit.coa,
              businessTypeReference: self.edit.businessType,
              dateModified: today
            }).then(() => {
              self.edit = {
                id: '',
                rdId: '',
                transDate: '',
                amount: '',
                idNumber: '',
                name: '',
                description: '',
                email: '',
                contactNumber: '',
                penalty: '',
                paymentType: '',
                checkNo: '',
                rType: '',
                coa: '',
                businessType: ''
              };
              self.requestProcessing = false;
              self.$v.edit.$reset();
              self.$bvModal.hide('edit-remittance-disbursement-modal');
              self.$refs['remittance-disbursement-table'].reset();
              self.getRemittanceDisbursements(self.listType);
              self.$swal({
                title: 'Success',
                text: 'Remittance disbursement updated successfully!',
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
      // Change remittance disbursement status
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
            dbUsers.collection("remittanceDisbursements")
            .doc(row.id)
            .update({
              status: stat,
              dateModified: today
            }).then(() => {
              self.$refs['remittance-disbursement-table'].reset();
              self.getRemittanceDisbursements(msg);
              self.$swal({
                title: 'Success',
                text: 'Remittance disbursement status change successfully!',
                icon: 'success',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            });
          }
        });
      },
      // Print remittance disbursement details
      printRemittanceDisbursement(){
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
              documentTitle: 'Remittance Disbursement Voucher',
            });
          }else{
            printJS({
              printable: 'singleView',
              type: 'html',
              style: '#singleView {font-family: "Calibri";} #borderStyle {border-width: 1px; border-style: solid;} #docStyle {display: block; overflow: inherit; white-space: normal; font-size: 12px;}',
              documentTitle: 'Remittance Disbursement Voucher',
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
