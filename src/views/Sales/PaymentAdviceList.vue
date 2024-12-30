<template>
  <card><!-- Bank check status links -->
    <div class="row">
      <span class="col-sm-6 pl-0"></span>
      <span class="col-2 pt-3 pl-5 text-right">
        <b>Filter by Month:</b>
      </span>
      <span class="col-sm-2 pl-0">
        <base-input class="pt-2"
          type="month"
          :max="maxDate"
          min="1997-01"
          v-model="paymentAdviceDate"
          @input="reloadData()"
          style="width: 200px;"
          id="inputStyle"></base-input>
      </span>
    </div>
    <div class="table-full-width">
      <vue-good-table :columns="columns"
        :rows="paymentAdvices"
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
          <b><span v-if="props.column.field == 'crNumber'">
            <span>{{props.row.crNumber}}</span>
          </span>
          <span v-if="props.column.field == 'paymentAmount'">
            <span>₱ {{props.row.paymentAmount}}</span>
          </span>
          <span v-if="props.column.field == 'paymentAdviceDate'">
            <span classs="tableSpan">{{props.row.paymentAdviceDate | moment("MMM DD, YYYY")}}</span>
          </span>
          <span v-if="props.column.field == 'distributor'">
            <span v-for="distri in distributors"
              v-bind:key="distri.distributorId" >
              <span v-if="distri.distributorId == props.row.distributorReference">{{distri.distributorName}}</span>
            </span>
          </span>
          <span v-if="props.column.field == 'action'">
            <span class="pointer ml-2 far fa-edit"
              id="sideBarTxt"
              v-on:click="openUpdatePaymentModal(props.row)"
              title="Update"></span>
            <router-link :to='"/sales/payment/advice/print/" + props.row.paymentAdviceId'>
              <span class="pointer ml-2 fa fa-print"
                id="sideBarTxt"
                title="View Print Page"></span>
            </router-link>
          </span></b>
        </template>
      </vue-good-table>
    </div>
    <hr>
    <div class="row pl-4"
      v-if="!loading && paymentAdvices.length">
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
          @input="getPaginatedPaymentAdvice(1, '')"></v-select>
      </span>
    </div>
    <!-- UPDATE PAYMENT ADVICE MODAL -->
    <b-modal size="xl"
      id="update-payment-advice-modal"
      title="Update Payment Advice" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Distributors:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Date:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <v-select id="inputStyle"
            :options="distributors"
            :reduce="distri => distri.distributorId"
            label="distributorName"
            v-model="edit.distributor"
            :clearable="false"></v-select>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.distributor.required">Field Required</i>
        </div>
        <div class=" col-sm-6 pl-5 pr-5">
          <base-input v-model="edit.date"
            id="inputStyle"
            type="date"
            placeholder="Date"
            class="mb-0"></base-input>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.date.required">Field Required</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>CR Number:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Check Number:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class=" col-sm-6 pl-5 pr-5">
          <base-input v-model="edit.crNumber"
            id="inputStyle"
            type="text"
            placeholder="CR Number"
            class="mb-0"></base-input>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.crNumber.required">Field Required</i>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.crNumber.alphaNumCustomValidator">Invalid Characters</i>
        </div>
        <div class=" col-sm-4 pl-5">
          <base-input v-model="edit.checkNumber"
            id="inputStyle"
            type="text"
            placeholder="Check Number"
            class="mb-0"
            @input="clearCheck"></base-input>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.checkNumber.required">Field Required</i>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.checkNumber.numCustomValidator">Invalid Characters</i>
        </div>
        <div class=" col-sm-2 pr-5">
          <base-button block id="darkBtn"
            v-b-modal.change-check-number-modal
            :disabled="requestProcessing">
            <i v-if="requestProcessing"
              class="fa fa-spinner fa-spin"></i>
            Choose
          </base-button>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Payment Amount:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class=" col-sm-6 pl-5 pr-5">
          <base-input v-model="edit.paymentAmount"
            id="inputStyle"
            type="text"
            placeholder="Payment Amount"
            class="mb-0" readonly></base-input>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.paymentAmount.required">Field Required</i>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.paymentAmount.amountCustomValidator">Invalid Characters</i>
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
              <td>{{row.poReference}}</td>
              <td>{{row.invoiceReference}}</td>
              <td>{{row.invoiceDate | moment('MMM DD, YYYY')}}</td>
              <td>₱ {{row.invoiceAmount}}</td>
              <td>{{row.wht}}</td>
              <td>₱ {{row.amountPaid}}</td>
              <td align="right">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openEditParticularModal(row)"
                  v-if="row.rowNum != ''"
                  title="Edit"></span>
                <span class="pointer ml-2 far fa-times-circle"
                  id="sideBarTxt"
                  v-on:click="removeParticular(row)"
                  v-if="row.rowNum != ''"
                  title="Remove"></span>
              </td>
            </template>
          </paper-table>
        </div>
        <div class="text-right pr-5">
          <base-button id="darkBtn"
            @click.native="$bvModal.show('add-particular-modal')"
            :disabled="requestProcessing">
            <i v-if="requestProcessing"
              class="fa fa-spinner fa-spin"></i>
            Add Particular
          </base-button>
          <base-button id="darkBtn"
            @click.native="updatePaymentAdvice"
            :disabled="requestProcessing">
            <i v-if="requestProcessing"
              class="fa fa-spinner fa-spin"></i>
            Update
          </base-button>
          <base-button id="darkInlineBtn"
            @click.native="$bvModal.hide('update-payment-advice-modal')"
            :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
    <!-- CHOOSE CHECK NUMBER MODAL -->
    <b-modal size="lg"
      id="change-check-number-modal"
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
              @click.native="changeCheckNumber"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              OK
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('change-check-number-modal')"
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
          <b>PO Number:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Invoice Number:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newPONumber"
            id="inputStyle"
            type="text"
            placeholder="PO Number"></base-input>
          <i class="text-red"
            v-if="$v.newPONumber.$anyDirty && !$v.newPONumber.required">Field Required</i>
          <i class="text-red"
            v-if="$v.newPONumber.$anyDirty && !$v.newPONumber.alphaNumCustomValidator">Invalid Characters</i>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="newInvoiceNumber"
            id="inputStyle"
            type="text"
            placeholder="Invoice Number"></base-input>
          <i class="text-red"
            v-if="$v.newInvoiceNumber.$anyDirty && !$v.newInvoiceNumber.required">Field Required</i>
          <i class="text-red"
            v-if="$v.newInvoiceNumber.$anyDirty && !$v.newInvoiceNumber.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Invoice Date:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Invoice Amount:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5 pb-0">
          <base-input v-model="newInvoiceDate"
            type="date"
            id="inputStyle"
            placeholder="Invoice Date"></base-input>
          <i class="text-red"
            v-if="$v.newInvoiceDate.$anyDirty && !$v.newInvoiceDate.required">Field Required</i>
        </div>
        <div class="col-sm-6 pl-5 pr-5 pb-0">
          <base-input v-model="newInvoiceAmount"
            type="text"
            id="inputStyle"
            placeholder="Invoice Amount"></base-input>
          <i class="text-red"
            v-if="$v.newInvoiceAmount.$anyDirty && !$v.newInvoiceAmount.required">Field Required</i>
          <i class="text-red"
            v-if="$v.newInvoiceAmount.$anyDirty && !$v.newInvoiceAmount.amountCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Withholding Tax:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5 pb-0">
          <v-select id="inputStyle"
            :options="wths"
            :reduce="wth => wth.withholdingTaxCodeId"
            label="withholdingTaxCode"
            v-model="newWTH"
            :clearable="false"></v-select>
          <i class="text-red"
            v-if="$v.newWTH.$anyDirty && !$v.newWTH.required">Field Required</i>
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
          <b>PO Number:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Invoice Number:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="editParticular.poNumber"
            id="inputStyle"
            type="text"
            placeholder="PO Number"></base-input>
          <i class="text-red"
            v-if="$v.editParticular.$anyDirty && !$v.editParticular.poNumber.required">Field Required</i>
          <i class="text-red"
            v-if="$v.editParticular.$anyDirty && !$v.editParticular.poNumber.alphaNumCustomValidator">Invalid Characters</i>
        </div>
        <div class="col-sm-6 pl-5 pr-5">
          <base-input v-model="editParticular.invoiceNumber"
            id="inputStyle"
            type="text"
            placeholder="Invoice Number"></base-input>
          <i class="text-red"
            v-if="$v.editParticular.$anyDirty && !$v.editParticular.invoiceNumber.required">Field Required</i>
          <i class="text-red"
            v-if="$v.editParticular.$anyDirty && !$v.editParticular.invoiceNumber.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Invoice Date:</b>
          <b class="text-red">*</b>
        </label>
        <label class="col-sm-6 col-form-label">
          <b>Invoice Amount:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5 pb-0">
          <base-input v-model="editParticular.invoiceDate"
            type="date"
            id="inputStyle"
            placeholder="Invoice Date"></base-input>
          <i class="text-red"
            v-if="$v.editParticular.$anyDirty && !$v.editParticular.invoiceDate.required">Field Required</i>
        </div>
        <div class="col-sm-6 pl-5 pr-5 pb-0">
          <base-input v-model="editParticular.invoiceAmount"
            type="text"
            id="inputStyle"
            placeholder="Invoice Amount"></base-input>
          <i class="text-red"
            v-if="$v.editParticular.$anyDirty && !$v.editParticular.invoiceAmount.required">Field Required</i>
          <i class="text-red"
            v-if="$v.editParticular.$anyDirty && !$v.editParticular.invoiceAmount.amountCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-sm-6 col-form-label">
          <b>Withholding Tax:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-6 pl-5 pr-5 pb-0">
          <v-select id="inputStyle"
            :options="wths"
            :reduce="wth => wth.withholdingTaxCodeId"
            label="withholdingTaxCode"
            v-model="editParticular.wht"
            :clearable="false"></v-select>
          <i class="text-red"
            v-if="$v.editParticular.$anyDirty && !$v.editParticular.wht.required">Field Required</i>
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
  </card>
</template>
<script>
  import {dbSales, dbMains, dbUsers, db} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";

  const tableColumns = ["#", "CR No.", "Amount", "Date", "Distributor", "Actions"];
  const moment  = require('moment');
  const commaNumber = require('comma-number');
  const format = commaNumber.bindWith(',', '.');
  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -./, A-Za-z0-9 ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const amountCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9₱ ,. ]*$/);
  const particularColumns = ["#", "PO Number", "Invoice No.", "Invoice Date", "Invoice Amount", "WHT", "Amount Paid",  "Actions"];
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    name: 'payment-advice-list',
    components: {},
     data() {
      return {
        columns: [{
            label: 'CR No',
            field: 'crNumber'
          },{
            label: 'Amount',
            field: 'paymentAmount'
          },{
            label: "Date",
            field: 'paymentAdviceDate'
          },{
            label: "Distributor",
            field: 'distributor'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
          }
        ],
        loading: true,
        loadError: false,
        paymentAdviceTable: {
          title: "Payment Advice Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        paymentAdviceCount: 0,
        paymentAdvices: [],
        distributors: [],
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
        paymentAdviceDate: moment().format('YYYY-MM'),
        maxDate: moment().format('YYYY-MM'),
        pageNum: 1,
        edit: {
          id: '',
          paymentAdviceId: '',
          distributor: '',
          date: '',
          crNumber: '',
          checkNumber: '',
          checkReference: '',
          paymentAmount: ''
        },
        particularsTable: {
          title: "Particulars Table",
          subTitle: "",
          columns: [...particularColumns]
        },
        particulars: [],
        banks: [],
        bank: '',
        bankAccounts: [],
        bankAccount: '',
        checkSeries: [],
        series: '',
        checkNumbers: [],
        checkNumber: '',
        newPONumber: '',
        newInvoiceNumber: '',
        newInvoiceDate: moment().format("YYYY-MM-DD"),
        newInvoiceAmount: '',
        newWTH: '',
        wths: [],
        editParticular: {
          id: '',
          particularId: '',
          poNumber: '',
          invoiceNumber: '',
          invoiceDate: moment().format("YYYY-MM-DD"),
          invoiceAmount: '',
          wht: ''
        }
      };
    },
    validations: {
      edit: {
        distributor: {required},
        date: {required},
        crNumber: {required, alphaNumCustomValidator},
        checkNumber: {required, numCustomValidator},
        paymentAmount: {required, amountCustomValidator}
      },
      bank: {required},
      bankAccount: {required},
      series: {required},
      checkNumber: {required},
      newPONumber: {
        required,
        alphaNumCustomValidator
      },
      newInvoiceNumber: {
        required,
        alphaNumCustomValidator
      },
      newInvoiceDate: {required},
      newInvoiceAmount: {
        required,
        amountCustomValidator
      },
      newWTH: {required},
      editParticular: {
        poNumber: {
          required,
          alphaNumCustomValidator
        },
        invoiceNumber: {
          required,
          alphaNumCustomValidator
        },
        invoiceDate: {required},
        invoiceAmount: {
          required,
          amountCustomValidator
        },
        wht: {required}
      }
    },
    async mounted(){
      this.getPaginatedPaymentAdvice(1, "");
      this.getDistributors();
      this.getUserRole();
      this.getBanks();
      this.getWTH();
    },
    methods: {
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
      getPaginatedPaymentAdvice(page, searchTerm) {
        let self = this, paymentAdviceData = null, ids = [], payments = [];
        let start = moment(self.paymentAdviceDate).startOf('month').format('YYYY-MM-DD');
        let end = moment(self.paymentAdviceDate).endOf('month').format('YYYY-MM-DD');

        self.loading = true;
        self.loadError = false;
        self.paymentAdvices = [];
        self.pageNum = page;
        if(searchTerm) {
          self.searching = true;
        }
        if(searchTerm){
          searchTerm = searchTerm.toString();
          if(self.limit != "all"){
            paymentAdviceData = dbSales.collection("paymentAdvice")
              .where("crNumber", "==", searchTerm.toString())
              .orderBy("paymentAdviceDate", "desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            paymentAdviceData = dbSales.collection("paymentAdvice")
              .where("bankCheckNumber", "==", searchTerm.toString())
              .orderBy("paymentAdviceDate", "desc");
          }
        }else{
          if(self.limit != "all"){
            paymentAdviceData = dbSales.collection("paymentAdvice")
              .where("paymentAdviceDate", ">=", start)
              .where("paymentAdviceDate", "<=", end)
              .orderBy("paymentAdviceDate","desc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            paymentAdviceData = dbSales.collection("paymentAdvice")
              .where("paymentAdviceDate", ">=", start)
              .where("paymentAdviceDate", "<=", end)
              .orderBy("dateCreated","desc");
          }
        }
        paymentAdviceData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              payments.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < payments.length; i++){
              payments[i]["rowNum"] = 1 + i;
              payments[i]["id"] = ids[i];
              payments[i].paymentAmount = format(parseFloat(payments[i].paymentAmount).toFixed(2));
            }
            let firstRow = (page - 1) * 10;
            let lastRow = (page * 10);

            for(let k = firstRow; k < lastRow; k++){
              if(payments[k]){
                self.paymentAdvices.push(payments[k]);
              }
            }
            self.paymentAdviceCount = payments.length;
            self.currentPage = page;
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      onPageChange (page) {
        let searchTerm = this.searchTerm;

        this.getPaginatedPaymentAdvice(page, searchTerm);
      },
      resetData() {
        this.searching = false;
          if(this.searchTerm == "") {
            this.getPaginatedPaymentAdvice(1, "");
        }
      },
      reloadData() {
        this.searchTerm = "";
        this.searching = false;
        this.getPaginatedPaymentAdvice(1, "");
      },
      search() {
        let searchTerm = this.searchTerm;

        if(searchTerm) {
          this.getPaginatedPaymentAdvice(1, searchTerm);
        }
      },
      getDistributors(){
        let self = this;
        let distriData = dbMains.collection("distributors")
          .orderBy("distributorName", "asc");

        self.distributors = [];
        distriData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.distributors.push(doc.data());
          });
        });
      },
      openUpdatePaymentModal(row){
        let self = this;

        self.edit = {
          id: row.id,
          paymentAdviceId: row.paymentAdviceId,
          distributor: row.distributorReference,
          date: row.paymentAdviceDate,
          crNumber: row.crNumber,
          checkNumber: row.checkNumber,
          paymentAmount: row.paymentAmount,
          checkReference: row.checkReference
        }
        self.getParticulars(row.paymentAdviceId);
        self.$bvModal.show("update-payment-advice-modal");
      },
      getParticulars(id){
        let self = this, ids = [];
        let particularData = dbSales.collection("paymentAdviceParticulars")
          .where("paymentAdviceReference", "==", id);

        self.particulars = [];
        particularData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.particulars.push(doc.data());
            ids.push(doc.id);
          });
          self.loading = true;
          self.loadError = false;
          for(let j = 0; j < self.particulars.length; j++){
            let wht = 0, whtAmount = 0, amountPaid = 0;
            let whtData = dbMains.collection("withholdingTaxCode")
              .where("withholdingTaxCodeId","==",self.particulars[j].whtReference);

            whtData.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                wht = doc.data().withholdingTaxRate;
              });
              self.particulars[j].invoiceAmount = self.particulars[j].invoiceAmount.replaceAll(",","");
              whtAmount = (parseFloat(self.particulars[j].invoiceAmount) / 1.12) * parseFloat(wht);
              amountPaid = parseFloat(self.particulars[j].invoiceAmount) - parseFloat(whtAmount);
              self.particulars[j]["rowNum"] = j + 1;
               self.particulars[j]["id"] = ids[j];
              self.particulars[j].invoiceAmount = format(parseFloat(self.particulars[j].invoiceAmount).toFixed(2));
              self.particulars[j]["wht"] = format(parseFloat(whtAmount).toFixed(2));
              self.particulars[j]["amountPaid"] = format(parseFloat(amountPaid).toFixed(2));
            });
          }
          setTimeout(function() {
            self.loading = false;
          }, 1500);
        });
      },
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
      changeCheckNumber(){
        let self = this;

        self.edit.checkNumber = self.checkNumber;
        for(let a = 0; a < self.checkNumbers.length; a++){
          if(self.checkNumber == self.checkNumbers[a].checkNumber){
            self.edit.checkReference = self.checkNumbers[a].checkReference;
          }
        }
        self.$bvModal.hide('change-check-number-modal');
      },
      clearCheck(){
        this.edit.checkReference = '';
      },
      getWTH(){
        let self = this;
        let wthData = dbMains.collection("withholdingTaxCode")
          .orderBy("withholdingTaxCode","asc");

        self.wths = [];
        wthData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.wths.push(doc.data());
          });
          self.newWTH = self.wths[0].withholdingTaxCodeId;
        });
      },
      addParticular(){
        let self = this, amount = 0, compute = 0;

        self.requestProcessing = false;
        self.$v.newPONumber.$touch();
        self.$v.newInvoiceNumber.$touch();
        self.$v.newInvoiceDate.$touch();
        self.$v.newInvoiceAmount.$touch();
        self.$v.newWTH.$touch();
        if(!self.$v.newPONumber.$error && !self.$v.newInvoiceNumber.$error && !self.$v.newInvoiceDate.$error && !self.$v.newInvoiceAmount.$error && !self.$v.newWTH.$error){
          try{
            self.requestProcessing = true;
            let pID = 'PAPI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

            dbSales.collection("paymentAdviceParticulars").doc()
            .set({
              paymentAdviceParticularId: pID,
              invoiceDate: moment(self.newInvoiceDate).format('YYYY-MM-DD'),
              invoiceAmount: self.newInvoiceAmount,
              poReference: self.newPONumber,
              invoiceReference: self.newInvoiceNumber,
              whtReference: self.newWTH,
              paymentAdviceReference: self.edit.paymentAdviceId,
              dateCreated: today,
              dateModified: today
            }).then(() => {
              self.newPONumber = '';
              self.newInvoiceNumber = '';
              self.newInvoiceDate = moment().format("YYYY-MM-DD");
              self.newInvoiceAmount = '';
              self.newWTH = '';
              self.$v.newPONumber.$reset();
              self.$v.newInvoiceNumber.$reset();
              self.$v.newInvoiceDate.$reset();
              self.$v.newInvoiceAmount.$reset();
              self.$v.newWTH.$reset();
              self.getWTH();
              self.getParticulars(self.edit.paymentAdviceId);
              self.$swal({
                title: 'Success',
                text: 'New Particular added successfully!',
                icon: 'success',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              }).then(() => {
                for(let a = 0; a < self.particulars.length; a++){
                  amount = self.particulars[a].amountPaid.replaceAll(",","");
                  compute += parseFloat(amount.replaceAll(",",""));
                }
                dbSales.collection("paymentAdvice")
                .doc(self.edit.id)
                .update({
                  paymentAmount: parseFloat(compute).toFixed(2),
                  dateModified: today
                }).then(() => {
                  self.edit.paymentAmount = format(parseFloat(compute).toFixed(2));
                  self.requestProcessing = false;
                  self.$bvModal.hide("add-particular-modal");
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
      updatePaymentAdvice(){
        let self = this;

        self.$v.edit.$touch();
        self.requestProcessing = false;
        if(!self.$v.edit.$error){
          try{
            self.requestProcessing = true;
            let paymentAdviceData = dbSales.collection("paymentAdvice")
              .where("paymentAdviceId","!=",self.edit.paymentAdviceId)
              .where("crNumber","==",self.edit.crNumber);

            paymentAdviceData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    self.$swal({
                      title: 'Invalid',
                      text: 'CR Number already exists.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                    self.requestProcessing = false;
                  }
                });
              }else if(querySnapshot){
                dbSales.collection("paymentAdvice")
                .doc(self.edit.id)
                .update({
                  paymentAdviceDate: self.edit.date,
                  crNumber: self.edit.crNumber,
                  checkNumber: self.edit.checkNumber,
                  checkReference: self.edit.checkReference,
                  distributorReference: self.edit.distributor,
                  dateModified: today
                }).then(() => {
                  self.$v.edit.$reset();
                  self.$swal({
                    title: 'Success',
                    text: 'Payment advice update successfully!',
                    icon: 'success',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    self.requestProcessing = false;
                    self.$bvModal.hide("update-payment-advice-modal");
                    self.getPaginatedPaymentAdvice(1,"");
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
      openEditParticularModal(row){
        let self = this;

        self.editParticular = {
          id: row.id,
          particularId: row.paymentAdviceParticularId,
          poNumber: row.poReference,
          invoiceNumber: row.invoiceReference,
          invoiceDate: row.invoiceDate,
          invoiceAmount: row.invoiceAmount,
          wht: row.whtReference
        }
        self.$bvModal.show("edit-particular-modal");
      },
      updateParticular(){
        let self = this, amount = 0, compute = 0;

        self.requestProcessing = false;
        self.$v.editParticular.$touch();
        if(!self.$v.editParticular.$error){
          self.requestProcessing = true;
          try{
            dbSales.collection("paymentAdviceParticulars")
            .doc(self.editParticular.id)
            .update({
              poReference: self.editParticular.poNumber,
              invoiceReference: self.editParticular.invoiceNumber,
              invoiceDate: self.editParticular.invoiceDate,
              invoiceAmount: self.editParticular.invoiceAmount,
              whtReference: self.editParticular.wht,
              dateModified: today
            }).then(() => {
              self.$v.editParticular.$reset();
              self.getWTH();
              self.getParticulars(self.edit.paymentAdviceId);
              self.$swal({
                title: 'Success',
                text: 'Particular update successfully!',
                icon: 'success',
                confirmButtonColor: '#b80000',
                confirmButtonText: 'OK'
              }).then(() => {
                for(let a = 0; a < self.particulars.length; a++){
                    amount = self.particulars[a].amountPaid.replaceAll(",","");
                    compute += parseFloat(amount.replaceAll(",",""));
                  }
                  dbSales.collection("paymentAdvice")
                  .doc(self.edit.id)
                  .update({
                    paymentAmount: parseFloat(compute).toFixed(2),
                    dateModified: today
                  }).then(() => {
                    self.edit.paymentAmount = format(parseFloat(compute).toFixed(2));
                    self.requestProcessing = false;
                    self.$bvModal.hide("edit-particular-modal");
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
      removeParticular(row){
        let self = this, amount = 0, compute = 0;

        this.$swal({
          title: 'Are you sure?',
          text: "You want to remove this Particular",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#C72111',
          confirmButtonText: 'CONFIRM' ,
        }).then((result) => {
          if(result.value){
            self.requestProcessing = true;
            try{
              dbSales.collection("paymentAdviceParticulars")
              .doc(row.id)
              .delete().then(() => {
                self.getWTH();
                self.getParticulars(self.edit.paymentAdviceId);
                self.$swal({
                  title: 'Success',
                  text: 'Remove update successfully!',
                  icon: 'success',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  for(let a = 0; a < self.particulars.length; a++){
                    amount = self.particulars[a].amountPaid.replaceAll(",","");
                    compute += parseFloat(amount.replaceAll(",",""));
                  }
                  dbSales.collection("paymentAdvice")
                  .doc(self.edit.id)
                  .update({
                    paymentAmount: parseFloat(compute).toFixed(2),
                    dateModified: today
                  }).then(() => {
                    self.edit.paymentAmount = format(parseFloat(compute).toFixed(2));
                    self.requestProcessing = false;
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
    }
  };
</script>