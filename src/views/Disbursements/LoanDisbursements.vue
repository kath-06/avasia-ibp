<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5"></base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--7">
        <card>
          <!-- Loan disbursement status links -->
          <div class="row">
            <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
              <badge class="badge-dot ml-2 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Release'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getLoanDisbursements('Release')">Release</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Cleared'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getLoanDisbursements('Cleared')">Cleared</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'All'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getLoanDisbursements('All')">All</span>
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
                @input="getLoanDisbursements(listType)"
                style="width: 150px;"></v-select>
            </span>
            <span class="col-sm-2 pl-0">
              <base-input class="pb-2"
                type="month"
                :max="maxDate"
                min="1997-01"
                v-model="dateCreated"
                @input="getLoanDisbursements(listType)"
                style="width: 230px;"
                id="inputStyle"
                v-if="filter == 'month'"></base-input>
            </span>
          </div>
          <div class="table-full-width">
            <!-- Loan disbursement table -->
            <vue-good-table :columns="columns"
              :rows="loanDisbursements"
              :search-options="{enabled: true}"
              :pagination-options="{
                enabled: true,
                perPageDropdown: [10, 15, 20],
              }"
              :sort-options="{enabled: true}"
              :line-numbers="true"
              :isLoading="loading"
              ref="loan-disbursement-table">
              <template slot="table-row" slot-scope="props">
                <b><span v-if="props.column.field == 'voucherNumber'">
                  <span v-on:click="openViewLoanDisbursementModal(props.row)"
                    id="sideBarTxt"
                    class="pointer">{{props.row.voucherNumber}}</span>
                </span>
                <span v-if="props.column.field == 'amount'">
                  <span class="tableSpan">₱ {{props.row.amount}}</span>
                </span>
                <span v-if="props.column.field == 'transactionDate'">
                  <span>{{props.row.transactionDate | moment("MMM DD, YYYY")}}</span>
                </span>
                <span v-if="props.column.field == 'bank'">
                  <span>{{props.row.bank}}</span>
                </span>
                <span v-if="props.column.field == 'account'">
                  <span>{{props.row.account}}</span>
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
                    v-on:click="openUpdateLDModal(props.row)"
                    v-if="props.row.status == 1"
                    title="Update"></span>
                  <span class="pointer ml-2 fa fa-percent"
                    id="sideBarTxt"
                    v-on:click="openLoanPercentModal(props.row)"
                    v-if="props.row.status == 1"
                    title="Loan Percent"></span>
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
            v-if="loanDisbursements.length">
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
                @input="getLoanDisbursements(listType)"></v-select>
            </span>
          </div>
          <hr class="mb-2 mt-2">
          <!-- New loan disbursement buttons -->
          <div class="text-right pt-2">
            <base-button v-b-modal.new-loan-disbursement-modal
              id="darkBtn"
              class="col-md-4 ml-2 mr-2">New Loan Disbursement</base-button>
          </div>
        </card>
        <!-- Loan disbursment duplicate print -->
        <div class="pl-4"
          id="duplicateView">
          <div class="row">
            <span class="col-sm-6">
                <b>LOAN DISBURSEMENT</b>
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
              <b>Bank: </b>{{view.bank}}
            </span>
            <span class="col-sm-6">
              <b>Account Number: </b>{{view.account}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Payment Type: </b>{{view.paymentType}}
            </span>
            <span class="col-sm-6">
              <b>Chart of Account: </b>{{view.coa}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Business Type: </b>{{view.businessType}}
            </span>
            <span class="col-sm-6"
              v-if="view.paymentType == 'Check'">
              <b>Check Number: </b>{{view.checkReference}}
            </span>
          </div>
          <hr/>
          <div class="row">
            <span class="col-sm-6">
              <b>Total Amount Due: </b>₱ {{view.totalAmountDue == '' ? '----------' : view.totalAmountDue}}
            </span>
            <span class="col-sm-6">
              <b>Total Amount: </b>₱ {{view.totalAmount}}
            </span>
          </div>
          <hr/>
          <div class="row pb-2">
            <span class="col-sm-2">
              <b>DUE DATE</b>
            </span>
            <span class="col-sm-2">
              <b>TERMS</b>
            </span>
            <span class="col-sm-2">
              <b>PERCENT</b>
            </span>
            <span class="col-sm-2">
              <b>AMOUNT DUE</b>
            </span>
            <span class="col-sm-2">
              <b>DAYS DUE</b>
            </span>
            <span class="col-sm-2">
              <b>TOTAL</b>
            </span>
          </div>
          <div class="row"
            v-for="due in dues"
            v-bind:key="due.date">
            <span class="col-sm-2">{{due.date}}</span>
            <span class="col-sm-2">{{due.terms}} days</span>
            <span class="col-sm-2">{{due.percent}}%</span>
            <span class="col-sm-2">₱ {{due.amountDue}}</span>
            <span class="col-sm-2">{{due.days}} days</span>
            <span class="col-sm-2">₱ {{due.totalDue}}</span>
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
                <b>LOAN DISBURSEMENT</b>
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
              <b>Bank: </b>{{view.bank}}
            </span>
            <span class="col-sm-6">
              <b>Account Number: </b>{{view.account}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Payment Type: </b>{{view.paymentType}}
            </span>
            <span class="col-sm-6">
              <b>Chart of Account: </b>{{view.coa}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Business Type: </b>{{view.businessType}}
            </span>
            <span class="col-sm-6"
              v-if="view.paymentType == 'Check'">
              <b>Check Number: </b>{{view.checkReference}}
            </span>
          </div>
          <hr/>
          <div class="row">
            <span class="col-sm-6">
              <b>Total Amount Due: </b>₱ {{view.totalAmountDue == '' ? '----------' : view.totalAmountDue}}
            </span>
            <span class="col-sm-6">
              <b>Total Amount: </b>₱ {{view.totalAmount}}
            </span>
          </div>
          <hr/>
          <div class="row pb-2">
            <span class="col-sm-2">
              <b>DUE DATE</b>
            </span>
            <span class="col-sm-2">
              <b>TERMS</b>
            </span>
            <span class="col-sm-2">
              <b>PERCENT</b>
            </span>
            <span class="col-sm-2">
              <b>AMOUNT DUE</b>
            </span>
            <span class="col-sm-2">
              <b>DAYS DUE</b>
            </span>
            <span class="col-sm-2">
              <b>TOTAL</b>
            </span>
          </div>
          <div class="row"
            v-for="due in dues"
            v-bind:key="due.date">
            <span class="col-sm-2">{{due.date}}</span>
            <span class="col-sm-2">{{due.terms}} days</span>
            <span class="col-sm-2">{{due.percent}}%</span>
            <span class="col-sm-2">₱ {{due.amountDue}}</span>
            <span class="col-sm-2">{{due.days}} days</span>
            <span class="col-sm-2">₱ {{due.totalDue}}</span>
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
        <!-- NEW LOAN DISBURSEMENT MODAL -->
        <b-modal size="xl"
          id="new-loan-disbursement-modal"
          title="New Loan Disbursement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Transaction Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Bank:</b>
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
              <v-select id="inputStyle"
                :options="banks"
                :reduce="bank => bank.bankUid"
                label="bank"
                v-model="newBank"
                @input="getBankAccounts(newBank)"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newBank.$anyDirty && !$v.newBank.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Bank Account:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Payment Type:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5"
              v-if="bankAccounts == ''">
              <span class="text-red">No Bank Account</span>
            </div>
            <div class="col-sm-6 pl-5 pr-5" v-else>
              <v-select id="inputStyle"
                :options="bankAccounts"
                :reduce="bankAccount => bankAccount.bankAccountUid"
                label="bankAccountNumber"
                v-model="newBankAccount"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.newBankAccount.$anyDirty && !$v.newBankAccount.required">Field Required</i>
            </div>
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
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label"
              v-if="newPaymentType == 'Check'">
              <b>Check Number:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Amount:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5"
              v-if="newPaymentType == 'Check'">
              <base-input v-model="newCheckNo"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newCheckNo.$anyDirty && !$v.newCheckNo.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newCheckNo.$anyDirty && !$v.newCheckNo.numCustomValidator">Invalid Characters</i>
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
                  @click.native="newLoanDisbursement"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Add
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('new-loan-disbursement-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- VIEW LOAN DISBURSEMENT MODAL -->
        <b-modal size="xl"
          id="view-loan-disbursement-modal"
          title="View Loan Disbursement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <card class="pl-4 pt-5 pb-5 shadow"
            id="singleView">
            <div class="row">
              <span class="col-sm-6">
                <b>LOAN DISBURSEMENT</b>
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
                <b>Bank: </b>{{view.bank}}
              </span>
              <span class="col-sm-6">
                <b>Account Number: </b>{{view.account}}
              </span>
            </div>
            <div class="row">
              <span class="col-sm-6">
                <b>Payment Type: </b>{{view.paymentType}}
              </span>
              <span class="col-sm-6">
                <b>Chart of Account: </b>{{view.coa}}
              </span>
            </div>
            <div class="row">
              <span class="col-sm-6">
                <b>Business Type: </b>{{view.businessType}}
              </span>
              <span class="col-sm-6"
                v-if="view.paymentType == 'Check'">
                <b>Check Number: </b>{{view.checkReference}}
              </span>
            </div>
            <hr/>
            <div class="row">
              <span class="col-sm-6">
                <b>Total Amount Due: </b>₱ {{view.totalAmountDue == '' ? '----------' : view.totalAmountDue}}
              </span>
              <span class="col-sm-6">
                <b>Total Amount: </b>₱ {{view.totalAmount}}
              </span>
            </div>
            <hr v-if="dues.length > 0">
            <div class="row pb-2"
              v-if="dues.length > 0">
              <span class="col-sm-2">
                <b>DUE DATE</b>
              </span>
              <span class="col-sm-2">
                <b>TERMS</b>
              </span>
              <span class="col-sm-2">
                <b>PERCENT</b>
              </span>
              <span class="col-sm-2">
                <b>AMOUNT DUE</b>
              </span>
              <span class="col-sm-2">
                <b>DAYS DUE</b>
              </span>
              <span class="col-sm-2">
                <b>TOTAL</b>
              </span>
            </div>
            <div class="row"
              v-for="due in dues"
              v-bind:key="due.date">
              <span class="col-sm-2">{{due.date}}</span>
              <span class="col-sm-2">{{due.terms}} days</span>
              <span class="col-sm-2">{{due.percent}}%</span>
              <span class="col-sm-2">₱ {{due.amountDue}}</span>
              <span class="col-sm-2">{{due.days}} days</span>
              <span class="col-sm-2">₱ {{due.totalDue}}</span>
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
                  @click.native="printLoanDisbursement"
                  :disabled="requestProcessing">
                  Print
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('view-loan-disbursement-modal')"
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
        <!-- UPDATE LOAN DISBURSEMENT MODAL -->
        <b-modal size="xl"
          id="edit-loan-disbursement-modal"
          title="Edit Loan Disbursement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Transaction Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Bank:</b>
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
              <v-select id="inputStyle"
                :options="banks"
                :reduce="bank => bank.bankUid"
                label="bank"
                v-model="edit.bank"
                @input="getBankAccounts(edit.bank)"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.bank.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Bank Account:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Payment Type:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5"
              v-if="bankAccounts == ''">
              <span class="text-red">No Bank Account</span>
            </div>
            <div class="col-sm-6 pl-5 pr-5" v-else>
              <v-select id="inputStyle"
                :options="bankAccounts"
                :reduce="bankAccount => bankAccount.bankAccountUid"
                label="bankAccountNumber"
                v-model="edit.bankAccount"
                :clearable="false"></v-select>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.bankAccount.required">Field Required</i>
            </div>
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
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label"
              v-if="edit.paymentType == 'Check'">
              <b>Check Number:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Amount:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5"
              v-if="edit.paymentType == 'Check'">
              <base-input v-model="edit.checkNo"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.checkNo.required">Field Required</i>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.checkNo.numCustomValidator">Invalid Characters</i>
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
                  @click.native="updateLoanDisbursement"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Update
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('edit-loan-disbursement-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- LOAN DISBURSEMENT PERCENT MODAL -->
        <b-modal size="lg"
          id="loan-percent-modal"
          title="Percents" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="table-full-width">
            <vue-good-table :columns="percentColumns"
              :rows="loanPercents"
              :search-options="{enabled: true}"
              :pagination-options="{
                enabled: true,
                perPageDropdown: [10, 15, 20],
              }"
              :sort-options="{enabled: true}"
              :line-numbers="true"
              :isLoading="loadingPercent">
              <template slot="table-row" slot-scope="props">
                <b><span v-if="props.column.field == 'percent'">
                  <span>{{props.row.percent}}%</span>
                </span>
                <span v-if="props.column.field == 'terms'">
                  <span>{{props.row.terms}} day/s</span>
                </span>
                <span v-if="props.column.field == 'action'">
                  <span class="pointer ml-2 far fa-edit"
                    id="sideBarTxt"
                    v-on:click="openUpdatePercentModal(props.row)"
                    title="Update"></span>
                  <span class="pointer ml-2 fa fa-times-circle"
                    id="sideBarTxt"
                    v-on:click="removeLoanPercent(props.row)"
                    title="Remove"></span>
                </span></b>
              </template>
            </vue-good-table>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="$bvModal.show('add-loan-percent-modal')"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Add Loan Percent
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('loan-percent-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- ADD LOAN PERCENT MODAL -->
        <b-modal size="sm"
          id="add-loan-percent-modal"
          title="Add Loan Percent" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Percent:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <base-input v-model="newPercent"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newPercent.$anyDirty && !$v.newPercent.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newPercent.$anyDirty && !$v.newPercent.numCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Terms:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <base-input v-model="newTerms"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newTerms.$anyDirty && !$v.newTerms.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newTerms.$anyDirty && !$v.newTerms.numCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="addLoanPercent"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Add
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('add-loan-percent-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- EDIT LOAN PERCENT MODAL -->
        <b-modal size="sm"
          id="edit-loan-percent-modal"
          title="Edit Loan Percent" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Percent:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <base-input v-model="editLoan.percent"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.editLoan.$anyDirty && !$v.editLoan.percent.required">Field Required</i>
              <i class="text-red"
                v-if="$v.editLoan.$anyDirty && !$v.editLoan.percent.numCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Terms:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <base-input v-model="editLoan.terms"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.editLoan.$anyDirty && !$v.editLoan.terms.required">Field Required</i>
              <i class="text-red"
                v-if="$v.editLoan.$anyDirty && !$v.editLoan.terms.numCustomValidator">Invalid Characters</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="updateLoanPercent"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Update
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('edit-loan-percent-modal')"
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
  import printJS from "print-js";
  import {mapGetters} from "vuex";

  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ., ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Loan disbursement table
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
            label: 'Bank',
            field: 'bank'
          },{
            label: 'Bank Account',
            field: 'account'
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
        loanDisbursements: [],
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
        // New loan disbursement
        newType: '',
        banks: [],
        bankAccounts: [],
        paymentTypes: [
          {"type": 'Cash'},
          {"type": 'Check'}
        ],
        coas: [],
        businessTypes: [],
        newTransDate: moment().format("YYYY-MM-DD"),
        newBank: '',
        newBankAccount: '',
        newPaymentType: 'Cash',
        newCheckNo:'',
        newAmount: '',
        newCOA: '',
        newBusinessType: '',
        // View loan disbursement
        view: {
          voucherNumber: '',
          amount: '',
          transactionDate: '',
          bank: '',
          account: '',
          paymentType: '',
          checkReference: '',
          coa: '',
          businessTypes: ''
        },
        dues: [],
        // Loan disbursement attachment
        attachment: '',
        attachmentData: null,
        attachments: [],
        ldId: '',
        uploadValue: 0,
        loadAttachment: true,
        // Edit loan disbursement
        edit: {
          id: '',
          ldId: '',
          transDate: '',
          bank: '',
          bankAccount: '',
          paymentType: '',
          checkNo: '',
          amount: '',
          coa: '',
          businessType: ''
        },
        // Loan percent table
        percentColumns: [{
            label: 'Percent (%)',
            field: 'percent'
          },{
            label: 'Terms (Days)',
            field: 'terms'
          },{
            label: '',
            field: 'action',
            width: '80px',
            sortable: false
          }
        ],
        loanPercents: [],
        loanId: '',
        loadingPercent: false,
        // New loan percent
        newPercent: '',
        newTerms: '',
        // Edit loan percent
        editLoan: {
          id:'',
          pId: '',
          percent: '',
          terms: '',
          loanReference: ''
        },
        // User data
        userRole: '',
        user: {
          firstname: '',
          lastname: ''
        },
        // Duplicate print line breaks
        breakCounts: 0,
      };
    },
    async mounted() {
      this.getUserRole();
      this.getLoanDisbursements("Release");
      this.getBanks();
      this.getChartOfAccounts();
      this.getBusinessTypes();
      this.getUser();
    },
    computed:{
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New loan disbursement validations
      newTransDate: {required},
      newBank: {required},
      newBankAccount: {required},
      newPaymentType: {required},
      newCheckNo: {
        required,
        numCustomValidator
      },
      newAmount: {
        required,
        amountCustomValidator
      },
      newCOA: {required},
      newBusinessType: {required},
      // Edit loan disbursement validations
      edit: {
        transDate: {required},
        bank: {required},
        bankAccount: {required},
        paymentType: {required},
        checkNo: {
          required,
          numCustomValidator
        },
        amount: {
          required,
          amountCustomValidator
        },
        coa: {required},
        businessType: {required}
      },
      // New loan percent validations
      newPercent: {
        required,
        numCustomValidator
      },
      newTerms: {
        required,
        numCustomValidator
      },
      // Edit loan percent validations
      editLoan: {
        percent: {
          required,
          numCustomValidator
        },
        terms: {
          required,
          numCustomValidator
        }
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
          self.newBank = self.banks[0].bankUid;
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
          self.newBankAccount = self.bankAccounts[0].bankAccountUid;
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
      // Add new loan disbursment
      newLoanDisbursement(){
        let self = this, foundError = false;

        self.$v.newTransDate.$touch();
        self.$v.newBank.$touch();
        self.$v.newBankAccount.$touch();
        self.$v.newPaymentType.$touch();
        self.$v.newCheckNo.$touch();
        self.$v.newAmount.$touch();
        self.$v.newCOA.$touch();
        self.$v.newBusinessType.$touch();
        if(self.newPaymentType == 'Cash'){
          if(self.$v.newTransDate.$error || self.$v.newBank.$error || self.$v.newBankAccount.$error || self.$v.newPaymentType.$error || self.$v.newAmount.$error || self.$v.newCOA.$error || self.$v.newBusinessType.$error){
            foundError = true;
          }
        }else if(self.newPaymentType == 'Check'){
          if(self.$v.newTransDate.$error || self.$v.newBank.$error || self.$v.newBankAccount.$error || self.$v.newPaymentType.$error || self.$v.newCheckNo.$error || self.$v.newAmount.$error || self.$v.newCOA.$error || self.$v.newBusinessType.$error){
            foundError = true;
          }
        }
        if(!foundError){
          self.requestProcessing = true;
          try{
            let getUserId = dbUsers.collection('users')
              .where("username", '==', localStorage.getItem('aisname'));
            let users = [];
            let dataId = 'LDI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
            let voucher = dbUsers.collection('loanDisbursements')
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
                dbUsers.collection("loanDisbursements").doc()
                .set({
                  loanDisbursementId: dataId,
                  transactionDate: self.newTransDate,
                  bankReference: self.newBank,
                  bankAccountReference: self.newBankAccount,
                  paymentType: self.newPaymentType,
                  checkReference: self.newCheckNo,
                  amount: self.newAmount,
                  totalAmountDue: '',
                  voucherNumber: addZero(genVoucherNo.getMonth() + 1) + '' + (genVoucherNo.getFullYear().toString()).slice(2,4) + '-2' + lastVoucher,
                  accountReference: self.newCOA,
                  businessTypeReference: self.newBusinessType,
                  status: 1,
                  userReference: users[0].userId,
                  dateCreated: today,
                  dateModified: today
                }).then(() => {
                  self.$swal({
                    title: 'Success',
                    text: 'New loan disbursement added successfully!',
                    icon: 'success',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    self.newTransDate = moment().format("YYYY-MM-DD");
                    self.newBank = '';
                    self.newBankAccount = '';
                    self.newPaymentType = 'Cash';
                    self.newCheckNo = '';
                    self.newAmount = '';
                    self.newCOA = '';
                    self.newBusinessType = '';
                    self.requestProcessing = false;
                    self.$v.newTransDate.$reset();
                    self.$v.newBank.$reset();
                    self.$v.newBankAccount.$reset();
                    self.$v.newPaymentType.$reset();
                    self.$v.newCheckNo.$reset();
                    self.$v.newAmount.$reset();
                    self.$v.newCOA.$reset();
                    self.$v.newBusinessType.$reset();
                    self.$bvModal.hide('new-loan-disbursement-modal');
                    self.$refs['loan-disbursement-table'].reset();
                    self.getBanks();
                    self.getChartOfAccounts();
                    self.getBusinessTypes();
                    self.getLoanDisbursements(self.listType);
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
      // Display loan disbursement details on table
      getLoanDisbursements(type) {
        let self = this, ldData = null, ids = [], ld = [];
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
            self.loanDisbursements = [];
            self.listType = type;
            if(user == 'Administrator' || user == 'Manager'){
              if(type == "Release"){
                if(self.limit != "all"){
                  ldData = dbUsers.collection("loanDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==",1)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  ldData = dbUsers.collection("loanDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==",1);
                }
              }else if(type == "Cleared"){
                if(self.limit != "all"){
                  ldData = dbUsers.collection("loanDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==", 2)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  ldData = dbUsers.collection("loanDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==", 2)
                }
              }else if(type == "All"){
                if(self.limit != "all"){
                  ldData = dbUsers.collection("loanDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  ldData = dbUsers.collection("loanDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end);
                }
              }
            }else if(user == 'User'){
              if(type == "Release"){
                if(self.limit != "all"){
                  ldData = dbUsers.collection("loanDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==",1)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  ldData = dbUsers.collection("loanDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==",1);
                }
              }else if(type == "Cleared"){
                if(self.limit != "all"){
                  ldData = dbUsers.collection("loanDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==", 2)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  ldData = dbUsers.collection("loanDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==", 2)
                }
              }else if(type == "All"){
                if(self.limit != "all"){
                  ldData = dbUsers.collection("loanDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  ldData = dbUsers.collection("loanDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId);
                }
              }
            }
            ldData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  ld.push(doc.data());
                  ids.push(doc.id);
                });
                let bankData = dbMains.collection("banks");
                let accountData = dbMains.collection("bankAccounts");
                let coaData = dbMains.collection("chartOfAccounts");
                let bTypeData = dbMains.collection("businessTypes");
                let bank = [], bankAccount = [], accounts = [], types = [];

                bankData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    bank.push(doc.data());
                  });
                  accountData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      bankAccount.push(doc.data());
                    });
                    coaData.get().then((querySnapshot) => {
                      querySnapshot.forEach((doc) => {
                        accounts.push(doc.data());
                      });
                      bTypeData.get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                          types.push(doc.data());
                        });
                        for(let i = 0; i < ld.length; i++){
                          ld[i]["id"] = ids[i];
                          ld[i]["bank"] = '';
                          ld[i]["account"] = '';
                          ld[i]["coa"] = '';
                          ld[i]["businessType"] = '';
                          ld[i]["totalAmount"] = '';
                          ld[i].amount = format(parseFloat(ld[i].amount.replaceAll(",","")).toFixed(2));
                          self.loanDisbursements.push(ld[i]);
                          for(let a = 0; a < bank.length; a++){
                            if(bank[a].bankUid == ld[i].bankReference){
                              ld[i].bank = bank[a].bank;
                            }
                          }
                          for(let b = 0; b < bankAccount.length; b++){
                            if(bankAccount[b].bankAccountUid == ld[i].bankAccountReference){
                              ld[i].account = bankAccount[b].bankAccountNumber;
                            }
                          }
                          for(let c = 0; c < accounts.length; c++){
                            if(accounts[c].accountId == ld[i].accountReference){
                              ld[i].coa = accounts[c].account;
                            }
                          }
                          for(let d = 0; d < types.length; d++){
                            if(types[d].businessTypeId == ld[i].businessTypeReference){
                              ld[i].businessType = types[d].type;
                            }
                          }
                        }
                      });
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
      // View loan disbursement details
      openViewLoanDisbursementModal(row){
        let self = this, percents = [];
        let percentData = dbUsers.collection("loanPercents")
          .where("loanReference","==",row.loanDisbursementId)
          .orderBy("terms","asc");

        percentData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            percents.push(doc.data());
          });
          let date, percent = '', amountDue = '', total = 0, days = 0;

          self.dues = []; 
          for(let a = 0; a < percents.length; a++){
            date = moment(row.transactionDate).add(percents[a].terms, 'days').format("MMM DD, YYYY");
            self.dues.push({'date': date});
          }
          if(percents.length <= 1){
            self.breakCounts = 12;
          }else if(percents.length > 1 && percents.length < 12){
            self.breakCounts = 13 - percents.length;
          }
          for(let b = 0; b < self.dues.length; b++){
            let count = 0;

            self.dues[b]["days"] = 0;
            self.dues[b]["amountDue"] = 0;
            self.dues[b]["totalDue"] = 0;
            self.dues[b]["percent"] = percents[b].percent;
            self.dues[b]["terms"] = percents[b].terms;
            if(self.dues.length == 1){
              if(moment(today).isAfter(self.dues[b].date)){
                percent = parseFloat(percents[b].percent) / 100;
                percent = parseFloat(percent).toFixed(2);
                amountDue = percent * parseFloat(row.amount.replaceAll(",",""));
                days = moment(today).diff(moment(self.dues[b]),'days');
                self.dues[b].amountDue = format(parseFloat(amountDue).toFixed(2));
                self.dues[b].days = days;
                amountDue = amountDue * (days);
                self.dues[b].totalDue = format(parseFloat(amountDue).toFixed(2));
                total += amountDue;
              }
            }else if(self.dues.length > 1){
              count = b + 1;
              if(count < self.dues.length){
                if(moment(today).isAfter(self.dues[b].date)){
                  if(moment(today).isSameOrBefore(self.dues[b + 1].date)){
                    percent = parseFloat(percents[b].percent) / 100;
                    percent = parseFloat(percent).toFixed(2);
                    amountDue = percent * parseFloat(row.amount.replaceAll(",",""));
                    days = moment(today).diff(moment(self.dues[b].date),'days');
                    self.dues[b].amountDue = format(parseFloat(amountDue).toFixed(2));
                    self.dues[b].days = days;
                    amountDue = amountDue * (days);
                    self.dues[b].totalDue = format(parseFloat(amountDue).toFixed(2));
                    total += amountDue;
                  }else{
                    percent = parseFloat(percents[b].percent) / 100;
                    percent = parseFloat(percent).toFixed(2);
                    amountDue = percent * parseFloat(row.amount.replaceAll(",",""));
                    if(b > 0){
                      days = moment(self.dues[b - 1].date).diff(moment(self.dues[b].date),'days');
                      if(days < 0){
                        days = days * -1;
                      }
                    }else if(b == 0){
                      days = moment(self.dues[b + 1].date).diff(moment(self.dues[b].date),'days');
                      if(days < 0){
                        days = days * -1;
                      }
                    }
                    self.dues[b].amountDue = format(parseFloat(amountDue).toFixed(2));
                    self.dues[b].days = days;
                    amountDue = amountDue * days;
                    self.dues[b].totalDue = format(parseFloat(amountDue).toFixed(2));
                    total += amountDue;
                  }
                }
              }
              if(count == self.dues.length){
                if(moment(today).isAfter(self.dues[b].date)){
                  percent = parseFloat(percents[b].percent) / 100;
                  percent = parseFloat(percent).toFixed(2);
                  amountDue = percent * parseFloat(row.amount.replaceAll(",",""));
                  days = moment(today).diff(moment(self.dues[b].date),'days');
                  self.dues[b].amountDue = format(parseFloat(amountDue).toFixed(2));
                  self.dues[b].days = days;
                  amountDue = amountDue * (days);
                  self.dues[b].totalDue = format(parseFloat(amountDue).toFixed(2));
                  total += amountDue;
                }
              }
            }
          }
          self.view = {
            voucherNumber: row.voucherNumber,
            amount: row.amount,
            transactionDate: row.transactionDate,
            bank: row.bank,
            account: row.account,
            paymentType: row.paymentType,
            checkReference: row.checkReference,
            totalAmountDue: format(parseFloat(total).toFixed(2)),
            coa: row.coa,
            businessType: row.businessType,
            totalAmount: format(parseFloat(total + parseFloat(row.amount.replaceAll(",",""))).toFixed(2))
          };
          self.$bvModal.show("view-loan-disbursement-modal");
        });
      },
      // Show loan disbursement attachment
      openAttachments(row){
        this.ldId = row.loanDisbursementId;
        this.attachmentStatus = row.status;
        this.$bvModal.show("attachment-modal");
        this.getAttachments(this.ldId);
      },
      // Add new loan disbursement attachment
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
        const storageRef = storageMains.ref('loanDisbursements/' + self.ldId + '/' + data.name)
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
            self.getAttachments(self.ldId);
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
      // Display loan disbursement attachment
      getAttachments(id){
        let self= this, rowNum = 0;
        let listRef = storageMains.ref('loanDisbursements/' + id);

        self.loadAttachment = true;
        self.attachments = [];
        listRef.listAll()
        .then((res) => {
          res.items.forEach((itemRef) => {
          storageMains.ref('loanDisbursements/' + id + '/' + itemRef.name)
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
      // Delete loan disbursement attachment
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
            let deleteRef = storageMains.ref('loanDisbursements/' + self.ldId + '/' + name);

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
                  self.getAttachments(self.ldId);
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
      // Show edit loan disbursement form
      openUpdateLDModal(row){
        let self = this;

        self.edit = {
          id: row.id,
          ldId: row.cashDisbursementId,
          transDate: row.transactionDate,
          bank: row.bankReference,
          bankAccount: row.bankAccountReference,
          paymentType: row.paymentType,
          checkNo: row.checkReference,
          amount: row.amount,
          coa: row.accountReference,
          businessType: row.businessTypeReference
        };
        self.$bvModal.show("edit-loan-disbursement-modal");
      },
      // Change edit loan disbursement details
      updateLoanDisbursement(){
        let self = this, foundError = false;

        self.$v.edit.transDate.$touch();
        self.$v.edit.bank.$touch();
        self.$v.edit.bankAccount.$touch();
        self.$v.edit.paymentType.$touch();
        self.$v.edit.amount.$touch();
        self.$v.edit.coa.$touch();
        self.$v.edit.businessType.$touch();
        if(self.edit.paymentType == 'Cash'){
          if(self.$v.edit.transDate.$error || self.$v.edit.bank.$error || self.$v.edit.bankAccount.$error || self.$v.edit.paymentType.$error || self.$v.edit.amount.$error || self.$v.edit.coa.$error || self.$v.edit.businessType.$error ){
            foundError = true;
          }
        }else if(self.edit.paymentType == 'Check'){
          if(self.$v.edit.transDate.$error || self.$v.edit.bank.$error || self.$v.edit.bankAccount.$error || self.$v.edit.paymentType.$error || self.$v.edit.checkNo.$error || self.$v.edit.amount.$error || self.$v.edit.coa.$error || self.$v.edit.businessType.$error){
            foundError = true;
          }
        }
        if(!foundError){
          self.requestProcessing = true;
          try{
            dbUsers.collection("loanDisbursements")
            .doc(self.edit.id)
            .update({
              transactionDate: self.edit.transDate,
              bankReference: self.edit.bank,
              bankAccountReference: self.edit.bankAccount,
              paymentType: self.edit.paymentType,
              checkReference: self.edit.checkNo,
              amount: self.edit.amount,
              accountReference: self.edit.coa,
              businessTypeReference: self.edit.businessType,
              dateModified: today
            }).then(() => {
              self.edit = {
                id: '',
                ldId: '',
                transDate: '',
                bank: '',
                bankAccount: '',
                paymentType: '',
                checkNo: '',
                amount: '',
                coa: '',
                businessType: ''
              };
              self.requestProcessing = false;
              self.$v.edit.$reset();
              self.$bvModal.hide('edit-loan-disbursement-modal');
              self.$refs['loan-disbursement-table'].reset();
              self.getLoanDisbursements(self.listType);
              self.$swal({
                title: 'Success',
                text: 'Loan disbursement updated successfully!',
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
      // Show loan percents
      openLoanPercentModal(row){
        this.loanId = row.loanDisbursementId;
        this.getLoanPercents(row.loanDisbursementId);
        this.$bvModal.show("loan-percent-modal");
      },
      // Display loan percent on table
      getLoanPercents(id){
        let self = this, lpData = null, ids = [], lp = [];

        self.loanPercents = [];
        self.loadingPercent = true;
        lpData = dbUsers.collection("loanPercents")
          .where("loanReference", "==", id)
          .orderBy("terms","asc");
        lpData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              lp.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < lp.length; i++){
              lp[i]["id"] = ids[i];
              self.loanPercents.push(lp[i]);
            }
          }
        });
        setTimeout(function() {
          self.loadingPercent = false;
        }, 1000);
      },
      // Save new loan percent data
      addLoanPercent(){
        let self = this;

        self.$v.newPercent.$touch();
        self.$v.newTerms.$touch();
        if(!self.$v.newPercent.$error && !self.$v.newTerms.$error){
          self.requestProcessing = true;
          try{
            let getUserId = dbUsers.collection('users')
              .where("username", '==', localStorage.getItem('aisname'));
            let users = [];
            let dataId = 'LPI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

            getUserId.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                users.push(doc.data());
              });
              dbUsers.collection("loanPercents").doc()
              .set({
                loanPercentId: dataId,
                percent: self.newPercent,
                terms: parseInt(self.newTerms),
                loanReference: self.loanId,
                status: 1,
                userReference: users[0].userId,
                dateCreated: today,
                dateModified: today
              }).then(() => {
                self.$swal({
                  title: 'Success',
                  text: 'New loan percent added successfully!',
                  icon: 'success',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.newPercent = '';
                  self.newTerms = '';
                  self.requestProcessing = false;
                  self.$v.newPercent.$reset();
                  self.$v.newTerms.$reset();
                  self.$bvModal.hide('add-loan-percent-modal');
                  self.getLoanPercents(self.loanId);
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
      // Show edit percent form
      openUpdatePercentModal(row){
        let self = this;

        self.loanId = row.loanReference;
        self.editLoan = {
          id: row.id,
          pId: row.loanPercentId,
          percent: row.percent,
          terms: row.terms,
          loanReference: row.loanReference,
        };
        self.$bvModal.show("edit-loan-percent-modal");
      },
      // Change loan percent details
      updateLoanPercent(){
        let self = this;

        self.$v.editLoan.$touch();
        if(!self.$v.editLoan.$error){
          self.requestProcessing = true;
          try{
            dbUsers.collection("loanPercents")
            .doc(self.editLoan.id)
            .update({
              percent: self.editLoan.percent,
              terms: parseInt(self.editLoan.terms),
              dateModified: today
            }).then(() => {
              self.edit = {
                id: '',
                pId: '',
                percent: '',
                terms: '',
              };
              self.requestProcessing = false;
              self.$v.editLoan.$reset();
              self.$bvModal.hide('edit-loan-percent-modal');
              console.log(self.loanId);
              self.getLoanPercents(self.loanId);
              self.$swal({
                title: 'Success',
                text: 'Loan percent updated successfully!',
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
      // Delete loan percent details
      removeLoanPercent(row){
        let self = this;

        self.requestProcessing = true;
        try{
          dbUsers.collection("loanPercents")
          .doc(row.id)
          .delete()
          .then(() => {
            self.requestProcessing = false;
            self.getLoanPercents(self.loanId);
            self.$swal({
              title: 'Success',
              text: 'Loan percent remove successfully!',
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
      },
      // Change loan disbursement status
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
            dbUsers.collection("loanDisbursements")
            .doc(row.id)
            .update({
              status: stat,
              dateModified: today
            }).then(() => {
              self.$refs['loan-disbursement-table'].reset();
              self.getLoanDisbursements(msg);
              self.$swal({
                title: 'Success',
                text: 'Loan disbursement status change successfully!',
                icon: 'success',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            });
          }
        });
      },
      // Print loan disbursement details
      printLoanDisbursement(){
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
              documentTitle: 'Loan Disbursement Voucher',
            });
          }else{
            printJS({
              printable: 'singleView',
              type: 'html',
              style: '#singleView {font-family: "Calibri";} #borderStyle {border-width: 1px; border-style: solid;} #docStyle {display: block; overflow: inherit; white-space: normal; font-size: 12px;}',
              documentTitle: 'Loan Disbursement Voucher',
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
