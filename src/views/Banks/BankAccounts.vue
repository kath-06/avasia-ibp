<template>
  <div id="textStyle"> 
      <card class="pt-4">
        <!-- Bank account table -->
        <vue-good-table :columns="columns"
          :rows="bankAccounts"
          :search-options="{enabled: true}"
          :pagination-options="{
            enabled: true,
            perPageDropdown: [10, 15, 20],
          }"
          :sort-options="{
            enabled: true,
            initialSortBy: {
              field: 'bankAccountName',
              type: 'asc'
            }
          }"
          :line-numbers="true"
          :isLoading="loading"
          ref="bank-account-table">
          <template slot="table-row"
            slot-scope="props">
            <b><span v-if="props.column.field == 'bankAccountName'">
              <span>{{props.row.bankAccountName}}</span>
            </span>
            <span v-if="props.column.field == 'bankAccountNumber'">
              <span>{{props.row.bankAccountNumber}}</span>
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
            <span v-if="props.column.field == 'bank'">
              <span v-for="bank in banks"
                v-bind:key="bank.bankUid" >
                <span v-if="bank.bankUid == props.row.bankReference">{{bank.bank}}</span>
              </span>
            </span>
            <span v-if="props.column.field == 'action'">
              <span class="pointer ml-2 far fa-edit"
                id="sideBarTxt"
                v-on:click="openUpdateBankAccountModal(props.row)"
                title="Update"></span>
              <span class="pointer ml-2 far fa-credit-card"
                id="sideBarTxt"
                v-on:click="openAuthenticationModal(props.row)"
                title="Account Balance"></span>
            </span></b>
          </template>
        </vue-good-table>
        <hr class="mb-2 mt-2">
        <!-- Limit bank account record on table -->
        <div class="row pl-4 pt-2"
          v-if="!loading && bankAccounts.length">
          <div class="col-9"></div>
          <span class="col-1 pt-2">
            <b>View:</b>
          </span>
          <span class="col-sm-2">
            <v-select id="inputStyle"
              :options="views"
              :reduce="view => view.limitId"
              label="limit"
              v-model="limit"
              :clearable="false"
              @input="getBankAccounts(1, '')"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New bank account button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-bank-account-modal
            id="darkBtn">New Bank Account</base-button>
        </div>
      </card>
      <!-- ADD BANK ACCOUNT MODAL -->
      <b-modal size="xl"
        id="new-bank-account-modal"
        title="New Bank Account" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Account Name:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Account Number:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newAccountName"
              type="text"
              id="inputStyle"
              placeholder="Account Name"></base-input>
            <i class="text-red"
              v-if="$v.newAccountName.$anyDirty && !$v.newAccountName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newAccountName.$anyDirty && !$v.newAccountName.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newAccountNumber"
              type="text"
              id="inputStyle"
              placeholder="Account Number"></base-input>
            <i class="text-red"
              v-if="$v.newAccountNumber.$anyDirty && !$v.newAccountNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newAccountNumber.$anyDirty && !$v.newAccountNumber.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Branch:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Contact Person:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newBranch"
              id="inputStyle"
              type="text"
              placeholder="Branch"></base-input>
            <i class="text-red"
              v-if="$v.newBranch.$anyDirty && !$v.newBranch.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newBranch.$anyDirty && !$v.newBranch.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newContactPerson"
              id="inputStyle"
              type="text"
              placeholder="Contact Person"></base-input>
            <i class="text-red"
              v-if="$v.newContactPerson.$anyDirty && !$v.newContactPerson.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newContactPerson.$anyDirty && !$v.newContactPerson.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Contact Number:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Date Created:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newContactNumber"
              id="inputStyle"
              type="text"
              placeholder="Contact Number"></base-input>
            <i class="text-red"
              v-if="$v.newContactNumber.$anyDirty && !$v.newContactNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newContactNumber.$anyDirty && !$v.newContactNumber.numCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newBankAccountCreated"
              type="date"
              id="inputStyle"></base-input>
            <i class="text-red"
              v-if="$v.newBankAccountCreated.$anyDirty && !$v.newBankAccountCreated.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Bank:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="banks"
              :reduce="activateBank => activateBank.bankUid"
              label="bank"
              v-model="newBank"
              :clearable="false">
            </v-select>
            <i class="text-red"
              v-if="$v.newBank.$anyDirty && !$v.newBank.required">Field Required</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addBankAccount"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-bank-account-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE BANK ACCOUNT MODAL -->
      <b-modal size="xl"
        id="update-bank-account-modal"
        title="Edit Bank Account" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Account Name:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Account Number:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="selectedBankAccount.accountName"
              type="text"
              id="inputStyle"
              placeholder="Account Name"></base-input>
            <i class="text-red"
              v-if="$v.selectedBankAccount.$anyDirty && !$v.selectedBankAccount.accountName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.selectedBankAccount.$anyDirty && !$v.selectedBankAccount.accountName.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="selectedBankAccount.accountNumber"
              type="text"
              id="inputStyle"
              placeholder="Account Number"></base-input>
            <i class="text-red"
              v-if="$v.selectedBankAccount.$anyDirty && !$v.selectedBankAccount.accountNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.selectedBankAccount.$anyDirty && !$v.selectedBankAccount.accountNumber.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Branch:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Contact Person:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="selectedBankAccount.branch"
              type="text"
              id="inputStyle"
              placeholder="Branch"></base-input>
            <i class="text-red"
              v-if="$v.selectedBankAccount.$anyDirty && !$v.selectedBankAccount.branch.required">Field Required</i>
            <i class="text-red"
              v-if="$v.selectedBankAccount.$anyDirty && !$v.selectedBankAccount.branch.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="selectedBankAccount.contactPerson"
              type="text"
              id="inputStyle"
              placeholder="Contact Person"></base-input>
            <i class="text-red"
              v-if="$v.selectedBankAccount.$anyDirty && !$v.selectedBankAccount.contactPerson.required">Field Required</i>
            <i class="text-red"
              v-if="$v.selectedBankAccount.$anyDirty && !$v.selectedBankAccount.contactPerson.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Contact Number:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Date Created:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="selectedBankAccount.contactNumber"
              type="text"
              id="inputStyle"
              placeholder="Contact Number"></base-input>
            <i class="text-red"
              v-if="$v.selectedBankAccount.$anyDirty && !$v.selectedBankAccount.contactNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.selectedBankAccount.$anyDirty && !$v.selectedBankAccount.contactNumber.numCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="selectedBankAccount.bankAccountCreated"
              type="date"
              id="inputStyle"
              placeholder="Bank Account Created"></base-input>
            <i class="text-red"
              v-if="$v.selectedBankAccount.$anyDirty && !$v.selectedBankAccount.bankAccountCreated.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Bank:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="banks"
              :reduce="activateBank => activateBank.bankUid"
              label="bank"
              v-model="selectedBankAccount.bank"
              :clearable="false">
            </v-select>
            <i class="text-red"
              v-if="$v.selectedBankAccount.bank.$anyDirty && !$v.selectedBankAccount.bank.required">Field Required</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateBankAccount"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-bank-account-modal')"
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
                @click.native="$bvModal.hide('auth-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- ACCOUNT BALANCE MODAL -->
      <b-modal size="md"
        id="account-balance-modal"
        title="Account Balance" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Account Balance:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="accountBalance"
              type="text"
              id="inputStyle"></base-input>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateBalance"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Submit
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('account-balance-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
  </div>
</template>
<script>
  import {dbUsers} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import { mapGetters } from 'vuex';

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9. ]*$/);
  const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z. ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const tableColumns = ["#", "Account Name", "Account No.", "Bank", "Actions"];
  const moment  = require('moment');
  const today = new Date();

  export default {
    name: "bank-accounts",
    components: {},
     data() {
      return {
        // Bank account table
        columns: [{
            label: 'Account Name',
            field: 'bankAccountName',
          },{
            label: 'Account No',
            field: 'bankAccountNumber',
          },{
            label: 'Bank',
            field: 'bank'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
        }],
        loading: true,
        loadError: false,
        bankAccountTable: {
          title: "Bank Accounts Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        bankAccountsCount: 0,
        activateBanks: [],
        currentPage: 1 ,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // New bank account
        newAccountName: '',
        newAccountNumber: '',
        newBranch: '',
        newContactPerson: '',
        newContactNumber: '',
        newBankAccountCreated: moment().format("YYYY-MM-DD"),
        newBank: '',
        // Edit bank account
        selectedBankAccount: {
          id: '',
          bankUid: null,
          accountName: '',
          accountNumber: '',
          branch: '',
          contactPerson: '',
          contactNumber: '',
          bankAccountCreated: '',
          bank: ''
        },
        // Enable or disable buttons
        requestProcessing: false,
        // Authentication
        checkPassword: "",
        // Bank account balance
        accountId: '',
        accountBalance: ''
      };
    },
    validations: {
      // New bank account validations
      newAccountName: {
        required,
        alphaNumCustomValidator
      },
      newAccountNumber: {
        required,
        alphaNumCustomValidator
      },
      newBranch: {
        required,
        alphaNumCustomValidator
      },
      newContactPerson: {
        required,
        alphaCustomValidator
      },
      newContactNumber: {
        required,
        numCustomValidator
      },
      newBankAccountCreated: {required},
      newBank: {required},
      // Edit bank account validations
      selectedBankAccount: {
        accountName: {
          required,
          alphaNumCustomValidator
        },
        accountNumber: {
          required,
          alphaNumCustomValidator
        },
        branch: {
          required,
          alphaNumCustomValidator
        },
        contactPerson: {
          required,
          alphaNumCustomValidator
        },
        contactNumber: {
          required,
          numCustomValidator
        },
        bankAccountCreated: {required},
        bank: {required},
      },
      // Authentication validations
      checkPassword: {required}
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
            if(roles[0].userRole != 'Administrator'){     
              next("/main/home");
            }else{
              next();
            }
          });
        }
      });
    },
    async mounted(){
      this.getBankAccounts();
      this.getBanks();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users',
        bankAccounts: "BankAccounts/bankAccounts",
        banks: "Banks/bankData",
        valid: "BankAccounts/valid",
        error: "BankAccounts/error",
        validAuth: "Users/valid",
      })
    },
    methods: {
      closePage(){
        this.$router.push('/check/dashboard');
      },
      // Get bank account data
      async getBankAccounts() {
        let self = this;

        self.loading = true;
        self.loadError = false;
        self.$store.dispatch("BankAccounts/getBankAccounts", {limit: self.limit});
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Get bank data
      async getBanks(){
        let self = this;

        self.$store.dispatch("Banks/getBankData")
        .then(() => {
          setTimeout(function() {
            self.newBank = self.banks[0].bankUid;
          }, 1000);
        });
      },
      // Save new bank account
      async addBankAccount(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newAccountName.$touch();
        self.$v.newAccountNumber.$touch();
        self.$v.newBranch.$touch();
        self.$v.newContactPerson.$touch();
        self.$v.newContactNumber.$touch();
        self.$v.newBankAccountCreated.$touch();
        self.$v.newBank.$touch();
        if(!self.$v.newAccountName.$error && !self.$v.newAccountNumber.$error && !self.$v.newBranch.$error && !self.$v.newContactPerson.$error && !self.$v.newContactNumber.$error && !self.$v.newBankAccountCreated.$error && !self.$v.newBank.$error){
          self.requestProcessing = true;
          let username = localStorage.getItem('aisname');

          self.$store.dispatch("BankAccounts/checkNewBankAccount", {newAccountNumber : self.newAccountNumber})
          .then(() => {
            setTimeout(function() {
              if(self.valid == 1){
                self.validationMessage();
                self.requestProcessing = false;
              }else if(self.valid == 0){
                let newBankAccount = {
                  bankAccountUid: '',
                  bankAccountName: self.newAccountName,
                  bankAccountNumber: self.newAccountNumber,
                  bankAccountBranch: self.newBranch,
                  contactPerson: self.newContactPerson,
                  contactNumber: self.newContactNumber,
                  accountBalance: '',
                  availableBalance: '',
                  bankAccountDate: moment(self.newBankAccountCreated).format("YYYY-MM-DD"),
                  bankReference: self.newBank,
                  createdBy: username,
                  userReference: '',
                  status: 1,
                  dateCreated: today,
                  dateModified: today
                };

                self.$store.dispatch("BankAccounts/saveBankAccount", newBankAccount)
                .then(() => {
                  self.requestProcessing = false;
                  if(self.error == 0){
                    self.newAccountName = '';
                    self.newAccountNumber = '';
                    self.newBranch = '';
                    self.newContactPerson = '';
                    self.newContactNumber = '';
                    self.newBankAccountCreated = '';
                    self.$v.newAccountName.$reset();
                    self.$v.newAccountNumber.$reset();
                    self.$v.newBranch.$reset();
                    self.$v.newContactPerson.$reset();
                    self.$v.newContactNumber.$reset();
                    self.$v.newBankAccountCreated.$reset();
                    self.$bvModal.hide('new-bank-account-modal');
                    self.$refs['bank-account-table'].reset();
                    self.getBanks();
                    self.getBankAccounts(1, "");
                    self.$swal({
                      title: 'Success',
                      text: 'New Bank Account added successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  }else if(self.error == 1){
                    self.errorMessage();
                  }
                });
              }
            }, 1000);
          });
        }
      },
      // Display invalid message
      validationMessage(){
        let self = this;

        self.$swal({
          title: 'Invalid',
          text: 'Bank Account Number already exists.',
          icon: 'error',
          confirmButtonColor: '#b80000',
          confirmButtonText: 'OK'
        });
      },
      // Display error message
      errorMessage(){
        let self = this;

        self.$swal({
          title: 'Success',
          text: 'New Bank Account added successfully!',
          icon: 'success',
          confirmButtonColor: '#b80000',
          confirmButtonText: 'OK'
        });
      },
      // Show edit bank account form
      openUpdateBankAccountModal(account){
        this.selectedBankAccount = {
          id: account.id,
          bankAccountUid: account.bankAccountUid,
          accountName: account.bankAccountName,
          accountNumber: account.bankAccountNumber,
          branch: account.bankAccountBranch,
          contactPerson: account.contactPerson,
          contactNumber: account.contactNumber,
          bankAccountCreated: account.bankAccountDate,
          bank: account.bankReference
        }
        this.$bvModal.show('update-bank-account-modal');
      },
      // Change bank account details
      async updateBankAccount(){
        let self = this;

        self.requestProcessing = false;
        self.$v.selectedBankAccount.$touch();
        if(!self.$v.selectedBankAccount.$error){
          self.requestProcessing = true;
          self.$store.dispatch("BankAccounts/checkEditBankAccount", self.selectedBankAccount)
          .then(() => {
            setTimeout(function() {
              if(self.valid == 1){
                self.requestProcessing = false;
                self.validationMessage();
              }else if(self.valid == 0){
                self.$store.dispatch("BankAccounts/updateBankAccount", self.selectedBankAccount)
                .then(() => {
                  self.requestProcessing = false;
                  if(self.error == 0){
                    self.selectedBankAccount = {};
                    self.$v.selectedBankAccount.$reset();
                    self.$bvModal.hide('update-bank-account-modal');
                    self.$refs['bank-account-table'].reset();
                    self.getBankAccounts(1, "");
                    self.$swal({
                      title: 'Success',
                      text: 'Bank Account updated successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  }else if(self.error == 1){
                    self.errorMessage();
                  }
                });
              }
            }, 1000);
          });
        }
      },
      // Show user authentication form
      openAuthenticationModal(account){
        this.accountId = account.id;
        this.accountBalance = account.accountBalance;
        this.$bvModal.show("auth-modal");
      },
      // Check user credentials
      async adminAuth(){
        let self = this;

        self.$v.checkPassword.$touch();
        if(!self.$v.checkPassword.$error){
          self.$store.dispatch("Users/adminAuthentication", {checkPassword: self.checkPassword})
          .then(() => {
            setTimeout(function() {
              if(self.validAuth == 0){
                self.$bvModal.hide('auth-modal');
                self.$bvModal.show("account-balance-modal");
                self.checkPassword = '';
              }else if(self.validAuth == 1){
                self.$swal({
                  title: 'Error',
                  text: 'Invalid password.',
                  icon: 'error',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              }else if(self.validAuth == 2){
                self.$swal({
                  title: 'Error',
                  text: 'You are not authorize.',
                  icon: 'error',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.$bvModal.hide("auth-modal");
                });
              }
              self.$v.checkPassword.$reset();
            }, 1000);
          });
        }
      },
      // Change bank account balance
      async updateBalance(){
        let self = this;

        self.requestProcessing = false;
        try{
          let editAccount = {
            accountId: self.accountId,
            accountBalance: self.accountBalance.replaceAll(",",""),
            dateModified: today
          };

          self.requestProcessing = true;
          self.$store.dispatch("BankAccounts/updateAccountBalance", editAccount)
          .then(() => {
            setTimeout(function(){
              if(self.error == 0){
                self.accountId = '';
                self.accountBalance = '';
                self.$bvModal.hide('account-balance-modal');
                self.$refs['bank-account-table'].reset();
                self.getBankAccounts(1, "");
                self.requestProcessing = false;
                self.$swal({
                  title: 'Success',
                  text: 'Bank Account updated successfully!',
                  icon: 'success',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              }else if(self.error == 1){
                self.errorMessage();
              }
            }, 1000);
          });
        }catch(error){
          console.log(error);
          self.errorMessage();
        }
      },
    }
  };
</script>