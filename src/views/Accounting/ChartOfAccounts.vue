<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <div class="row">
          <!-- Chart of accounts status links -->
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="activeBadge"
                v-if="stat == 1"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getChartOfAccounts(filterEquation, 1)">Active</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="activeBadge"
                v-if="stat == 0"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getChartOfAccounts(filterEquation, 0)">Disabled</span>
            </badge>
          </div>
        </div>
        <!-- Filter list by account equation -->
        <div class="row text-left pb-2">
          <span class="col-4"></span>
          <span class="col-4 pt-3 pl-5 text-right">
            <b>Account Equations:</b>
          </span>
          <span class="col-sm-3 pt-2 text-right">
            <v-select id="inputStyle"
              :options="accountEquations"
              :reduce="equation => equation.accountEquationId"
              label="accountEquation"
              v-model="filterEquation"
              :clearable="false"
              readonly
              @input="getChartOfAccounts(filterEquation, 1)"
              style="width: 240px;"></v-select>
          </span>
        </div>
        <!-- Chart of account table list -->
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="accounts"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="coa-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'account'">
                <span>{{props.row.account}}</span>
              </span>
              <span v-if="props.column.field == 'code'">
                <span>{{props.row.code}}</span>
              </span>
              <span v-if="props.column.field == 'accountType'">
                <span>{{props.row.accountType}}</span>
              </span>
              <span v-if="props.column.field == 'methodType'">
                <span>{{props.row.methodType == '' ? '----------' : props.row.methodType}}</span>
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
                <span>{{props.row.status == 1 ? 'Active' : 'Disable'}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openUpdateAccountModal(props.row)"
                  title="Update"></span>
                <span class="pointer ml-2 far fa-times-circle"
                  id="sideBarTxt"
                  v-if="props.row.status == 1"
                  v-on:click="changeStatus(props.row, 0, 'Disable')"
                  title="Disable"></span>
                <span class="pointer ml-2 far fa-check-circle"
                  id="sideBarTxt"
                  v-if="props.row.status == 0"
                  v-on:click="changeStatus(props.row, 1, 'Active')"
                  title="Active"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit chart of account records -->
        <div class="row pl-4"
          v-if="!loading && accounts.length">
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
              @input="getChartOfAccounts(filterEquation, 1)"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New chart of account button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-chart-of-account-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Chart Of Account</base-button>
        </div>
      </card>
      <!-- NEW CHART OF ACCOUNT MODAL -->
      <b-modal size="lg"
        id="new-chart-of-account-modal"
        title="New Chart of Account" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Account:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Account Equation:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newAccount"
              id="inputStyle"
              type="text"
              placeholder="Account"></base-input>
            <i class="text-red"
              v-if="$v.newAccount.$anyDirty && !$v.newAccount.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newAccount.$anyDirty && !$v.newAccount.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="accountEquations"
              :reduce="equation => equation.accountEquationId"
              label="accountEquation"
              v-model="newAccountEquation"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.newAccountEquation.$anyDirty && !$v.newAccountEquation.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Account Code:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Account Type:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newAccountCode"
              id="inputStyle"
              type="text"
              placeholder="Account Code"></base-input>
            <i class="text-red"
              v-if="$v.newAccountCode.$anyDirty && !$v.newAccountCode.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newAccountCode.$anyDirty && !$v.newAccountCode.numCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="accountTypes"
              :reduce="type => type.accountType"
              label="accountType"
              v-model="newAccountType"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.newAccountType.$anyDirty && !$v.newAccountType.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Method Type:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Enterprise:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="methodTypes"
              :reduce="method => method.methodType"
              label="methodType"
              v-model="newMethodType"
              :clearable="false"></v-select>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="enterprises"
              :reduce="enterprise => enterprise.enterpriseId"
              label="enterprise"
              v-model="newEnterprise"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.newEnterprise.$anyDirty && !$v.newEnterprise.required">Field Required</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addChartOfAccount"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-chart-of-account-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT CHART OF ACCOUNT MODAL -->
      <b-modal size="lg"
        id="edit-chart-of-account-modal"
        title="Edit Chart of Account" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Account:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Account Code:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.account"
              id="inputStyle"
              type="text"
              placeholder="Account"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.account.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.account.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.accountCode"
              id="inputStyle"
              type="text"
              placeholder="Account Code"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.accountCode.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.accountCode.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Account Type:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Method Type:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="accountTypes"
              :reduce="type => type.accountType"
              label="accountType"
              v-model="edit.accountType"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.accountType.required">Field Required</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="methodTypes"
              :reduce="method => method.methodType"
              label="methodType"
              v-model="edit.methodType"
              :clearable="false"></v-select>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Enterprise:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="enterprises"
              :reduce="enterprise => enterprise.enterpriseId"
              label="enterprise"
              v-model="edit.enterprise"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.enterprise.required">Field Required</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateAccount"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-chart-of-account-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbMains, dbExpense} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {mapGetters} from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Chart of account table
        columns: [{
            label: 'Account',
            field: 'account'
          },{
            label: 'Code',
            field: 'code'
          },{
            label: 'Account Type',
            field: 'accountType'
          },{
            label: 'Method',
            field: 'methodType'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: 'Status',
            field: 'status'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '80px'
          }
        ],
        loading: false,
        filterEquation: '',
        accounts: [],
        requestProcessing: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        stat: 1,
        accountEquations: [],
        // Account type selection
        accountTypes: [
          {'accountType': 'Journal Accounts'},
          {'accountType': 'Financial Statement Accounts'}
        ],
        // Method type selection
        methodTypes: [
          {'methodType': 'Periodic'},
          {'methodType': 'Perpetual'}
        ],
        // New chart of account
        newAccount: '',
        newAccountEquation: '',
        newAccountCode: '',
        newAccountType: 'Journal Accounts',
        newMethodType: '',
        newEnterprise: '',
        // Enterprise selection
        enterprises: [],
        // Edit chart of account
        edit: {
          id: '',
          accountId: '',
          account: '',
          accountCode: '',
          accountType: '',
          methodType: '',
          enterprise: ''
        }
      };
    },
    // Check the user role
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
      this.getAccountEquations();
      this.getEnterprises();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New chart of account
      newAccount: {
        required,
        alphaNumCustomValidator
      },
      newAccountEquation: {required},
      newAccountCode: {
        required,
        numCustomValidator
      },
      newAccountType: {required},
      newEnterprise: {required},
      // Edit chart of account
      edit: {
        account: {
          required,
          alphaNumCustomValidator
        },
        accountCode: {
          required,
          numCustomValidator
        },
        accountType: {required},
        enterprise: {required}
      }
    },
    methods: {
      // Get account equation data
      getAccountEquations(){
        let self = this;
        let equations = dbMains.collection("accountEquations")
          .orderBy("code","asc");

        self.accountEquations = [];
        equations.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.accountEquations.push(doc.data());
          });
          self.newAccountEquation = self.accountEquations[0].accountEquationId;
          self.getChartOfAccounts(self.accountEquations[0].accountEquationId, 1);
        });
      },
      // Get all enterprise data
      getEnterprises(){
        let self = this;
        let enterpriseData = dbExpense.collection("enterprises")
          .orderBy("enterprise","asc");

        self.enterprises = [];
        enterpriseData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.enterprises.push(doc.data());
          });
          self.newEnterprise = self.enterprises[0].enterpriseId;
        });
      },
      // Add new chart of account data
      addChartOfAccount(){
        let self = this;

        self.$v.newAccount.$touch();
        self.$v.newAccountType.$touch();
        self.$v.newAccountEquation.$touch();
        self.$v.newAccountCode.$touch();
        self.$v.newEnterprise.$touch();
        if(!self.$v.newAccount.$error && !self.$v.newAccountEquation.$error && !self.$v.newAccountType.$error && !self.$v.newAccountCode.$error && !self.$v.newEnterprise.$error){
          self.requestProcessing = true;
          let account = dbMains.collection('chartOfAccounts')
            .where("account","==",self.newAccount)
            .where("accountEquationReference","==", self.newAccountEquation)
            .where("accountType","==",self.newAccountType);

          account.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Account already exists.',
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
              let dataId = 'COAI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('chartOfAccounts').doc()
                  .set({
                    accountId: dataId,
                    account: self.newAccount,
                    code: self.newAccountCode,
                    accountEquationReference: self.newAccountEquation,
                    accountType: self.newAccountType,
                    methodType: self.newMethodType,
                    enterpriseReference: self.newEnterprise,
                    status: 1,
                    userReference: users[0].userId,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.getChartOfAccounts(self.newAccountEquation, 1);
                    self.newAccount = '';
                    self.newAccountEquation = '';
                    self.newAccountCode = '';
                    self.newAccountType = 'Journal Accounts';
                    self.newMethodType = '';
                    self.newEnterprise = '';
                    self.requestProcessing = false;
                    self.$v.newAccount.$reset();
                    self.$v.newAccountEquation.$reset();
                    self.$v.newAccountType.$reset();
                    self.$v.newAccountCode.$reset();
                    self.$v.newEnterprise.$reset();
                    self.getEnterprises();
                    self.$bvModal.hide('new-chart-of-account-modal');
                    self.$refs['coa-table'].reset();
                    self.$swal({
                      title: 'Success',
                      text: 'New account added successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  });
                }catch(error) {
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
              });
            }
          });
        }
      },
      // Get chart of account data for table list
      getChartOfAccounts(filter, stat) {
        let self = this, accountData = null, coas = [], ids = [];

        self.loading = true;
        self.accounts = [];
        self.filterEquation = filter;
        self.stat = stat;
        if(self.limit != "all"){
          accountData = dbMains.collection("chartOfAccounts")
            .where("accountEquationReference","==",filter)
            .where("status","==",stat)
            .orderBy("code", "asc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          accountData = dbMains.collection("chartOfAccounts")
            .where("accountEquationReference","==",filter)
            .where("status","==",stat)
            .orderBy("code", "asc");
        }
        accountData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              coas.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < coas.length; i++){
              coas[i]["id"] = ids[i];
              self.accounts.push(coas[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Open edit chart of account modal
      openUpdateAccountModal(row){
        this.edit = {
          id: row.id,
          accountId: row.accountId,
          account: row.account,
          accountCode: row.code,
          accountType: row.accountType,
          methodType: row.methodType,
          enterprise: row.enterpriseReference
        }
        this.$bvModal.show('edit-chart-of-account-modal');
      },
      // Change chart of account modal
      updateAccount(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          let accountData = dbMains.collection('chartOfAccounts')
            .where("account", "==", self.edit.account)
            .where("accountId", "!=", self.edit.accountId);

          accountData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Account already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("chartOfAccounts")
                .doc(self.edit.id)
                .update({
                  account: self.edit.account,
                  code: self.edit.accountCode,
                  accountType: self.edit.accountType,
                  methodType: self.edit.methodType,
                  enterpriseReference: self.edit.enterprise,
                  dateModified: today
                }).then(() => {
                  self.edit= {};
                  self.$v.edit.$reset();
                  self.$bvModal.hide('edit-chart-of-account-modal');
                  self.requestProcessing = false;
                  self.getChartOfAccounts(self.filterEquation, 1);
                  self.$refs['coa-table'].reset();
                  self.$swal({
                    title: 'Success',
                    text: 'Account updated successfully!',
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
              }catch(error){
                console.log(error);
              }
            }
          });
        }
      },
      // Change chart of account status
      changeStatus(row, stat, msg){
        let self = this;

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
            try{
              dbMains.collection("chartOfAccounts")
              .doc(row.id)
              .update({
                status: stat,
                dateModified: today
              }).then(() => {
                self.$swal({
                  title: "Success",
                  text: "Account change status to " + msg + ".",
                  icon: "success",
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.$refs['coa-table'].reset();
                  self.getChartOfAccounts(self.filterEquation, stat);
                });
              });
            }catch(error){
              console.log(error);
              self.$swal({
                title: "Error",
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
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>