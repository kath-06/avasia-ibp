<template>
  <card>
    <!-- Bank check status links -->
    <div class="row">
      <div class="col-4 text-left ml-1 mt-2 mb-2 pt-2">
        <badge class="badge-dot ml-3 pointer">
          <i id="activeBadge"
            v-if="listType == 'Used'"></i>
          <i id="redBg" v-else></i>
          <span class="pointer status"
            id="sideBarTxt"
            v-on:click="getPaginatedBankChecks(1, '', 'Used')">Used</span>
        </badge>
        <badge class="badge-dot ml-3 pointer">
          <i id="activeBadge"
            v-if="listType == 'Cleared'"></i>
          <i id="redBg" v-else></i>
          <span class="pointer status"
            id="sideBarTxt"
            v-on:click="getPaginatedBankChecks(1, '', 'Cleared')">Cleared</span>
        </badge>
        <badge class="badge-dot ml-3 pointer">
          <i id="activeBadge"
            v-if="listType == 'Cancelled'"></i>
          <i id="redBg" v-else></i>
          <span class="pointer status"
            id="sideBarTxt"
            v-on:click="getPaginatedBankChecks(1, '', 'Cancelled')">Cancelled</span>
        </badge>
        <badge class="badge-dot ml-3 pointer">
          <i id="activeBadge"
            v-if="listType == 'All'"></i>
          <i id="redBg" v-else></i>
          <span class="pointer status"
            id="sideBarTxt"
            v-on:click="getPaginatedBankChecks(1, '', 'All')">All</span>
        </badge>
      </div>
      <span class="col-2 pt-3 pl-5 text-right">
        <b>Filter by:</b>
      </span>
      <span class="col-sm-3 pt-2 text-right">
        <v-select id="inputStyle"
          :options="filters"
          :reduce="filter => filter.filterId"
          label="filter"
          v-model="filter"
          :clearable="false" readonly
          @input="reloadData()"
          style="width: 230px;"></v-select>
      </span>
      <span class="col-sm-2 pl-0">
        <base-input class="pt-2"
          type="month"
          :max="maxDate"
          min="1997-01"
          v-model="dateCreated"
          @input="reloadData()"
          v-if="filter == 'dateCreated'"
          style="width: 200px;"
          id="inputStyle"></base-input>
        <base-input class="pt-2"
          type="month"
          min="1997-01"
          v-model="dateCreated"
          @input="reloadData()"
          v-if="filter == 'checkDate'"
          style="width: 200px;"
          id="inputStyle"></base-input>
        <v-select class="pt-2"
          id="inputStyle"
          :options="banks"
          :reduce="bank => bank.bankUid"
          label="bank"
          v-model="bank"
          :clearable="false" readonly
          @input="reloadData()"
          style="width: 230px;"
          v-if="filter == 'bank'"></v-select>
        <v-select class="pt-2"
          id="inputStyle"
          :options="bankAccounts"
          :reduce="account => account.bankAccountUid"
          label="account"
          v-model="bankAccount"
          :clearable="false" readonly
          @input="reloadData()"
          style="width: 230px;"
          v-if="filter == 'bankAccount'"></v-select>
      </span>
    </div>
    <!-- Bank check table -->
    <vue-good-table :columns="columns"
      :rows="bankChecks"
      :search-options="{enabled: true}"
      :pagination-options="{
        enabled: true,
        perPageDropdown: [10, 15, 20],
      }"
      :sort-options="{enabled: true}"
      :line-numbers="true"
      :isLoading="loading"
      ref="check-table">
      <template slot="table-row"
        slot-scope="props">
        <b><span v-if="props.column.field == 'bankCheckNumber'">
          <span>{{props.row.bankCheckNumber}}</span>
        </span>
        <span v-if="props.column.field == 'bankCheckAmount'">
          <span>₱ {{props.row.bankCheckAmount}}</span>
        </span>
        <span v-if="props.column.field == 'bankCheckDate'">
          <span class="tableSpan">{{props.row.bankCheckDate | moment("MMM DD, YYYY")}}</span>
        </span>
        <span v-if="props.column.field == 'payee'">
          <span class="tableSpan">{{props.row.payee}}</span>
        </span>
        <span v-if="props.column.field == 'description'">
          <span class="tableSpan">{{props.row.description}}</span>
        </span>
        <span v-if="props.column.field == 'bank'">
          <span v-for="bank in banks"
            v-bind:key="bank.bankUid" >
            <span v-if="bank.bankUid == props.row.bankReference">{{bank.bank}}</span>
          </span>
        </span>
        <span v-if="props.column.field == 'bankAccount'">
          <span v-for="bankAccount in bankAccounts"
            v-bind:key="bankAccount.bankAccountUid">
            <span v-if="bankAccount.bankAccountUid == props.row.bankAccountReference">{{bankAccount.bankAccountNumber}}</span>
          </span>
        </span>
        <span v-if="props.column.field == 'action'"
          class="text-center">
          <span v-if=" props.row.status != 2">
            <span class="pointer ml-2 far fa-edit"
              id="sideBarTxt"
              v-on:click="openUpdateCheckModal(props.row)"
              title="Update"
              v-if="props.row.status == 3"></span>
            <router-link :to='"/check/voucher/" + props.row.bankCheckUid + "/check"'
              class="pointer ml-2 fa fa-print"
              id="sideBarTxt"
              title="View Print Page"
               v-if="props.row.status != 0"></router-link>
            <span class="pointer ml-2 far fa-stop-circle"
              id="sideBarTxt"
              v-on:click="checkPrinted(props.row, 1)"
              title="Disable Check Print"
              v-if="props.row.status == 3"> </span>
            <span class="pointer ml-2 far fa-check-circle"
              id="sideBarTxt"
              v-on:click="checkPrinted(props.row, 3)"
              title="Enable Check Print"
              v-if="props.row.status == 1 && userRole != 'User'"></span>
            <span class="pointer ml-2 far fa-times-circle"
              id="sideBarTxt"
              v-on:click="cancelCheck(props.row)"
              v-if="(props.row.status != 0 && props.row.status != 3) && userRole != 'User'"
              title="Cancel Check"></span>
            <span v-if="props.row.status == 0"
              id="redTxt">CANCELLED</span>
            <span class="pointer ml-2 far fa-check-circle"
              id="sideBarTxt"
              v-on:click="checkUsedStatus(props.row, 1)"
              title="Return to Used Check"
              v-if="props.row.status == 0 && userRole != 'User'"></span>
          </span>
          <span v-if="props.row.status == 2">
            <span id="redTxt">CLEARED</span>
            <router-link :to='"/check/voucher/" + props.row.bankCheckUid + "/check"'
              class="pointer ml-2 fa fa-print"
              id="sideBarTxt"
              title="View Print Page"
              v-if="props.row.status != 0"></router-link>
          </span>
        </span></b>
      </template>
    </vue-good-table>
    <!-- Limit bank check records on table -->
    <div class="row pl-4 pt-2"
      v-if="bankChecks.length">
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
          @input="getPaginatedBankChecks(1, '', listType)"></v-select>
      </span>
    </div>
    <!-- UPDATE CHECKS MODAL -->
    <b-modal size="xl"
      id="update-check-modal"
      title="Update Check" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0 pl-5 pr-5">
        <label class="col-sm-6 col-form-label">
          <b>Payee:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Check Date:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0 pl-5 pr-5">
        <div class="col-sm-6 pl-5 pr-5">
          <v-select id="inputStyle"
            :options="suppliers"
            :reduce="supplier => supplier.supplierId"
            label="supplier"
            v-model="editCheck.payee"
            :clearable="false"></v-select>
          <i class="text-red"
            v-if="$v.editCheck.$anyDirty && !$v.editCheck.payee.required">Field Required</i>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="editCheck.checkDate"
            id="inputStyle"
            type="date"
            placeholder="Check Date"
            class="mb-0"></base-input>
          <i class="text-red"
            v-if="$v.editCheck.$anyDirty && !$v.editCheck.checkDate.required">Field Required</i>
        </div>
      </div>
      <div class="form-group row mb-0 pl-5 pr-5">
        <label class="col-sm-12 col-form-label">
          <b>Remarks:</b>
        </label>
      </div>
      <div class="form-group row mb-0 pl-5 pr-5">
        <div class="col-sm-12 pl-5 pr-5">
          <textarea v-model="editCheck.desc"
            rows="4"
            cols="80"
            id="inputStyle"
            placeholder="Description"
            class="pl-3 pr-3 pt-2 pb-2"></textarea>
        </div>
      </div>
      <hr>
      <template v-slot:modal-footer>
        <div class="w-100 mt-0">
          <div class="text-left pl-5">
            <h2 class="display-5"
              id="sideBarTxt">Particulars</h2>
          </div>       
          <div class="table-full-width pb-5 pl-5 pr-5 pt-2">
            <paper-table type="hover"
              :loading="loading"
              :loadError="loadError"
              @reloadData="reloadData"
              :title="particularsTable.title"
              :sub-title="particularsTable.subTitle"
              :data="particulars"
              :columns="particularsTable.columns">
              <template slot-scope="{ row }">
                <td>{{row.rowNum}}</td>
                <td>
                  <span id="particular">{{row.particular}}</span>
                </td>
                <td>{{row.description || '------'}}</td>
                <td>{{row.referenceNumber || '------'}}</td>
                <td>₱ {{row.particularAmount}}</td>
                <td align="right">
                  <span class="pointer ml-2 far fa-edit"
                    id="sideBarTxt"
                    v-on:click="openEditParticularModal(row)"
                    v-if="row.rowNum != '' && userRole == 'Administrator'"
                    title="Edit"></span>
                  <span class="pointer ml-2 far fa-times-circle"
                    id="sideBarTxt"
                    v-on:click="removeParticular(row)"
                    v-if="row.rowNum != '' && userRole == 'Administrator'"
                    title="Remove"></span>
                </td>
              </template>
            </paper-table>
          </div>
          <div class="text-right pr-5">
            <base-button id="darkBtn"
              @click.native="$bvModal.show('add-particular-modal')"
              :disabled="requestProcessing"
              v-if="userRole == 'Administrator'">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Add Particular
            </base-button>
            <base-button id="darkBtn"
              @click.native="updateCheck"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Update
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('update-check-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
    <!-- ADD PARTICULARS MODAL -->
    <b-modal size="lg"
      id="add-particular-modal"
      title="Add Particular" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-12 pl-4 col-form-label">
          <b>Particular:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-9 pl-5 pb-0">
          <v-select id="inputStyle"
            :options="allParticulars"
            :reduce="particular => particular.particularId"
            label="particular"
            v-model="newParticular"
            :clearable="false"></v-select>
          <i class="text-red"
            v-if="$v.newParticular.$anyDirty && !$v.newParticular.required">Field Required</i>
        </div>
        <div class="col-sm-3 pr-5 pb-0">
          <base-button block id="darkBtn"
            title="Add Payee"
            v-b-modal.new-voucher-particular-modal>Add Particular</base-button>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 pl-4 col-form-label">
          <b>Description:</b>
        </label>
        <label class="col-sm-6 pl-4 col-form-label">
          <b>Reference Number:</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newDescription"
            type="text" 
            id="inputStyle"
            placeholder="Description"></base-input>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newReferenceNumber"
            type="text"
            id="inputStyle"
            placeholder="Reference Number"></base-input>
          <i class="text-red"
            v-if="$v.newReferenceNumber.$anyDirty && !$v.newReferenceNumber.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 pl-4 col-form-label">
          <b>Unit Price:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-3 pl-4 col-form-label">
          <b>Quantity:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newUnitPrice"
            type="text"
            id="inputStyle"
            placeholder="Unit Price"
            @input="computeAmount(newUnitPrice, newQuantity, 'add')"></base-input>
            <i class="text-red"
              v-if="$v.newUnitPrice.$anyDirty  && !$v.newUnitPrice.required">Invalid Characters</i>
            <i class="text-red"
              v-if="$v.newUnitPrice.$anyDirty && !$v.newUnitPrice.amountCustomValidator">Invalid Characters</i>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newQuantity"
            type="text"
            id="inputStyle"
            placeholder="Quantity"
            @input="computeAmount(newUnitPrice, newQuantity, 'add')"></base-input>
            <i class="text-red"
              v-if="$v.newQuantity.$anyDirty  && !$v.newQuantity.required">Invalid Characters</i>
            <i class="text-danger"
              v-if="$v.newQuantity.$anyDirty && !$v.newQuantity.numCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 pl-4 col-form-label">
          <b>Amount:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newAmount"
            type="text"
            id="inputStyle"
            placeholder="Amount"
            readonly></base-input>
          <i class="text-red"
            v-if="$v.newAmount.$anyDirty  && !$v.newAmount.required">Invalid Characters</i>
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
    <!-- UPDATE PARTICULARS MODAL -->
    <b-modal size="lg"
      id="update-particular-modal"
      title="Update Particular" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-12 pl-4 col-form-label">
          <b>Particular:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-12 pl-5 pr-5 pb-0">
          <v-select id="inputStyle"
            :options="allParticulars"
            :reduce="particular => particular.particularId"
            label="particular"
            v-model="edit.particularReference"
            :clearable="false"></v-select>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.particularReference.required">Field Required</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 pl-4 col-form-label">
          <b>Description:</b>
        </label>
        <label class="col-sm-3 pl-4 col-form-label">
          <b>Reference Number:</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="edit.description"
            type="text"
            id="inputStyle"
            placeholder="Description"></base-input>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="edit.referenceNumber"
            type="text"
            id="inputStyle"
            placeholder="Reference Number"></base-input>
          <i class="text-red"
            v-if="$v.edit.referenceNumber.$anyDirty && !$v.edit.referenceNumber.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 pl-4 col-form-label">
          <b>Unit Price:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-3 pl-4 col-form-label">
          <b>Quantity:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="edit.unitPrice"
            type="text"
            id="inputStyle"
            placeholder="Unit Price"
            @input="computeAmount(edit.unitPrice, edit.quantity, 'edit')"></base-input>
          <i class="text-red"
            v-if="$v.edit.unitPrice.$anyDirty  && !$v.edit.unitPrice.required">Invalid Characters</i>
          <i class="text-red"
            v-if="$v.edit.unitPrice.$anyDirty && !$v.edit.unitPrice.amountCustomValidator">Invalid Characters</i>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="edit.quantity"
            type="text"
            id="inputStyle"
            placeholder="Quantity"
            @input="computeAmount(edit.unitPrice, edit.quantity, 'edit')"></base-input>
          <i class="text-red"
            v-if="$v.edit.quantity.$anyDirty  && !$v.edit.quantity.required">Invalid Characters</i>
          <i class="text-danger"
            v-if="$v.edit.quantity.$anyDirty && !$v.edit.quantity.numCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 pl-4 col-form-label">
          <b>Amount:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="edit.amount"
            type="text"
            id="inputStyle"
            placeholder="Amount"
            readonly></base-input>
          <i class="text-red"
            v-if="$v.edit.amount.$anyDirty  && !$v.edit.amount.required">Invalid Characters</i>
          <i class="text-red"
            v-if="$v.edit.amount.$anyDirty && !$v.edit.amount.amountCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="updateParticular"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>Update
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('update-particular-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
    <!-- ADD VOUCHER PARTICULAR MODAL -->
    <new-check-voucher-particular
      id="new-voucher-particular-modal"
      @successSubmit="getVoucherParticulars()">
    </new-check-voucher-particular>
  </card>
</template>
<script>
  import {db, dbUsers, dbMains} from '@/main';
  import {required, helpers} from "vuelidate/lib/validators";
  import {mapGetters} from "vuex";

  const tableColumns = ["#", "Check No.", "Amount", "Date", "Payee", "Bank", "Account No.", "Actions"];
  const particularColumns = ["#", "Particular", "Description", "Reference Number", "Amount", "Actions"];
  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const today = new Date();
  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9₱ ,. ]*$/);
  const addZero = require('add-zero');

  export default {
    name: 'check-list',
    components: {},
     data() {
      return {
        // Bank check table
        columns: [{
            label: 'Check No',
            field: 'bankCheckNumber'
          },{
            label: 'Amount',
            field: 'bankCheckAmount'
          },{
            label: 'Date',
            field: 'bankCheckDate'
          },{
            label: 'Payee',
            field: 'payee',
            width: '90px'
          },{
            label: 'Remarks',
            field: 'description',
            width: '100px'
          },{
            label: 'Bank',
            field: 'bank',
            width: '80px'
          },{
            label: 'Account No',
            field: 'bankAccount'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '120px'
        }],
        loading: true,
        loadError: false,
        bankCheckTable: {
          title: "Bank Checks Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        particularsTable: {
          title: "Particulars Table",
          subTitle: "",
          columns: [...particularColumns]
        },
        bankChecksCount: 0,
        bankChecks: [],
        banks: [],
        activateBanks: [],
        bankAccounts: [],
        activateBankAccounts: [],
        particulars: [],
        currentPage: 1 ,
        searchTerm: '',
        searching: false ,
        requestProcessing: false,
        views: [
          {"limitId": "30", "limit": "30 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "30",
        suppliers: [],
        filters: [
          {"filterId": "dateCreated", "filter": 'Date Created'},
          {"filterId": "checkDate", "filter": 'Check Date'},
          {"filterId": "bank", "filter": 'Bank'},
          {"filterId": "bankAccount", "filter": 'Bank Account'}
        ],
        filter: 'dateCreated',
        dateCreated: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        listType: '',
        pageNum: 1,
        bank: '', 
        bankAccount: '',
        userRole: '',
        // New check particular
        newParticular: '',
        newDescription: '',
        newReferenceNumber: '',
        newUnitPrice: '',
        newQuantity: '',
        newAmount: '',
        // Edit check
        editCheck: {
          checkId: '',
          checkDate: '',
          payee: '',
          desc: '',
        },
        // Edit check particular
        edit: {
          particularId: '',
          particularReference: '',
          particular: '',
          description: '',
          referenceNumber: '',
          unitPrice: '',
          quantity: '',
          amount: ''
        }
      };
    },
    validations: {
      // New check particular validations
      newParticular: {required},
      newReferenceNumber: {alphaNumCustomValidator},
      newUnitPrice: {
        required,
        amountCustomValidator
      },
      newQuantity: {
        required,
        numCustomValidator
      },
      newAmount: {
        required,
        amountCustomValidator
      },
      // Edit check validations
      editCheck: {
        payee: {required},
        checkDate: {required},
      },
      // Edit check particular validations
      edit: {
        particularReference: {required},
        referenceNumber: {alphaNumCustomValidator},
        unitPrice: {
          required,
          amountCustomValidator
        },
        quantity: {
          required,
          numCustomValidator
        },
        amount: {
          required,
          amountCustomValidator
        }
      }
    },
    computed: {
      ...mapGetters({
        allParticulars: 'VoucherParticulars/allParticulars'
      })
    },
    async mounted(){
      this.getVoucherParticulars();
      this.getPaginatedBankChecks(1, "", "Used");
      this.getBanks();
      this.getBankAccounts();
      this.getSuppliers();
      this.getUserRole();
    },
    methods: {
      // Get all check voucher particulars
      async getVoucherParticulars() {
        let self = this;

        await self.$store.dispatch('VoucherParticulars/getAllParticulars');
        this.$forceUpdate();
      },
      closePage(){
        this.$router.push('/check/dashboard');
      },
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
            self.accountId = accounts[0].userId;
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
      // Display check data on table
      getPaginatedBankChecks(page, searchTerm, type) {
        let self = this, bankCheckData = null, ids = [], checks = [];
        let start = moment(self.dateCreated).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.dateCreated).endOf('month').format('YYYY-MM-DD');

        self.username = localStorage.getItem('aisname');
        self.accountName = self.username.toUpperCase();
        let userAccount = dbUsers.collection("users")
          .where("username", "==", self.username);
        let accounts = [], accountId = '', user = '';

        userAccount.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              accounts.push(doc.data());
            });
            accountId = accounts[0].userId;
          }
          let userRole = dbUsers.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let roles = [];

          userRole.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              roles.push(doc.data());
            });
            user = roles[0].userRole;
            self.loading = true;
            self.loadError = false;
            self.bankChecks = [];
            self.listType = type;
            self.pageNum = page;
            if(searchTerm) {
              self.searching = true;
            }
            if(searchTerm){
              searchTerm = searchTerm.toString();
              if(self.limit != "all"){
                bankCheckData = db.collection("bankChecks")
                  .where("bankCheckNumber", "==", searchTerm.toString())
                  .orderBy("dateCreated", "desc")
                  .limit(self.limit);
              }else if(self.limit == "all"){
                bankCheckData = db.collection("bankChecks")
                  .where("bankCheckNumber", "==", searchTerm.toString())
                  .orderBy("dateCreated", "desc");
              }
            }else if(type == "Used"){
              if(user == 'Administrator' || user == 'Manager'){
                if(self.limit != "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("status","in",[1, 3])
                      .orderBy("dateCreated","desc")
                      .limit(self.limit);
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("status", "in", [1,3])
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .where("status", "in", [1,3])
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .where("status", "in", [1,3])
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("status","in",[1, 3])
                      .orderBy("dateCreated","desc");
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("status", "in", [1,3])
                      .orderBy("bankCheckDate", "desc");
                  }
                }
              }else if(user == 'User'){
                if(self.limit != "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("userReference","==", accountId)
                      .where("status","in",[1, 3])
                      .orderBy("dateCreated","desc")
                      .limit(self.limit);
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("userReference","==", accountId)
                      .where("status", "in", [1,3])
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .where("userReference","==", accountId)
                      .where("status", "in", [1,3])
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .where("userReference","==", accountId)
                      .where("status", "in", [1,3])
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("userReference","==", accountId)
                      .where("status","in",[1, 3])
                      .orderBy("dateCreated","desc");
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("userReference","==", accountId)
                      .where("status", "in", [1,3])
                      .orderBy("bankCheckDate", "desc");
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .where("userReference","==", accountId)
                      .where("status", "in", [1,3])
                      .orderBy("bankCheckDate", "desc");
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .where("userReference","==", accountId)
                      .where("status", "in", [1,3])
                      .orderBy("bankCheckDate", "desc");
                  }
                }
              }
            }else if(type == "Cleared"){
              if(user == 'Administrator' || user == 'Manager'){
                if(self.limit != "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("status","==",2)
                      .orderBy("dateCreated","desc")
                      .limit(self.limit);
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("status", "==",2)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .where("status", "==",2)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .where("status", "==",2)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("status","==",2)
                      .orderBy("dateCreated","desc");
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("status", "==",2)
                      .orderBy("bankCheckDate", "desc");
                  }
                }
              }else if(user == 'User'){
                if(self.limit != "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("userReference","==", accountId)
                      .where("status","==",2)
                      .orderBy("dateCreated","desc")
                      .limit(self.limit);
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("userReference","==", accountId)
                      .where("status","==",2)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .where("userReference","==", accountId)
                      .where("status","==",2)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .where("userReference","==", accountId)
                      .where("status","==",2)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("userReference","==", accountId)
                      .where("status","==",2)
                      .orderBy("dateCreated","desc");
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("userReference","==", accountId)
                      .where("status","==",2)
                      .orderBy("bankCheckDate", "desc");
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .where("userReference","==", accountId)
                      .where("status","==",2)
                      .orderBy("bankCheckDate", "desc");
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .where("userReference","==", accountId)
                      .where("status","==",2)
                      .orderBy("bankCheckDate", "desc");
                  }
                }
              }
            }else if(type == "Cancelled"){
              if(user == 'Administrator' || user == 'Manager'){
                if(self.limit != "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("status","==", 0)
                      .orderBy("dateCreated", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("status", "==", 0)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .where("status", "==", 0)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .where("status", "==", 0)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("status","==", 0)
                      .orderBy("dateCreated", "desc");
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("status", "==", 0)
                      .orderBy("bankCheckDate", "desc");
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .where("status", "==", 0)
                      .orderBy("bankCheckDate", "desc");
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .where("status", "==", 0)
                      .orderBy("bankCheckDate", "desc");
                  }
                }
              }else if(user == 'User'){
                if(self.limit != "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("userReference","==", accountId)
                      .where("status","==", 0)
                      .orderBy("dateCreated", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("userReference","==", accountId)
                      .where("status", "==", 0)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .where("userReference","==", accountId)
                      .where("status", "==", 0)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .where("userReference","==", accountId)
                      .where("status", "==", 0)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("userReference","==", accountId)
                      .where("status","==", 0)
                      .orderBy("dateCreated", "desc");
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("userReference","==", accountId)
                      .where("status", "==", 0)
                      .orderBy("bankCheckDate", "desc");
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .where("userReference","==", accountId)
                      .where("status", "==", 0)
                      .orderBy("bankCheckDate", "desc");
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .where("userReference","==", accountId)
                      .where("status", "==", 0)
                      .orderBy("bankCheckDate", "desc");
                  }
                }
              }
            }else if(type == "All"){
              if(user == 'Administrator' || user == 'Manager'){
                if(self.limit != "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .orderBy("dateCreated", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .orderBy("dateCreated", "desc");
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .orderBy("bankCheckDate", "desc");
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .orderBy("bankCheckDate", "desc");
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .orderBy("bankCheckDate", "desc");
                  }
                }
              }else if(user == 'User'){
                if(self.limit != "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("userReference","==", accountId)
                      .orderBy("dateCreated", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("userReference","==", accountId)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .where("userReference","==", accountId)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .where("userReference","==", accountId)
                      .orderBy("bankCheckDate", "desc")
                      .limit(self.limit);
                  }
                }else if(self.limit == "all"){
                  if(self.filter == 'dateCreated'){
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    bankCheckData = db.collection("bankChecks")
                      .where("dateCreated", ">=", startDate)
                      .where("dateCreated", "<=", endDate)
                      .where("userReference","==", accountId)
                      .orderBy("dateCreated", "desc");
                  }else if(self.filter == 'checkDate'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankCheckDate", ">=", start)
                      .where("bankCheckDate", "<=", end)
                      .where("userReference","==", accountId)
                      .orderBy("bankCheckDate", "desc");
                  }else if(self.filter == 'bank'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankReference", "==", self.bank)
                      .where("userReference","==", accountId)
                      .orderBy("bankCheckDate", "desc");
                  }else if(self.filter == 'bankAccount'){
                    bankCheckData = db.collection("bankChecks")
                      .where("bankAccountReference", "==", self.bankAccount)
                      .where("userReference","==", accountId)
                      .orderBy("bankCheckDate", "desc");
                  }
                }
              }
            }
            bankCheckData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  checks.push(doc.data());
                  ids.push(doc.id);
                });
                let supData = db.collection("suppliers");
                let sups = [];

                supData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    sups.push(doc.data());
                  })
                  for(let i = 0; i < checks.length; i++){
                    checks[i]["rowNum"] = 1 + i;
                    checks[i]["id"] = ids[i];
                    checks[i]["payee"] = '';
                    for(let a = 0; a < sups.length; a++){
                      if(checks[i].payeeReference == sups[a].supplierId){
                        checks[i].payee = sups[a].supplier;
                      }
                    }
                    checks[i].dateCreated = moment.unix(checks[i].dateCreated.seconds);
                    checks[i].bankCheckAmount = format(parseFloat(checks[i].bankCheckAmount).toFixed(2));
                    self.bankChecks.push(checks[i]);
                  }
                });
                self.bankChecksCount = checks.length;
                self.currentPage = page;
              }
              setTimeout(function() {
                self.loading = false;
              }, 1000);
            });
          });
        });

      },
      onPageChange (page) {
        let searchTerm = this.searchTerm;

        this.getPaginatedBankChecks(page, searchTerm, this.listType);
      },
      resetData() {
        this.searching = false;
          if(this.searchTerm == "") {
            this.getPaginatedBankChecks(1, "", this.listType);
        }
      },
      reloadData() {
        this.searchTerm = "";
        this.searching = false;
        this.getPaginatedBankChecks(1, "", this.listType);
      },
      search() {
        let searchTerm = this.searchTerm;

        if(searchTerm) {
          this.getPaginatedBankChecks(1, searchTerm, this.listType);
        }
      },
      // Get bank data
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
        });
      },
      // Get bank account data
      getBankAccounts(){
        let self = this;
        let bankAccountData = db.collection("bankAccounts")
          .orderBy("bankAccountNumber", "asc");

        self.bankAccounts = [];
        bankAccountData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.bankAccounts.push(doc.data());
          });
          for(let a = 0; a < self.banks.length; a++){
            for(let b = 0; b < self.bankAccounts.length; b++){
              if(self.banks[a].bankUid == self.bankAccounts[b].bankReference){
                self.bankAccounts[b]["account"] = self.banks[a].bank + ' ' + self.bankAccounts[b].bankAccountNumber;
              }
            }
          }
          self.bankAccount = self.bankAccounts[0].bankAccountUid;
        });
      },
      // Get check payee data
      getSuppliers(){
        let self = this;
        let supplierData = db.collection("suppliers")
          .orderBy("supplier", "asc");

        self.suppliers = [];
        supplierData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.suppliers.push(doc.data());
          });
        });
      },
      // Show edit check form
      openUpdateCheckModal(row){
        let self = this;

        self.editCheck.checkId = row.bankCheckUid
        self.editCheck.payee = row.payeeReference;
        self.editCheck.checkDate = row.bankCheckDate;
        self.editCheck.desc = row.description;
        self.getParticulars(row.bankCheckUid);
        self.$bvModal.show('update-check-modal');
      },
      // Change check details
      updateCheck(){
        let self = this;

        try{
          self.$v.editCheck.$touch();
          if(!self.$v.editCheck.$error){
            self.requestProcessing = true;
            let checkData = db.collection("bankChecks")
              .where("bankCheckUid", "==", self.editCheck.checkId);
            let id = '';
            
            checkData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                id = doc.id;
              });
              db.collection("bankChecks")
              .doc(id)
              .update({
                payeeReference: self.editCheck.payee,
                bankCheckDate: self.editCheck.checkDate,
                description: self.editCheck.desc,
                dateModified: today
              }).then(() => {
                self.requestProcessing = false;
                self.getPaginatedBankChecks(self.pageNum, "", self.listType);
                self.$bvModal.hide('update-check-modal');
                self.$v.editCheck.$reset();
                self.$refs['check-table'].reset();
                self.$swal({
                  title: 'Success',
                  text: 'Check updated successfully!',
                  icon: 'success',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              })
            });
          }
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
      // Get check particulars
      getParticulars(checkID){
        let self = this;
        let particularData = db.collection("bankCheckParticulars")
          .where("bankCheckReference", "==", checkID);

        self.particulars = [];
        particularData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.particulars.push(doc.data());
          });
          self.loading = true;
          self.loadError = false;
          for(let j = 0; j < self.particulars.length; j++){
            self.particulars[j]["rowNum"] = j + 1;
            self.particulars[j].unitPrice = format(parseFloat(self.particulars[j].unitPrice).toFixed(2));
            self.particulars[j].particularAmount = format(parseFloat(self.particulars[j].particularAmount).toFixed(2));
          }
          setTimeout(function() {
            self.loading = false;
          }, 1500);
        });
      },
      // Save new check particulars
      addParticular(){
        let self = this;

        self.$v.newParticular.$touch();
        self.$v.newReferenceNumber.$touch();
        self.$v.newUnitPrice.$touch();
        self.$v.newQuantity.$touch();
        self.$v.newAmount.$touch();
        if(!self.$v.newParticular.$error && !self.$v.newReferenceNumber.$error && !self.$v.newUnitPrice.$error && !self.newQuantity.$error && !self.$v.newAmount.$error){
          let pID = 'BCPI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);
          let getUserId = dbUsers.collection('users').where("username", '==', localStorage.getItem('aisname'));
          let checkData = db.collection("bankChecks").where("bankCheckUid","==",self.editCheck.checkId);
          let particularsData = db.collection("bankCheckParticulars").where("bankCheckReference", "==", self.editCheck.checkId);
          let users = [], bankCid = "", pars = [], total = 0;

          self.requestProcessing = true;
          getUserId.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              users.push(doc.data());
            });
            let particularName = '';

            for(let a = 0; a < self.allParticulars.length; a++){
              if(self.allParticulars[a].particularId == self.newParticular){
                particularName = self.allParticulars[a].particular;
              }
            }
            db.collection("bankCheckParticulars").doc()
            .set({
              bankCheckParticularsUid: pID,
              particularReference: self.newParticular,
              particular: particularName,
              description: self.newDescription,
              referenceNumber: self.newReferenceNumber,
              unitPrice: self.newUnitPrice,
              particularAmount: self.newAmount,
              quantity: self.newQuantity,
              bankCheckReference: self.editCheck.checkId,
              userReference: users[0].userId,
              status: 1,
              dateCreated: today,
              dateModified: today,
              createdBy: users[0].username
            }).then(() => {
              checkData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  bankCid = doc.id;
                });
                particularsData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    pars.push(doc.data());
                  });
                  for(let a = 0; a < pars.length; a++){
                    total += parseFloat(pars[a].particularAmount);
                  }
                  db.collection("bankChecks").doc(bankCid)
                  .update({
                    bankCheckAmount: total.toString(),
                    dateModified: today
                  }).then(() => {
                    self.newParticular = "";
                    self.newReferenceNumber = "";
                    self.newUnitPrice = "";
                    self.newQuantity = "";
                    self.newAmount = "";
                    self.$v.newParticular.$reset();
                    self.$v.newReferenceNumber.$reset();
                    self.$v.newUnitPrice.$reset();
                    self.$v.newQuantity.$reset();
                    self.$v.newAmount.$reset();
                    self.$bvModal.hide("add-particular-modal");
                    self.requestProcessing = false;
                    self.getParticulars(self.editCheck.checkId);
                    self.getPaginatedBankChecks(self.pageNum, "", self.listType);
                    self.$swal({
                      title: 'Success',
                      text: 'New Particular added successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  });
                });
              });
            });
          });
        }
      },
      // Show edit check particular form
      openEditParticularModal(row){
        this.edit = {
          checkId: row.bankCheckReference, 
          payee: this.edit.payee, 
          desc: this.edit.desc, 
          checkDate: this.edit.checkDate,
          particularId: row.bankCheckParticularsUid,
          particularReference: row.particularReference || '',
          particular: row.particular,
          description: row.description || '',
          referenceNumber: row.referenceNumber,
          unitPrice: row.unitPrice.replaceAll(',', ''),
          quantity: row.quantity,
          amount: row.particularAmount.replaceAll(',', '')
        }
        this.$bvModal.show('update-particular-modal');
      },
      // Compute check amount
      computeAmount(price, quantity, type){
        price  = price.replaceAll('₱ ', '');
        price  = price.replaceAll(',', '');
        if(type == 'add'){
          this.newAmount = parseFloat(price * quantity).toFixed(2);
        }else if(type == 'edit'){
          this.edit.amount = parseFloat(price * quantity).toFixed(2);
        }
      },
      // Change check particular details
      updateParticular(){
        let self = this;

        try{
          self.requestProcessing = true;
          let particularData = db.collection("bankCheckParticulars")
            .where("bankCheckParticularsUid", "==", self.edit.particularId);
          let checkData = db.collection("bankChecks")
            .where("bankCheckUid","==",self.editCheck.checkId);
          let particularsData = db.collection("bankCheckParticulars")
            .where("bankCheckReference", "==", self.editCheck.checkId);
          let id = '', bankCid = "", pars = [], total = 0;

          particularData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              id = doc.id;
            });
            let particularName = '';

            for(let a = 0; a < self.allParticulars.length; a++){
              if(self.allParticulars[a].particularId == self.edit.particularReference){
                particularName = self.allParticulars[a].particular;
              }
            }
            db.collection("bankCheckParticulars")
            .doc(id)
            .update({
              particularReference: self.edit.particularReference,
              particular: particularName,
              description: self.edit.description,
              referenceNumber: self.edit.referenceNumber,
              unitPrice: self.edit.unitPrice,
              quantity: self.edit.quantity,
              particularAmount: self.edit.amount,
              dateModified: today
            }).then(() => {
              checkData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  bankCid = doc.id;
                });
                particularsData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    pars.push(doc.data());
                  });
                  for(let a = 0; a < pars.length; a++){
                    total += parseFloat(pars[a].particularAmount);
                  }
                  db.collection("bankChecks")
                  .doc(bankCid)
                  .update({
                    bankCheckAmount: total.toString(),
                    dateModified: today
                  }).then(() => {
                    self.requestProcessing = false;
                    self.getParticulars(self.editCheck.checkId);
                    self.getPaginatedBankChecks(self.pageNum, "", self.listType);
                    self.$bvModal.hide('update-particular-modal');
                    self.$swal({
                      title: 'Success',
                      text: 'Particular updated successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  });
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
      },
      // Delete check particular
      removeParticular(row){
        this.$swal({
          title: 'Are you sure?',
          text: "You want to remove this Particular",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#f5c71a',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            let self = this;
            self.requestProcessing = true;
            try{
              let particularData = db.collection("bankCheckParticulars")
                .where("bankCheckParticularsUid","==",row.bankCheckParticularsUid);
              let particularsData = db.collection("bankCheckParticulars")
                .where("bankCheckReference","==",row.bankCheckReference);
              let checkData = db.collection("bankChecks")
                .where("bankCheckUid","==",row.bankCheckReference);
              let pars = [], id = '', bankCid = '', total = 0;

              particularData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  id = doc.id;
                });
                db.collection("bankCheckParticulars")
                .doc(id)
                .delete()
                .then(() => {
                  checkData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      bankCid = doc.id;
                    });
                    particularsData.get().then((querySnapshot) => {
                      querySnapshot.forEach((doc) => {
                        pars.push(doc.data());
                      });
                      for(let a = 0; a < pars.length; a++){
                        total += parseFloat(pars[a].particularAmount);
                      }
                      db.collection("bankChecks")
                      .doc(bankCid)
                      .update({
                        bankCheckAmount: total.toString(),
                        dateModified: today
                      }).then(() => {
                        self.$swal({
                          title: 'Success',
                          text: 'Particular remove successfully!',
                          icon: 'success',
                          confirmButtonColor: '#b80000',
                          confirmButtonText: 'OK'
                        });
                        self.getParticulars(self.editCheck.checkId);
                        self.getPaginatedBankChecks(self.pageNum, "", self.listType);
                      });
                    });
                  });
                });
              });
            }catch(error){
              console.log(error);
              self.$swal({
                title: 'Error',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              });
            }
            self.requestProcessing = false;
          }
        });
      },
      // Change check status to cancel
      cancelCheck(row){
        this.$swal({
          title: 'Are you sure?',
          text: "You want to cancel this Check Number",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#f5c71a',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            let self = this, id = '';
            let getId = db.collection("bankChecks")
              .where("bankCheckUid", "==", row.bankCheckUid);

            getId.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                id = doc.id;
              });
              db.collection("bankChecks")
              .doc(id)
              .update({
                status: 0,
                dateModified: today
              }).then(() => {
                let checkData = db.collection("bankCheckSeriesReports")
                  .where("checkSeriesReference","==",row.bankCheckSeriesReference)
                  .where("checkNumber","==", row.bankCheckNumber);
                let checkId = '';

                checkData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    checkId = doc.id;
                  });
                  db.collection("bankCheckSeriesReports")
                  .doc(checkId)
                  .update({
                    status: "cancelled",
                    dateModified: today
                  });
                }).then(() => {
                  self.$refs['check-table'].reset();
                  self.getPaginatedBankChecks(self.pageNum, "", self.listType);
                });
                self.$swal({
                  title: "Success",
                  text: "Check cancelled",
                  icon: "success",
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              }).catch((error) => {
                console.log(error);
                self.$swal({
                  title: 'Error',
                  text: 'Something went wrong. Please try again.',
                  icon: 'error',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              });
            });
          }
        });
      },
      // Enable or disable printing of check
      checkPrinted(row, stat){
        let msg = 'disable';
        let statMsg = 'disabled';

        if(stat == 3){
          msg = 'enable';
          statMsg = "enabled";
        }
        this.$swal({
          title: 'Are you sure?',
          text: "You want to  " + msg + " the check print",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#f5c71a',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            let self = this;
            let checkData = db.collection("bankChecks")
              .where("bankCheckUid", "==",row.bankCheckUid);
            let id = '';

            checkData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                id = doc.id;
              });
              db.collection("bankChecks").doc(id)
              .update({
                status: stat,
                dateModified: today
              }).then(() => {
                self.$refs['check-table'].reset();
                self.$swal({
                  title: "Success",
                  text: "Check print " + statMsg,
                  icon: "success",
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
                self.getPaginatedBankChecks(self.pageNum, "", self.listType);
              }).catch((error) => {
                console.log(error);
                self.$swal({
                  title: 'Error',
                  text: 'Something went wrong. Please try again.',
                  icon: 'error',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              });
            });
          }
        });
      },
      // Change check status to used
      checkUsedStatus(row, stat){
        this.$swal({
          title: 'Are you sure?',
          text: "You want to back this Check Number to USED status",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#f5c71a',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            let self = this, id = '';
            let getId = db.collection("bankChecks")
              .where("bankCheckUid", "==", row.bankCheckUid);

            getId.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                id = doc.id;
              });
              db.collection("bankChecks")
              .doc(id)
              .update({
                status: stat,
                dateModified: today
              }).then(() => {
                let checkData = db.collection("bankCheckSeriesReports")
                  .where("checkSeriesReference","==",row.bankCheckSeriesReference)
                  .where("checkNumber","==", row.bankCheckNumber);
                let checkId = '';

                checkData.get().then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    checkId = doc.id;
                  });
                  db.collection("bankCheckSeriesReports")
                  .doc(checkId)
                  .update({
                    status: "used",
                    dateModified: today
                  });
                }).then(() => {
                  self.$refs['check-table'].reset();
                  self.getPaginatedBankChecks(self.pageNum, "", self.listType);
                });
                self.$swal({
                  title: "Success",
                  text: "Check status changed to used",
                  icon: "success",
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              }).catch((error) => {
                console.log(error);
                self.$swal({
                  title: 'Error',
                  text: 'Something went wrong. Please try again.',
                  icon: 'error',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              });
            });
          }
        });
      }
    }
  };
</script>