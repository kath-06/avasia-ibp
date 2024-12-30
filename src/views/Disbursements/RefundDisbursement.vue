<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-5"></base-header>
    <div id="textStyle">
      <div class="col-12 container-fluid mt--7">
        <card>
          <!-- Refund disbursement status links -->
          <div class="row">
            <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
              <badge class="badge-dot ml-2 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Release'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getRefundDisbursements('Release')">Release</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'Cleared'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getRefundDisbursements('Cleared')">Cleared</span>
              </badge>
              <badge class="badge-dot ml-3 pointer">
                <i id="activeBadge"
                  v-if="listType == 'All'"></i>
                <i id="redBg" v-else></i>
                <span class="pointer status"
                  id="linkTxt"
                  v-on:click="getRefundDisbursements('All')">All</span>
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
                @input="getRefundDisbursements(listType)"
                style="width: 150px;"></v-select>
            </span>
            <span class="col-sm-2 pl-0">
              <base-input class="pb-2"
                type="month"
                :max="maxDate"
                min="1997-01"
                v-model="dateCreated"
                @input="getRefundDisbursements(listType)"
                style="width: 230px;"
                id="inputStyle"
                v-if="filter == 'month'"></base-input>
            </span>
          </div>
          <div class="table-full-width">
            <!-- Refund disbursement table -->
            <vue-good-table :columns="columns"
              :rows="refundDisbursements"
              :search-options="{enabled: true}"
              :pagination-options="{
                enabled: true,
                perPageDropdown: [10, 15, 20],
              }"
              :sort-options="{enabled: true}"
              :line-numbers="true"
              :isLoading="loading"
              ref="refund-disbursement-table">
              <template slot="table-row" slot-scope="props">
                <b><span v-if="props.column.field == 'voucherNumber'">
                  <span v-on:click="openViewRefundDisbursementModal(props.row)"
                    id="sideBarTxt"
                    class="pointer">{{props.row.voucherNumber}}</span>
                </span>
                <span v-if="props.column.field == 'transactionDate'">
                  <span>{{props.row.transactionDate | moment("MMM DD, YYYY")}}</span>
                </span>
                <span v-if="props.column.field == 'amount'">
                  <span class="tableSpan">₱ {{props.row.amount}}</span>
                </span>
                <span v-if="props.column.field == 'refundDate'">
                  <span>{{props.row.refundDate | moment("MMM DD, YYYY")}}</span>
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
            v-if="refundDisbursements.length">
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
                @input="getRefundDisbursements(listType)"></v-select>
            </span>
          </div>
          <hr class="mb-2 mt-2">
          <!-- New refund dibursement button -->
          <div class="text-right pt-2">
            <base-button v-b-modal.new-refund-disbursement-modal
              id="darkBtn"
              class="col-md-4 ml-2 mr-2">New Refund Disbursement</base-button>
          </div>
        </card>
        <!-- Refund disbursement print duplicate -->
        <div class="pl-4"
          id="duplicateView">
          <div class="row">
            <span class="col-sm-6">
              <b>REFUND DISBURSEMENT</b>
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
              <b>Refund Date: </b>{{view.refundDate | moment("MMMM DD, YYYY")}}
            </span>
            <span class="col-sm-6">
              <b>Particular: </b>{{view.particular}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Issue: </b>{{view.issue}}
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
              <b>REFUND DISBURSEMENT</b>
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
              <b>Refund Date: </b>{{view.refundDate | moment("MMMM DD, YYYY")}}
            </span>
            <span class="col-sm-6">
              <b>Particular: </b>{{view.particular}}
            </span>
          </div>
          <div class="row">
            <span class="col-sm-6">
              <b>Issue: </b>{{view.issue}}
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
        <!-- NEW REFUND DISBURSEMENT MODAL -->
        <b-modal size="xl"
          id="new-refund-disbursement-modal"
          title="New Refund Disbursement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Transaction Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Refund Date:</b>
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
              <base-input v-model="newRefundDate"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.newRefundDate.$anyDirty && !$v.newRefundDate.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Amount:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Particular:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newAmount"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.newAmount.$anyDirty && !$v.newAmount.required">Field Required</i>
              <i class="text-red"
                v-if="$v.newAmount.$anyDirty && !$v.newAmount.amountCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="newParticular"
                type="text"></base-input>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Issue:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Chart of Accounts:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <textarea v-model="newIssue"
                rows="4"
                cols="59"
                id="inputStyle"></textarea>
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
                  @click.native="newRefundDisbursement"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Add
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('new-refund-disbursement-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- VIEW LOAN DISBURSEMENT MODAL -->
        <b-modal size="xl"
          id="view-refund-disbursement-modal"
          title="View Refund Disbursement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <card class="pl-4 pt-5 pb-5 shadow"
            id="singleView">
            <div class="row">
              <span class="col-sm-6">
                <b>REFUND DISBURSEMENT</b>
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
                <b>Refund Date: </b>{{view.refundDate | moment("MMMM DD, YYYY")}}
              </span>
              <span class="col-sm-6">
                <b>Particular: </b>{{view.particular}}
              </span>
            </div>
            <div class="row">
              <span class="col-sm-6">
                <b>Issue: </b>{{view.issue}}
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
                  @click.native="printRefundDisbursement"
                  :disabled="requestProcessing">
                  Print
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('view-refund-disbursement-modal')"
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
          id="edit-refund-disbursement-modal"
          title="Edit Refund Disbursement" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Transaction Date:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Refund Date:</b>
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
              <base-input v-model="edit.refundDate"
                type="date"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.refundDate.required">Field Required</i>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Amount:</b>
              <b class="text-red">*</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Particular:</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.amount"
                type="text"></base-input>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.amount.required">Field Required</i>
              <i class="text-red"
                v-if="$v.edit.$anyDirty && !$v.edit.amount.amountCustomValidator">Invalid Characters</i>
            </div>
            <div class="col-sm-6 pl-5 pr-5">
              <base-input v-model="edit.particular"
                type="text"></base-input>
            </div>
          </div>
          <div class="form-group row mb-0">
            <label class="col-sm-6 col-form-label">
              <b>Issue:</b>
            </label>
            <label class="col-sm-6 col-form-label">
              <b>Chart of Accounts:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-6 pl-5 pr-5">
              <textarea v-model="edit.issue"
                rows="4"
                cols="59"
                id="inputStyle"></textarea>
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
                  @click.native="updateRefundDisbursement"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Update
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('edit-refund-disbursement-modal')"
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
        // Refund disbursement table
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
            label: 'Refund Date',
            field: 'refundDate'
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
        refundDisbursements: [],
        // Enable or disable buttons
        requestProcessing: false,
        // Limit Records
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
        // New refund
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
        newRefundDate: moment().format("YYYY-MM-DD"),
        newAmount: '',
        newParticular: '',
        newIssue:'',
        newCOA: '',
        newBusinessType: '',
        // View refund
        view: {
          voucherNumber: '',
          amount: '',
          transactionDate: '',
          refundDate: '',
          particular: '',
          issue: '',
          coa: '',
          businessTypes: ''
        },
        // Refund attachments
        attachment: '',
        attachmentData: null,
        attachments: [],
        rdId: '',
        uploadValue: 0,
        loadAttachment: true,
        // Edit refund
        edit: {
          id: '',
          rdId: '',
          transDate: '',
          refundDate: '',
          amount: '',
          particular: '',
          issue: '',
          coa: '',
          businessType: ''
        },
        // User data
        userRole: '',
        user: {
          firstname: '',
          lastname: ''
        },
        // Print duplicate space breaks
        breakCounts: 18,
      };
    },
    async mounted() {
      this.getUserRole();
      this.getRefundDisbursements("Release");
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
      // New refund disbursement validations
      newTransDate: {required},
      newRefundDate: {required},
      newAmount: {
        required,
        amountCustomValidator
      },
      newCOA: {required},
      newBusinessType: {required},
      // Edit refund disbursement validations
      edit: {
        transDate: {required},
        refundDate: {required},
        amount: {
          required,
          amountCustomValidator
        },
        coa: {required},
        businessType: {required}
      },
      newPercent: {
        required,
        numCustomValidator
      },
      newTerms: {
        required,
        numCustomValidator
      },
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
      // Get bank accounts details
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
      // Get chart of accounts details
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
      // Save new refund disbursement data
      newRefundDisbursement(){
        let self = this;

        self.$v.newTransDate.$touch();
        self.$v.newRefundDate.$touch();
        self.$v.newAmount.$touch();
        self.$v.newCOA.$touch();
        self.$v.newBusinessType.$touch();
        if(!self.$v.newTransDate.$error && !self.$v.newRefundDate.$error && !self.$v.newAmount.$error && !self.$v.newCOA.$error && !self.$v.newBusinessType.$error){
          self.requestProcessing = true;
          try{
            let getUserId = dbUsers.collection('users')
              .where("username", '==', localStorage.getItem('aisname'));
            let users = [];
            let dataId = 'RDI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
            let voucher = dbUsers.collection('refundDisbursements')
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
                dbUsers.collection("refundDisbursements").doc()
                .set({
                  refundDisbursementId: dataId,
                  transactionDate: self.newTransDate,
                  refundDate: self.newRefundDate,
                  amount: self.newAmount,
                  particular: self.newParticular,
                  issue: self.newIssue,
                  voucherNumber: addZero(genVoucherNo.getMonth() + 1) + '' + (genVoucherNo.getFullYear().toString()).slice(2,4) + '-3' + lastVoucher,
                  accountReference: self.newCOA,
                  businessTypeReference: self.newBusinessType,
                  status: 1,
                  userReference: users[0].userId,
                  dateCreated: today,
                  dateModified: today
                }).then(() => {
                  self.$swal({
                    title: 'Success',
                    text: 'New refund disbursement added successfully!',
                    icon: 'success',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    self.newTransDate = moment().format("YYYY-MM-DD");
                    self.newRefundDate = moment().format("YYYY-MM-DD");
                    self.newAmount = '';
                    self.newParticular = '';
                    self.newIssue = '';
                    self.newCOA = '';
                    self.newBusinessType = '';
                    self.requestProcessing = false;
                    self.$v.newTransDate.$reset();
                    self.$v.newRefundDate.$reset();
                    self.$v.newAmount.$reset();
                    self.$v.newCOA.$reset();
                    self.$v.newBusinessType.$reset();
                    self.$bvModal.hide('new-refund-disbursement-modal');
                    self.$refs['refund-disbursement-table'].reset();
                    self.getChartOfAccounts();
                    self.getBusinessTypes();
                    self.getRefundDisbursements(self.listType);
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
      // Display refund disbursement data on table
      getRefundDisbursements(type) {
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
            self.refundDisbursements = [];
            self.listType = type;
            if(user == 'Administrator' || user == 'Manager'){
              if(type == "Release"){
                if(self.limit != "all"){
                  rdData = dbUsers.collection("refundDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==",1)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  rdData = dbUsers.collection("refundDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==",1);
                }
              }else if(type == "Cleared"){
                if(self.limit != "all"){
                  rdData = dbUsers.collection("refundDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==", 2)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  rdData = dbUsers.collection("refundDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("status","==", 2)
                }
              }else if(type == "All"){
                if(self.limit != "all"){
                  rdData = dbUsers.collection("refundDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  rdData = dbUsers.collection("refundDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end);
                }
              }
            }else if(user == 'User'){
              if(type == "Release"){
                if(self.limit != "all"){
                  rdData = dbUsers.collection("refundDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==",1)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  rdData = dbUsers.collection("refundDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==",1);
                }
              }else if(type == "Cleared"){
                if(self.limit != "all"){
                  rdData = dbUsers.collection("refundDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==", 2)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  rdData = dbUsers.collection("refundDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .where("status","==", 2)
                }
              }else if(type == "All"){
                if(self.limit != "all"){
                  rdData = dbUsers.collection("refundDisbursements")
                    .where("transactionDate", ">=", start)
                    .where("transactionDate", "<=", end)
                    .where("userReference","==",accountId)
                    .limit(self.limit);
                }else if(self.limit == "all"){
                  rdData = dbUsers.collection("refundDisbursements")
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
                let coaData = dbMains.collection("chartOfAccounts");
                let bTypeData = dbMains.collection("businessTypes");
                let accounts = [], types = [];

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
                      rd[i]["coa"] = '';
                      rd[i]["businessType"] = '';
                      rd[i].amount = format(parseFloat(rd[i].amount.replaceAll(",","")).toFixed(2));
                      self.refundDisbursements.push(rd[i]);
                      for(let a = 0; a < accounts.length; a++){
                        if(accounts[a].accountId == rd[i].accountReference){
                          rd[i].coa = accounts[a].account;
                        }
                      }
                      for(let b = 0; b < types.length; b++){
                        if(types[b].businessTypeId == rd[i].businessTypeReference){
                          rd[i].businessType = types[b].type;
                        }
                      }
                    }
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
      // View refund disbursement details
      openViewRefundDisbursementModal(row){
        let self = this;

        self.view = {
          voucherNumber: row.voucherNumber,
          amount: row.amount,
          transactionDate: row.transactionDate,
          refundDate: row.refundDate,
          particular: row.particular,
          issue: row.issue,
          coa: row.coa,
          businessType: row.businessType
        };
        self.$bvModal.show("view-refund-disbursement-modal");
      },
      // Show refund disbursement attachment
      openAttachments(row){
        this.rdId = row.refundDisbursementId;
        this.attachmentStatus = row.status;
        this.$bvModal.show("attachment-modal");
        this.getAttachments(this.rdId);
      },
      // Save new refund disbursement attachment
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
        const storageRef = storageMains.ref('refundDisbursements/' + self.rdId + '/' + data.name)
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
      // Display refund disbursement attachments
      getAttachments(id){
        let self= this, rowNum = 0;
        let listRef = storageMains.ref('refundDisbursements/' + id);

        self.loadAttachment = true;
        self.attachments = [];
        listRef.listAll()
        .then((res) => {
          res.items.forEach((itemRef) => {
          storageMains.ref('refundDisbursements/' + id + '/' + itemRef.name)
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
      // Delete refund disbursement attachment
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
            let deleteRef = storageMains.ref('refundDisbursements/' + self.rdId + '/' + name);

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
      // Display edit refund disbursement form
      openUpdateRDModal(row){
        let self = this;

        self.edit = {
          id: row.id,
          rdId: row.refundDisbursementId,
          transDate: row.transactionDate,
          refundDate: row.refundDate,
          amount: row.amount,
          particular: row.particular,
          issue: row.issue,
          coa: row.accountReference,
          businessType: row.businessTypeReference
        };
        self.$bvModal.show("edit-refund-disbursement-modal");
      },
      // Change refund disbursement details
      updateRefundDisbursement(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          try{
            dbUsers.collection("refundDisbursements")
            .doc(self.edit.id)
            .update({
              transactionDate: self.edit.transDate,
              refundDate: self.edit.refundDate,
              amount: self.edit.amount,
              particular: self.edit.particular,
              issue: self.edit.issue,
              accountReference: self.edit.coa,
              businessTypeReference: self.edit.businessType,
              dateModified: today
            }).then(() => {
              self.edit = {
                id: '',
                rdId: '',
                transDate: '',
                refundDate: '',
                amount: '',
                particular: '',
                issue: '',
                coa: '',
                businessType: ''
              };
              self.requestProcessing = false;
              self.$v.edit.$reset();
              self.$bvModal.hide('edit-refund-disbursement-modal');
              self.$refs['refund-disbursement-table'].reset();
              self.getRefundDisbursements(self.listType);
              self.$swal({
                title: 'Success',
                text: 'Refund disbursement updated successfully!',
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
      // Change refund disbursement status
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
            dbUsers.collection("refundDisbursements")
            .doc(row.id)
            .update({
              status: stat,
              dateModified: today
            }).then(() => {
              self.$refs['refund-disbursement-table'].reset();
              self.getRefundDisbursements(msg);
              self.$swal({
                title: 'Success',
                text: 'Refund disbursement status change successfully!',
                icon: 'success',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            });
          }
        });
      },
      // Print refund disbursement details
      printRefundDisbursement(){
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
              documentTitle: 'Refund Disbursement Voucher',
            });
          }else{
            printJS({
              printable: 'singleView',
              type: 'html',
              style: '#singleView {font-family: "Calibri";} #borderStyle {border-width: 1px; border-style: solid;} #docStyle {display: block; overflow: inherit; white-space: normal; font-size: 12px;}',
              documentTitle: 'Refund Disbursement Voucher',
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
