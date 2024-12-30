<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <tabs fill class="flex-column flex-md-row">
        <!-- Bank tab pane -->
        <tab-pane title="Banks">
          <card class="pt-4"
            id="textStyle">
            <!-- Display bank list table -->
            <vue-good-table :columns="columns"
              :rows="banks"
              :search-options="{enabled: true,}"
              :pagination-options="{
                enabled: true,
                perPageDropdown: [10, 15, 20],
              }"
              :sort-options="{
                enabled: true,
                initialSortBy: {
                  field: 'bankName',
                  type: 'asc'
                }
              }"
              :line-numbers="true"
              :isLoading="loading"
              ref="bank-table">
              <template slot="table-row"
                slot-scope="props">
                <b><span v-if="props.column.field == 'bank'">
                  <span>{{props.row.bank}}</span>
                </span>
                <span v-if="props.column.field == 'bankName'">
                  <span>{{props.row.bankName}}</span>
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
                <span v-if="props.column.field == 'action'">
                  <span class="pointer ml-2 far fa-edit"
                    id="sideBarTxt"
                    v-on:click="openUpdateBankModal(props.row)"
                    title="Update"></span>
                </span></b>
              </template>
            </vue-good-table>
            <hr class="mb-2 mt-2">
            <!-- Limit bank records -->
            <div class="row pl-4 pt-2"
              v-if="!loading && banks.length">
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
                  @input="getBanks()"></v-select>
              </span>
            </div>
            <hr class="mb-2 mt-2">
            <!-- New bank button -->
            <div class="text-right pt-2">
              <base-button v-b-modal.new-bank-modal
                id="darkBtn"
                class="col-md-2 ml-2 mr-2">New Bank</base-button>
            </div>
          </card>
        </tab-pane>
        <!-- Bank account tab pane -->
        <tab-pane title="Bank Accounts">
          <bank-accounts></bank-accounts>
        </tab-pane>
        <!-- Check series tab pane -->
        <tab-pane title="Check Series">
          <check-series></check-series>
        </tab-pane>
        <!-- Check payee tab pane -->
        <tab-pane title="Check Payee">
          <check-payee></check-payee>
        </tab-pane>
      </tabs>
      <!-- ADD BANK MODAL -->
      <b-modal size="lg"
        id="new-bank-modal"
        title="New Bank" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Bank Short Name/Acronym:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Bank Full Name:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newBank"
              id="inputStyle"
              type="text"
              placeholder="Short Name"></base-input>
            <i class="text-red"
              v-if="$v.newBank.$anyDirty && !$v.newBank.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newBank.$anyDirty && !$v.newBank.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newBankName"
              id="inputStyle"
              type="text"
              placeholder="Full Name"></base-input>
            <i class="text-red"
              v-if="$v.newBankName.$anyDirty && !$v.newBankName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newBankName.$anyDirty && !$v.newBankName.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addBank"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-bank-modal')"
                :disabled="requestProcessing">
                Close
              </base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE BANK MODAL -->
      <b-modal size="lg"
        id="update-bank-modal"
        title="Edit Bank" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Bank Short Name/Acronym:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Bank Full Name:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="selectedBank.bank"
              type="text"
              id="inputStyle"
              placeholder="Short Name"></base-input>
            <i class="text-red"
              v-if="$v.selectedBank.$anyDirty && !$v.selectedBank.bank.required">Field Required</i>
            <i class="text-red"
              v-if="$v.selectedBank.$anyDirty && !$v.selectedBank.bank.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="selectedBank.bankName"
              type="text"
              id="inputStyle"
              placeholder="Full Name"></base-input>
            <i class="text-red"
              v-if="$v.selectedBank.$anyDirty && !$v.selectedBank.bankName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.selectedBank.$anyDirty && !$v.selectedBank.bankName.alphaNumCustomValidator">Invalid Characters</i>
          </div> 
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateBank"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-bank-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {dbUsers} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {upperCase} from "text-case";
  import { mapGetters } from 'vuex';

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z . ]*$/);
  const tableColumns = ["#", "Bank", "", "Actions"];
  const today = new Date();
  // const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Bank table
        columns: [{
            label: 'Bank',
            field: 'bank',
          },{
            label: '',
            field: 'bankName',
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '50px'
          }
        ],
        loading: true,
        loadError: false,
        bankTable: {
          title: "Banks Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        banksCount: 0,
        currentPage: 1 ,
        searchTerm: '',
        searching: false ,
        lastData: '',
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // New bank
        newBank: '',
        newBankName: '',
        // Edit bank
        selectedBank: {
          id: '',
          bankUid: null,
          bank: '',
          bankName: ''
        },
        banksUid: '',
        // Enable/disbale buttons
        requestProcessing: false,
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
      this.getBanks();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users',
        banks: "Banks/banks",
        validationMessage: "Banks/validationMessage",
        errorMessage: "Banks/errorMessage",
      })
    },
    validations: {
      // New bank
      newBank: {
        required,
        alphaNumCustomValidator
      },
      newBankName: {
        required,
        alphaNumCustomValidator
      },
      // Edit bank
      selectedBank: {
        bank: {
          required,
          alphaNumCustomValidator
        },
        bankName: {
          required,
          alphaNumCustomValidator
        }
      },
    },
    methods: {
      // Get bank data for bank list table
      getBanks() {
        let self = this;

        self.loading = true;
        self.loadError = false;
        self.$store.dispatch("Banks/getBanks", {limit: self.limit});
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Add new bank data
      async addBank(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newBank.$touch();
        if(!self.$v.newBank.$error && !self.$v.newBankName.$error){
          self.requestProcessing = true;
          self.$store.dispatch("Banks/checkBanks", {newBank: self.newBank})
          .then(() => {
            setTimeout(function() {
              if(self.validationMessage == 1){
                self.bankInvalidMessage();
              }else if(self.validationMessage == 0){
                let newBank = {
                  bankUid: '',
                  bank: upperCase(self.newBank),
                  bankName: self.newBankName,
                  createdBy: '',
                  userReference: '',
                  status: 1,
                  dateCreated: today,
                  dateModified: today
                }
                self.$store.dispatch("Banks/saveBank", newBank)
                .then(() => {
                  self.requestProcessing = false;
                  if(self.errorMessage == 0){
                    self.newBank = '';
                    self.newBankName = '';
                    self.$v.newBank.$reset();
                    self.$v.newBankName.$reset();
                    self.$bvModal.hide('new-bank-modal');
                    self.getBanks();
                    self.$swal({
                      title: 'Success',
                      text: 'New Bank added successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  }else if(self.errorMessage == 1){
                    self.bankErrorMessage();
                  }
                });
              }
            }, 1000);
          });
        }
      },
      // Display invalid message
      bankInvalidMessage(){
        let self = this;

        self.$swal({
          title: 'Invalid',
          text: 'Bank already exists.',
          icon: 'error',
          confirmButtonColor: '#f5365c',
          confirmButtonText: 'OK'
        });
        self.requestProcessing = false;
      },
      // Display error message
      bankErrorMessage(){
        let self = this;

        self.$swal({
          title: 'Error',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#b80000',
          confirmButtonText: 'OK'
        });
      },
      // Open update bank modal
      openUpdateBankModal(bank){
        this.selectedBank = {
          id: bank.id,
          bankUid: bank.bankUid,
          bank: bank.bank,
          bankName: bank.bankName
        }
        this.$bvModal.show('update-bank-modal');
      },
      // Change bank details
      async updateBank(){
        let self = this;

        self.requestProcessing = true;
        self.$v.selectedBank.$touch();
        if(!self.$v.selectedBank.$error){
          self.$store.dispatch("Banks/checkUpdateBanks", self.selectedBank)
          .then(() => {
            setTimeout(function() {
              if(self.validationMessage == 1){
                self.bankInvalidMessage();
              }else if(self.validationMessage == 0){
                self.selectedBank.bank = upperCase(self.selectedBank.bank);
                self.$store.dispatch("Banks/updateBanks", self.selectedBank)
                .then(() => {
                  self.requestProcessing = false;
                  if(self.errorMessage == 0){
                    self.selectedBank = {};
                    self.$v.selectedBank.$reset();
                    self.$bvModal.hide('update-bank-modal');
                    self.requestProcessing = false;
                    self.$refs['bank-table'].reset();
                    self.getBanks();
                    self.$swal({
                      title: 'Success',
                      text: 'Bank updated successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  }else if(self.errorMessage == 1){
                    self.bankErrorMessage();
                  }
                });
              }
            }, 1000);
          });
        }
      },
    }
  };
</script>
<style type="text/css">
  /*Form styles*/
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>