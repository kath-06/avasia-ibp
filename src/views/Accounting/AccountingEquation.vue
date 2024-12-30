<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <div class="table-full-width">
          <!-- Accounting equation list table -->
          <vue-good-table :columns="columns"
            :rows="accountEquations"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="acct-equation-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'accountEquation'">
                <span>{{props.row.accountEquation}}</span>
              </span>
              <span v-if="props.column.field == 'code'">
                <span>{{props.row.code}}</span>
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
                  v-on:click="openUpdateAccountEquationModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Accounting equation list limit records on table -->
        <div class="row pl-4"
          v-if="!loading && accountEquations.length">
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
              @input="getAccountEquations()"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New accounting equation button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-accounting-equation-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Accounting Equation</base-button>
        </div>
      </card>
      <!-- NEW ACCOUNTING EQUATION MODAL -->
      <b-modal size="lg"
        id="new-accounting-equation-modal"
        title="New Accounting Equation" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Accounting Equation:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Code:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newEquation"
              id="inputStyle"
              type="text"
              placeholder="Accounting Equation"></base-input>
            <i class="text-red"
              v-if="$v.newEquation.$anyDirty && !$v.newEquation.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newEquation.$anyDirty && !$v.newEquation.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newCode"
              id="inputStyle"
              type="text"
              placeholder="Code"></base-input>
            <i class="text-red"
              v-if="$v.newCode.$anyDirty && !$v.newCode.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newCode.$anyDirty && !$v.newCode.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addAccountingEquation"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-accounting-equation-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT ACCOUNTING EQUATION MODAL -->
      <b-modal size="lg"
        id="edit-account-equation-modal"
        title="Edit Chart of Account" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Accounting Equation:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Code:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.equation"
              id="inputStyle"
              type="text"
              placeholder="Accounting Equation"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.equation.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.equation.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.code"
              id="inputStyle"
              type="text"
              placeholder="Code"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.code.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.code.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateAccountEquation"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-account-equation-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbMains} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {upperCase} from "text-case";
  import {mapGetters} from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./,]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Accounting euqtion table
        columns: [{
            label: 'Account Equation',
            field: 'accountEquation'
          },{
            label: 'Code',
            field: 'code'
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
        accountEquations: [],
        requestProcessing: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // Add new eqation
        newEquation: '',
        newCode: '',
        // Update equation
        edit: {
          id: '',
          equationId: '',
          equation: '',
          code: ''
        }
      };
    },
    // CHECK IF USER IS ADMINISTRATOR
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
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New accounting equation validation
      newEquation: {
        required,
        alphaNumCustomValidator
      },
      newCode: {
        required,
        numCustomValidator
      },
      // Edit accounting equation validation
      edit: {
        equation: {
          required,
          alphaNumCustomValidator
        },
        code: {
          required,
          numCustomValidator
        }
      }
    },
    methods: {
      // ADDING NEW ACCOUNTING EQUATION
      addAccountingEquation(){
        let self = this;

        self.$v.newEquation.$touch();
        self.$v.newCode.$touch();
        if(!self.$v.newEquation.$error && !self.$v.newCode.$error){
          self.requestProcessing = true;
          let checkEquation = dbMains.collection('accountEquations')
            .where("accountEquation", "==", upperCase(self.newEquation));
          checkEquation.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Account equation already exists.',
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
              let dataId = 'AEI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('accountEquations').doc()
                  .set({
                    accountEquationId: dataId,
                    accountEquation: upperCase(self.newEquation),
                    code: self.newCode,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newEquation = '';
                    self.newCode = '';
                    self.requestProcessing = false;
                    self.$v.newEquation.$reset();
                    self.$v.newCode.$reset();

                    self.getAccountEquations();
                    self.$bvModal.hide('new-accounting-equation-modal');
                    self.$swal({
                      title: 'Success',
                      text: 'New account equation added successfully!',
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
      // Get accounting eqaution data
      getAccountEquations() {
        let self = this, equationData = null, equations = [], ids = [];

        self.loading = true;
        self.accountEquations = [];
        if(self.limit != "all"){
          equationData = dbMains.collection("accountEquations")
            .orderBy("accountEquation", "asc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          equationData = dbMains.collection("accountEquations")
            .orderBy("accountEquation", "asc");
        }
        equationData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              equations.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < equations.length; i++){
              equations[i]["id"] = ids[i];
              self.accountEquations.push(equations[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
        self.$store.dispatch("ChartOfAccounts/getAccountingEquations");
      },
      // Open edit account equation modal
      openUpdateAccountEquationModal(row){
        this.edit = {
          id: row.id,
          equationId: row.accountEquationId,
          equation: row.accountEquation,
          code: row.code
        }
        this.$bvModal.show('edit-account-equation-modal');
      },
      // update account equation data
      updateAccountEquation(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          let equationData = dbMains.collection('accountEquations')
            .where("accountEquation", "==", upperCase(self.edit.equation))
            .where("accountEquationId", "!=", self.edit.equationId);

          equationData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Accounting equation already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("accountEquations")
                .doc(self.edit.id)
                .update({
                  accountEquation: upperCase(self.edit.equation),
                  code: self.edit.code,
                  dateModified: today
                }).then(() => {
                  let accountData = dbMains.collection("chartOfAccounts")
                    .where("accountEquationReference","==",self.edit.equationId);
                  let ids = [], accounts = [];

                  accountData.get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      ids.push(doc.id);
                      accounts.push(doc.data());
                    });
                    for(let a = 0; a < accounts.length; a++){
                      dbMains.collection("chartOfAccounts")
                      .doc(ids[a])
                      .update({
                        code: self.edit.code + '' + accounts[a].code.slice(1),
                        dateModified: today
                      });
                    }
                  });
                  self.$v.edit.$reset();
                  self.$bvModal.hide('edit-account-equation-modal');
                  self.requestProcessing = false;
                  self.$refs['acct-equation-table'].reset();
                  self.getAccountEquations();
                  self.$swal({
                    title: 'Success',
                    text: 'Account equation updated successfully!',
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
    }
  };
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>