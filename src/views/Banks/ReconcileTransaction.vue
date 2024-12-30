<template>
  <div id="textStyle"> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
        <tabs fill class="flex-column flex-md-row">
          <!-- Reconcile transaction tab -->
          <tab-pane title="Reconcile Transaction">
            <card>
              <div class="card-header bg-transparent pb-2">
                <!-- Select bank and account number -->
                <div class="row pt-2 mb-1">
                  <span class="col-sm-6">
                    <b>Choose Bank:</b>
                  </span>
                  <span class="col-sm-6">
                    <b>Account Number:</b>
                  </span>
                </div>
                <div class="row mb-2">
                  <span class="col-sm-6 pl-5 pr-5">
                    <v-select id="inputStyle"
                      :options="activateBanks"
                      :reduce="activateBank => activateBank.bankUid"
                      label="bank"
                      v-model="bank"
                      :clearable="false"
                      @input="getActivateBankAccounts(bank)"></v-select>
                    <i class="text-red"
                      v-if="$v.bank.$anyDirty && !$v.bank.required">Field Required</i>
                  </span>
                  <div class="col-sm-6 pl-5 pr-5"
                    v-if="activateBankAccounts == ''">
                    <span class="text-red">No Bank Account</span>
                  </div>
                  <div class="col-sm-6 pl-5 pr-5" v-else>
                    <v-select id="inputStyle"
                      :options="activateBankAccounts"
                      :reduce="activateBankAccount => activateBankAccount.bankAccountUid"
                      label="bankAccountNumber"
                      v-model="bankAccount"
                      :clearable="false"
                      @input="getBankRecon(1, '')"></v-select>
                    <i class="text-danger"
                      v-if="$v.bankAccount.$anyDirty && !$v.bankAccount.required">Field Required</i>
                  </div>
                </div>
                <!-- Display bank account balance -->
                <div class="row mb-1">
                  <span class="col-sm-6">
                    <b>Account Balance: </b>
                  </span>
                </div>
                <div class="row mb-1">
                  <span class="col-sm-6 pl-5 pr-5">₱ {{bankAccountBalance}}</span>
                </div>
                <hr>
                <!-- Filter records -->
                <div class="row pt-2 mb-1">
                  <span class="col-sm-6">
                    <b>Filter by:</b>
                  </span>
                  <span class="col-sm-3"
                    v-if="filter == 'checkDate'">
                    <b>Start Date:</b>
                  </span>
                  <span class="col-sm-3"
                    v-if="filter == 'checkDate'">
                    <b>End Date:</b>
                  </span>
                </div>
                <div class="row mb-0 pt-2">
                  <span class="col-sm-3 pl-5 pr-5">
                    <v-select id="inputStyle"
                      :options="status"
                      :reduce="stat => stat.statusId"
                      label="status"
                      v-model="stat"
                      :clearable="false"
                      style="width: 220px;"
                      @input="getBankRecon(1, '')"></v-select>
                  </span>
                  <span class="col-sm-3 pl-5 pr-5">
                    <v-select id="inputStyle"
                      :options="filters"
                      :reduce="filter => filter.filterId"
                      label="filter"
                      v-model="filter"
                      :clearable="false"
                      style="width: 150px;"
                      @input="getBankRecon(1, '')"></v-select>
                  </span>
                  <span class="col-sm-3 pl-5 pr-5"
                    v-if="filter == 'checkDate'">
                    <base-input id="inputStyle"
                      type="date"
                      min="1997-01-01"
                      v-model="dateStart"
                      v-if="filter == 'checkDate'"
                      style="width: 150px;"
                      @input="getBankRecon(1, '')"></base-input>
                  </span>
                  <span class="col-sm-3 pl-5 pr-5"
                    v-if="filter == 'checkDate'">
                    <base-input id="inputStyle"
                      type="date"
                      min="1997-01-01"
                      v-model="dateEnd"
                      v-if="filter == 'checkDate'"
                      style="width: 150px;"
                      @input="getBankRecon(1, '')"></base-input>
                  </span>
                </div>
              </div>
              <!-- Reconciliation table -->
              <vue-good-table :columns="columns"
                :rows="bankReconChecks"
                :search-options="{enabled: true}"
                :pagination-options="{
                  enabled: true,
                  perPageDropdown: [10, 15, 20],
                }"
                :sort-options="{
                  enabled: true,
                  initialSortBy: {
                    field: 'bankCheckDate',
                    type: 'asc'
                  }
                }"
                :line-numbers="true"
                :isLoading="loading"
                ref="recon-trans-table">
                <template slot="table-row"
                  slot-scope="props">
                  <b><span v-if="props.column.field == 'bankCheckDate'">
                    <span>{{props.row.bankCheckDate | moment("MMM DD, YYYY")}}</span>
                  </span>
                  <span v-if="props.column.field == 'bankCheckNumber'">
                    <span>{{props.row.bankCheckNumber}}</span>
                  </span>
                  <span v-if="props.column.field == 'supplier'">
                    <span v-for="supplier in suppliers"
                      v-bind:key="supplier.supplierId">
                      <span v-if="supplier.supplierId == props.row.payeeReference">{{supplier.supplier}}</span>
                    </span>
                  </span>
                  <span v-if="props.column.field == 'bankCheckAmount'">
                    <span>{{props.row.bankCheckAmount}}</span>
                  </span>
                  <span v-if="props.column.field == 'dateNegotiated'">
                    <span>{{props.row.dateNegotiated == undefined || props.row.dateNegotiated == '' ? '---------' : props.row.dateNegotiated | moment("MMM DD, YYYY")}}</span>
                  </span>
                  <span v-if="props.column.field == 'status'">
                    <span v-if="props.row.status == 1">For clearing</span>
                    <span v-if="props.row.status == 4">For approval</span>
                    <span v-if="props.row.status == 2"
                      id="redTxt">CLEARED</span>
                  </span>
                  <span v-if="props.column.field == 'action'">
                    <span class="pointer ml-2 far fa-check-circle"
                      id="sideBarTxt"
                      v-on:click="openApprovalCheck(props.row)"
                      title="Clear check?"
                      v-if="props.row.status == 1"></span>
                    <span class="pointer ml-2 fa fa-thumbs-up"
                      id="sideBarTxt"
                      v-on:click="openClearCheck(props.row)"
                      title="Clear check?"
                      v-if="props.row.status == 4"></span>
                    <span class="pointer ml-2 fa fa-thumbs-down"
                      id="sideBarTxt"
                      v-on:click="rejectRecon(props.row)"
                      title="Reject?"
                      v-if="props.row.status == 4"></span>
                  </span></b>
                </template>
              </vue-good-table>
              <hr v-if="bankReconChecks.length > 0"
                class="mb-2 mt-2">
              <div class="row">
                <div class="col-sm-6"></div>
                <!-- Print button -->
                <div class="col-sm-3">
                  <base-button block id="darkBtn"
                    @click.native="printBankRecons()"
                    v-if="bankReconChecks.length > 0">Print</base-button>
                </div>
                <!-- Account transaction summary button -->
                <div class="col-sm-3">
                  <base-button block id="darkBtn"
                    @click.native="accountTransView()">Account Transaction</base-button>
                </div>
              </div>
            </card>
          </tab-pane>
          <!-- Account deposit tab -->
          <tab-pane title="Account Deposits">
            <bank-account-fund></bank-account-fund>
          </tab-pane>
          <!-- Account withdrawals tab -->
          <tab-pane title="Account Withdrawals">
            <bank-account-withdrawal></bank-account-withdrawal>
          </tab-pane>
        </tabs>
        <!-- APPROVAL CHECK MODAL -->
        <b-modal size="md"
          id="approval-check-modal"
          title="" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Date Negotiated:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <base-input v-model="newDateNego"
                type="date"
                id="inputStyle"></base-input>
              <i class="text-red"
                v-if="$v.newDateNego.$anyDirty && !$v.newDateNego.required">Field Required</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="approvalRecon"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Submit
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('approval-check-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- AUTHENTICATION MODAL -->
        <b-modal size="md"
          id="auth-modal"
          title="Authentication" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Password:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <base-input v-model="checkPassword"
                type="password"
                id="inputStyle"></base-input>
              <i class="text-red"
                v-if="$v.checkPassword.$anyDirty && !$v.checkPassword.required">Field Required</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="adminAuth"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Submit
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="closeAuthModal"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
        <!-- AUTHENTICATION CLEAR CHECK MODAL -->
        <b-modal size="md"
          id="auth-clear-check-modal"
          title="Authentication" centered
          :hide-header-close="true"
          :no-close-on-backdrop="true"
          :no-close-on-esc="true">
          <div class="form-group row mb-0">
            <label class="col-sm-12 col-form-label">
              <b>Password:</b>
              <b class="text-red">*</b>
            </label>
          </div>
          <div class="form-group row mb-0">
            <div class="col-sm-12 pl-5 pr-5">
              <base-input v-model="clearCheckPassword"
                type="password"
                id="inputStyle"></base-input>
              <i class="text-red"
                v-if="$v.clearCheckPassword.$anyDirty && !$v.clearCheckPassword.required">Field Required</i>
            </div>
          </div>
          <template v-slot:modal-footer>
            <div class="w-100">
              <div class="text-right">
                <base-button id="darkBtn"
                  @click.native="clearCheckAuth"
                  :disabled="requestProcessing">
                  <i v-if="requestProcessing"
                    class="fa fa-spinner fa-spin"></i>
                  Submit
                </base-button>
                <base-button id="darkInlineBtn"
                  @click.native="$bvModal.hide('auth-clear-check-modal')"
                  :disabled="requestProcessing">Close</base-button>
              </div>
            </div>
          </template>
        </b-modal>
    </div>
  </div>
</template>
<script>
  import {db, dbMains, dbUsers} from '@/main';
  import {required} from "vuelidate/lib/validators";
  import printJS from 'print-js';

  const checkColumns = ["#", "Check Date", "Check No.", "Check Payee", "Amount", "Date Negotiated", "Status", "Actions"];
  const today = new Date();
  const hash = require("password-hash");
  let moment = require('moment');
  let commaNumber = require('comma-number');
  let format = commaNumber.bindWith(',', '.');

  export default {
    components: {},
     data() {
      return {
        // Reconcile transaction table
        columns: [{
            label: 'Check Date',
            field: 'bankCheckDate',
          },{
            label: 'Check No.',
            field: 'bankCheckNumber',
          },{
            label: 'Check Payee',
            field: 'supplier',
          },{
            label: 'Amount',
            field: 'bankCheckAmount',
          },{
            label: 'Date Negotiated',
            field: 'dateNegotiated',
          },{
            label: 'Status',
            field: 'status',
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
        }],
        loading: false,
        loadError: false,
        bankReconCheckTable: {
          title: "Reconcile Checks",
          subTitle: "",
          columns: [...checkColumns]
        },
        bankReconChecks: [],
        bankReconChecksCount: 0,
        currentPage: 1,
        bankRecons: [],
        bankReconId: '',
        searchTerm: '',
        searching: false,
        requestProcessing: false,
        activateBanks: [],
        activateBankAccounts: [],
        status: [
          {"statusId": "clearing", "status": "For clearing"},
          {"statusId": "forApproval", "status": "For approval"},
          {"statusId": "cleared", "status": "Cleared"},
          {"statusId": "all", "status": "All"}
        ],
        stat: 'clearing',
        filters: [
          {"filterId": "checkDate", "filter": "Check Date"},
          {"filterId": "all", "filter": "All"},
        ],
        filter: 'checkDate',
        dateStart: moment().startOf('week').format('YYYY-MM-DD'),
        dateEnd: moment().endOf('week').format('YYYY-MM-DD'),
        maxDate: moment().format('YYYY-MM-DD'),
        // Reconcile selects
        bank: '',
        bankAccount: '',
        // Reconcile check
        checkId: '',
        newDateNego: moment().format("YYYY-MM-DD"),
        // Authentication
        checkPassword: '',
        clearCheckPassword: '',
        // Print reconcile transaction
        printRecons: [],
        // Account balance
        bankAccountBalance: '',
      };
    },
    // Check user role
    beforeRouteEnter(to, from, next){
      let username = localStorage.getItem('aisname');
      let userAccount = dbUsers.collection("users")
        .where("username", "==", username);
      let accounts = [];

      userAccount.get().then((querySnapshot) => {
        if(!querySnapshot.empty){
          querySnapshot.forEach((doc) => {
            accounts.push(doc.data());
          });
          let userRoleData = dbUsers.collection("userRoles")
            .where("userRoleId", "==", accounts[0].userRoleReference);
          let roles = [];

          userRoleData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              roles.push(doc.data());
            });
            if(roles[0].userRole == 'User'){     
              next("/main/home");
            }else if(roles[0].userRole == 'Manager' || roles[0].userRole == 'Administrator'){
              next();
            }
          });
        }
      });
    },
    async mounted(){
      this.$bvModal.show('auth-modal');
      this.getActivateBanks();
      this.getSuppliers();
      this.getBankRecon(1, "");
    },
    validations: {
      // Reconcile select validations
      bank: {required},
      bankAccount: {required},
      // Reconcile check validations
      newDateNego: {required},
      // Authentication validations
      checkPassword: {required},
      clearCheckPassword: {required}
    },
    methods: {
      // View account transaction summary
      accountTransView(){
        this.$router.push('/account/transaction');
      },
      closePage(){
        this.$router.push('/check/dashboard');
      },
      // Close user authentication form
      closeAuthModal(){
        this.$router.push('/main/home');
        this.$bvModal.hide('auth-modal');
      },
      // Check user credentials
      adminAuth(){
        let self = this;
        let userData = dbUsers.collection("users")
          .where("username","==",localStorage.getItem('aisname'));
        let user = [], role = [];

        userData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              user.push(doc.data());
            });
            let roleData = dbUsers.collection("userRoles")
              .where("userRoleId","==",user[0].userRoleReference);
            roleData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  role.push(doc.data());
                });
                if(role[0].userRole == "Administrator" || role[0].userRole == 'Manager'){
                  if(hash.verify(self.checkPassword, user[0].password)){
                    self.getBankRecon(1, "");
                    self.$bvModal.hide('auth-modal');
                  }else{
                    self.$swal({
                      title: 'Error',
                      text: 'Invalid password.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  }
                }else{
                  self.$swal({
                    title: 'Error',
                    text: 'You are not authorize.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    self.closeAuthModal();
                  });
                }
              }else if(querySnapshot.empty){
                self.$swal({
                  title: 'Error',
                  text: 'You are not authorize.',
                  icon: 'error',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.closeAuthModal();
                });
              }
            });
          }else if(querySnapshot.empty){
            self.$swal({
              title: 'Error',
              text: 'You are not authorize.',
              icon: 'error',
              confirmButtonColor: '#b80000',
              confirmButtonText: 'OK'
            }).then(() => {
              self.closeAuthModal();
            });
          }
        });
      },
      // Get bank data
      getActivateBanks(){
        let self = this;
        let bankData = dbMains.collection("banks")
          .orderBy("bank", "asc");

        self.activateBanks = [];
        bankData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.activateBanks.push(doc.data());
          });
          self.bank = self.activateBanks[0].bankUid;
          self.getActivateBankAccounts(self.activateBanks[0].bankUid);
        });
      },
      // Get bank account data
      getActivateBankAccounts(bank){
        let self = this;
        let bankAccountData = dbMains.collection("bankAccounts")
          .where("bankReference", "==", bank);

        self.activateBankAccounts = [];
        self.bankAccount = "";
        bankAccountData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.activateBankAccounts.push(doc.data());
          });
          if(self.activateBankAccounts.length != 0){
            self.bankAccount = self.activateBankAccounts[0].bankAccountUid;
          }
          self.getBankRecon(1, "");
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
      onPageChange (page) {
        let searchTerm = this.searchTerm;

        this.getBankRecon(page, searchTerm);
      } ,
      // Display check data on table
      getBankRecon(page, searchTerm){
        let self = this, ids = [];

        self.bankReconChecks = [];
        self.printRecons = [];
        self.$v.bank.$touch();
        self.$v.bankAccount.$touch();
        if(!self.$v.bank.$error && !self.$v.bankAccount.$error){
          let recons = [], accounts = [];
          let bankRecon = null;
          let bankAccountData = dbMains.collection("bankAccounts")
            .where("bankAccountUid", "==", self.bankAccount);

          bankAccountData.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              accounts.push(doc.data());
            });
            if(accounts[0].accountBalance != '' && accounts[0].accountBalance > 0){  
              self.bankAccountBalance = format(parseFloat(accounts[0].accountBalance).toFixed(2));
            }else{
              self.bankAccountBalance = '----------';
            }
          });
          if(searchTerm){
            self.searching = true;
          }
          if(searchTerm){
            searchTerm = searchTerm.toString();
            bankRecon = db.collection("bankChecks")
              .where("bankCheckNumber", "==", searchTerm.toString())
              .where("bankReference", "==", self.bank)
              .where("bankAccountReference", "==", self.bankAccount);
          }else if(self.stat == 'clearing'){
            let start = moment(self.dateStart).format('YYYY-MM-DD');
            let end = moment(self.dateEnd).format('YYYY-MM-DD');

            if(self.filter == "all"){
              bankRecon = db.collection("bankChecks")
                .where("bankReference", "==", self.bank)
                .where("bankAccountReference", "==", self.bankAccount)
                .where("status","in",[1])
                .orderBy("bankCheckDate","desc");
            }else if(self.filter == "checkDate"){
              bankRecon = db.collection("bankChecks")
                .where("bankReference", "==", self.bank)
                .where("bankAccountReference", "==", self.bankAccount)
                .where("bankCheckDate", ">=", start)
                .where("bankCheckDate", "<=", end)
                .where("status","in",[1])
                .orderBy("bankCheckDate","desc");
            }
          }else if(self.stat == 'forApproval'){
            let start = moment(self.dateStart).format('YYYY-MM-DD');
            let end = moment(self.dateEnd).format('YYYY-MM-DD');

            if(self.filter == "all"){
              bankRecon = db.collection("bankChecks")
                .where("bankReference", "==", self.bank)
                .where("bankAccountReference", "==", self.bankAccount)
                .where("status","in",[4])
                .orderBy("bankCheckDate","desc");
            }else if(self.filter == "checkDate"){
              bankRecon = db.collection("bankChecks")
                .where("bankReference", "==", self.bank)
                .where("bankAccountReference", "==", self.bankAccount)
                .where("bankCheckDate", ">=", start)
                .where("bankCheckDate", "<=", end)
                .where("status","in",[4])
                .orderBy("bankCheckDate","desc");
            }
          }else if(self.stat == 'cleared'){
            let start = moment(self.dateStart).format('YYYY-MM-DD');
            let end = moment(self.dateEnd).format('YYYY-MM-DD');

            if(self.filter == "all"){
              bankRecon = db.collection("bankChecks")
                .where("bankReference", "==", self.bank)
                .where("bankAccountReference", "==", self.bankAccount)
                .where("status","in",[2])
                .orderBy("bankCheckDate","desc");
            }else if(self.filter == "checkDate"){
              bankRecon = db.collection("bankChecks")
                .where("bankReference", "==", self.bank)
                .where("bankAccountReference", "==", self.bankAccount)
                .where("bankCheckDate", ">=", start)
                .where("bankCheckDate", "<=", end)
                .where("status","in",[2])
                .orderBy("bankCheckDate","desc");
            }
          }else if(self.stat == 'all'){
            let start = moment(self.dateStart).format('YYYY-MM-DD');
            let end = moment(self.dateEnd).format('YYYY-MM-DD');

            if(self.filter == "all"){
              bankRecon = db.collection("bankChecks")
                .where("bankReference", "==", self.bank)
                .where("bankAccountReference", "==", self.bankAccount)
                .where("status","in",[1,2])
                .orderBy("bankCheckDate","desc");
            }else if(self.filter == "checkDate"){
              bankRecon = db.collection("bankChecks")
                .where("bankReference", "==", self.bank)
                .where("bankAccountReference", "==", self.bankAccount)
                .where("bankCheckDate", ">=", start)
                .where("bankCheckDate", "<=", end)
                .where("status","in",[1,2])
                .orderBy("bankCheckDate","desc");
            }
          }
          bankRecon.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                recons.push(doc.data());
                self.printRecons.push(doc.data());
                ids.push(doc.id);
              });
              for(let b = 0; b < recons.length; b++){
                recons[b]["id"] = ids[b];
              }
              for(let a = 0; a < recons.length; a++){
                recons[a]["rowNum"] = a + 1;
                recons[a].bankCheckAmount = '₱ ' + format(parseFloat(recons[a].bankCheckAmount).toFixed(2));
                self.bankReconChecks.push(recons[a]);
              }
              self.bankReconChecksCount = recons.length;
              self.currentPage = page;
              setTimeout(function() {
                self.loading = false;
              }, 1000);
            }
          });
        }
        self.loading = false;
      },
      search() {
        let searchTerm = this.searchTerm;

        if(searchTerm) {
          this.getBankRecon(1, searchTerm);
        }
      },
      reloadData() {
        this.searchTerm = "";
        this.searching = false;
        this.getBankRecon(1, "");
      },
      resetData() {
        this.searching = false;
          if(this.searchTerm == "") {
            this.getBankRecon(1, "");
        }
      },
      // Show check approval form
      openApprovalCheck(row){
        this.checkId = row.bankCheckUid;
        this.$bvModal.show('approval-check-modal');
      },
      // Change check status to approval
      approvalRecon(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newDateNego.$touch();
        if(!self.$v.newDateNego.$error){
          self.$swal({
            title: 'Are you sure?',
            text: "You want to change this check status to for approval?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#b80000',
            cancelButtonColor: '#f5c71a',
            confirmButtonText: 'CONFIRM',
            cancelButtonText: 'CANCEL' ,
          }).then((result) => {
            if(result.value){
              let getId = db.collection("bankChecks")
                .where("bankCheckUid", "==", self.checkId);
              let id = '';

              self.requestProcessing = true;
              getId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  id = doc.id;
                });
                db.collection("bankChecks")
                .doc(id)
                .update({
                  dateNegotiated: self.newDateNego,
                  status: 4,
                  dateModified: today
                }).then(() => {
                  self.$refs['recon-trans-table'].reset();
                  self.getBankRecon(1, "");
                  self.$swal({
                    title: "Success",
                    text: "Check status changed to for approval",
                    icon: "success",
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.$bvModal.hide('approval-check-modal');
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
              self.requestProcessing = false;
            }
          });
        }
      },
      // Change check status to for clearing
      rejectRecon(row){
        let self = this;

        self.requestProcessing = false;
        self.$swal({
          title: 'Are you sure?',
          text: "You want to change this check status to for clearing?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#f5c71a',
          confirmButtonText: 'CONFIRM',
          cancelButtonText: 'CANCEL' ,
        }).then((result) => {
          if(result.value){
            let getId = db.collection("bankChecks")
              .where("bankCheckUid", "==", row.bankCheckUid);
            let id = '';

            self.requestProcessing = true;
            getId.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                id = doc.id;
              });
              db.collection("bankChecks")
              .doc(id)
              .update({
                dateNegotiated: '',
                status: 1,
                dateModified: today
              }).then(() => {
                self.$refs['recon-trans-table'].reset();
                self.getBankRecon(1, "");
                self.$swal({
                  title: "Success",
                  text: "Check status changed to for clearing",
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
            self.requestProcessing = false;
          }
        });
      },
      // Change check status to cleared
      clearedRecon(checkId){
        let self = this;

        self.requestProcessing = false;
        self.$swal({
          title: 'Are you sure?',
          text: "You want to cleared this check?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#f5c71a',
          confirmButtonText: 'CONFIRM',
          cancelButtonText: 'CANCEL' ,
        }).then((result) => {
          if (result.value) {
            let getId = db.collection("bankChecks")
              .where("bankCheckUid", "==", checkId);
            let accountData = dbMains.collection('bankAccounts')
              .where("bankAccountUid","==", self.bankAccount);
            let id = '', amount = '', accountId = '', balance = '', total = 0;

            self.requestProcessing = true;
            getId.get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                id = doc.id;
                amount = parseFloat(doc.data().bankCheckAmount.replaceAll(",",""));
              });
              accountData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  accountId = doc.id;
                  balance = parseFloat(doc.data().accountBalance.replaceAll(",",""));
                });
                if(balance > 0 && balance >= amount){
                  total = balance - amount;
                }else{
                  total = balance;
                }
                db.collection("bankChecks")
                .doc(id)
                .update({
                  status: 2,
                  dateModified: today
                }).then(() => {
                  dbMains.collection("bankAccounts")
                  .doc(accountId)
                  .update({
                    accountBalance: parseFloat(total).toFixed(2),
                    dateModified: today
                  }).then(() => {
                    if(total > 0){
                      self.bankAccountBalance =format(parseFloat(total).toFixed(2));
                    }else{
                      self.bankAccountBalance = '----------';
                    }
                  });
                  self.$refs['recon-trans-table'].reset();
                  self.getBankRecon(1, "");
                  self.$swal({
                    title: "Success",
                    text: "Check cleared",
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
            });
            self.requestProcessing = false;
          }
        });
      },
      // Print reconcile check details
      printBankRecons(){
        let self = this, bankName = '', bankAccountNumber = '', bankAccountName = '';
        let dateRange = '';

        if(self.filter != 'all'){
          dateRange = '<h5>Check Date Range: ' + moment(self.dateStart).format("MMM DD, YYYY") + ' to ' + moment(self.dateEnd).format("MMM DD, YYYY") + '</h5>';
        }
        for(let a = 0; a < self.printRecons.length; a++){
          self.printRecons[a].bankCheckAmount.replaceAll(",","");
          self.printRecons[a].bankCheckAmount.replaceAll("₱","");
          self.printRecons[a].bankCheckAmount.replaceAll(" ","");
          self.printRecons[a].bankCheckAmount = '₱ ' + format(parseFloat(self.printRecons[a].bankCheckAmount).toFixed(2));
          if(self.printRecons[a].status == 1){
            self.printRecons[a]["checkStat"] = "For Clearing";
          }else if(self.printRecons[a].status == 2){
            self.printRecons[a]["checkStat"] = "Cleared";
          }
          if(self.printRecons[a].dateNegotiated == undefined){
            self.printRecons[a]["date"] = '----------';
          }else{
            self.printRecons[a]["date"] = self.printRecons[a].dateNegotiated;
          }
        }
        for(let b = 0; b < self.activateBanks.length; b++){
          if(self.activateBanks[b].bankUid == self.bank){
            bankName = self.activateBanks[b].bank;
          }
        }
        for(let c = 0; c < self.activateBankAccounts.length; c++){
          if(self.activateBankAccounts[c].bankAccountUid == self.bankAccount){
            bankAccountNumber = self.activateBankAccounts[c].bankAccountNumber;
            bankAccountName = self.activateBankAccounts[c].bankAccountName;
          }
        }
        printJS({
          printable: self.printRecons,
          properties: [{
              field: 'bankCheckDate',
              displayName: 'Check Date'
            },{
              field: 'bankCheckNumber',
              displayName: 'Check Number'
            },{
              field: 'bankCheckAmount',
              displayName: 'Amount'
            },{
              field: 'date',
              displayName: 'Date Negotiated'
            },{
              field: 'checkStat',
              displayName: 'Status'
          }],
          type: 'json',
          header: '<h2>' + bankName + ' RECONCILE TRANSACTION</h2><h4>Account: ' + bankAccountNumber + ' (' + bankAccountName + ')</h4>' + dateRange,
          style: 'td {text-align: center;} body {font-family: "Calibri";}',
          documentTitle: bankName + ' Reconcile Transaction'
        });
      },
      // Show clear check form
      openClearCheck(row){
        this.checkId = row.bankCheckUid;
        this.$bvModal.show('auth-clear-check-modal');
      },
      // Check user authentication
      clearCheckAuth(){
        let self = this;
        let userData = dbUsers.collection("users")
          .where("username","==",localStorage.getItem('aisname'));
        let user = [], role = [];

        userData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              user.push(doc.data());
            });
            let roleData = dbUsers.collection("userRoles")
              .where("userRoleId","==",user[0].userRoleReference);
            roleData.get().then((querySnapshot) => {
              if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                  role.push(doc.data());
                });
                if(role[0].userRole == "Administrator"){
                  if(hash.verify(self.clearCheckPassword, user[0].password)){
                    self.clearedRecon(self.checkId);
                    self.$bvModal.hide('auth-clear-check-modal');
                    self.clearCheckPassword = "";
                  }else{
                    self.$swal({
                      title: 'Error',
                      text: 'Invalid password.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    }).then(() => {
                      self.clearCheckPassword = "";
                    });
                  }
                }else{
                  self.$swal({
                    title: 'Error',
                    text: 'You are not authorize.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    self.$bvModal.hide('auth-clear-check-modal');
                    self.clearCheckPassword = "";
                  });
                }
              }else if(querySnapshot.empty){
                self.$swal({
                  title: 'Error',
                  text: 'You are not authorize.',
                  icon: 'error',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.$bvModal.hide('auth-clear-check-modal');
                  self.clearCheckPassword = "";
                });
              }
            });
          }else if(querySnapshot.empty){
            self.$swal({
              title: 'Error',
              text: 'You are not authorize.',
              icon: 'error',
              confirmButtonColor: '#b80000',
              confirmButtonText: 'OK'
            }).then(() => {
              self.$bvModal.hide('auth-clear-check-modal');
              self.clearCheckPassword = "";
            });
          }
        });
      },
    }
  };
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>