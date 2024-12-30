<template>
  <div id="textStyle"> 
      <card class="pt-4">
        <!-- E wallet account table -->
        <vue-good-table :columns="columns"
          :rows="eWalletAccounts"
          :search-options="{enabled: true}"
          :pagination-options="{
            enabled: true,
            perPageDropdown: [10, 15, 20],
          }"
          :sort-options="{
            enabled: true,
            initialSortBy: {
              field: 'eWalletAccountName',
              type: 'asc'
            }
          }"
          :line-numbers="true"
          :isLoading="loading"
          ref="ew-account-table">
          <template slot="table-row"
            slot-scope="props">
            <b><span v-if="props.column.field == 'eWalletAccountName'">
              <span>{{props.row.eWalletAccountName}}</span>
            </span>
            <span v-if="props.column.field == 'eWalletAccountNumber'">
              <span>{{props.row.eWalletAccountNumber}}</span>
            </span>
            <span v-if="props.column.field == 'eWallet'">
              <span>{{props.row.eWallet}}</span>
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
                v-on:click="openUpdateEWalletAccountModal(props.row)"
                title="Update"></span>
            </span></b>
          </template>
        </vue-good-table>
        <hr class="mb-2 mt-2">
        <!-- Limit records on table -->
        <div class="row pl-4 pt-2"
          v-if="!loading && eWalletAccounts.length">
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
              @input="getPaginatedEWalletAccounts()"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New e wallet account button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-e-wallet-account-modal
            id="darkBtn">New E Wallet Account</base-button>
        </div>
      </card>
      <!-- ADD E WALLET ACCOUNT MODAL -->
      <b-modal size="lg"
        id="new-e-wallet-account-modal"
        title="New E Wallet Account" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>E Wallet Account Name:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>E Wallet Account Number:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newEAccountName"
              type="text"
              id="inputStyle"
              placeholder="Account Name"></base-input>
            <i class="text-red"
              v-if="$v.newEAccountName.$anyDirty && !$v.newEAccountName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newEAccountName.$anyDirty && !$v.newEAccountName.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newEAccountNumber"
              type="text"
              id="inputStyle"
              placeholder="Account Number"></base-input>
            <i class="text-red"
              v-if="$v.newEAccountNumber.$anyDirty && !$v.newEAccountNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newEAccountNumber.$anyDirty && !$v.newEAccountNumber.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>E Wallet:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="eWallets"
              :reduce="ew => ew.eWalletId"
              label="eWalletName"
              v-model="newEWallet"
              :clearable="false">
            </v-select>
            <i class="text-red"
              v-if="$v.newEWallet.$anyDirty && !$v.newEWallet.required">Field Required</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addEWalletAccount"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-e-wallet-account-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE E WALLET ACCOUNT MODAL -->
      <b-modal size="lg"
        id="update-e-wallet-account-modal"
        title="Edit E Wallet Account" centered
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
            <base-input v-model="edit.eAccountName"
              type="text"
              id="inputStyle"
              placeholder="Account Name"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.eAccountName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.eAccountName.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.eAccountNumber"
              type="text"
              id="inputStyle"
              placeholder="Account Number"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.eAccountNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.eAccountNumber.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>E Wallet:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="eWallets"
              :reduce="ew => ew.eWalletId"
              label="eWalletName"
              v-model="edit.eWallet"
              :clearable="false">
            </v-select>
            <i class="text-red"
              v-if="$v.edit.eWallet.$anyDirty && !$v.edit.eWallet.required">Field Required</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateEWalletAccount"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-e-wallet-account-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
  </div>
</template>
<script>
  import {dbUsers, dbMains} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {mapGetters} from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    name: "e-wallet-account",
    components: {},
     data() {
      return {
        // E wallet account table
        columns: [{
            label: 'Account Name',
            field: 'eWalletAccountName',
          },{
            label: 'Account No',
            field: 'eWalletAccountNumber',
          },{
            label: 'E Wallet',
            field: 'eWallet'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
          }
        ],
        loading: true,
        eWalletAccounts: [],
        eWallets: [],
        // New e wallet account
        newEAccountName: '',
        newEAccountNumber: '',
        newEWallet: '',
        // Edit e wallet account
        edit: {
          id: '',
          ewAccountId: '',
          eAccountName: '',
          eAccountNumber: '',
          eWallet: ''
        },
        // Enalble or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
      };
    },
    validations: {
      // New e wallet account validations
      newEAccountName: {
        required,
        alphaNumCustomValidator
      },
      newEAccountNumber: {
        required,
        alphaNumCustomValidator
      },
      newEWallet: {required},
      // Edit e wallet account validations
      edit: {
        eAccountName: {
          required,
          alphaNumCustomValidator
        },
        eAccountNumber: {
          required,
          alphaNumCustomValidator
        },
        eWallet: {required},
      },
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
      this.getPaginatedEWalletAccounts();
      this.getEWallets();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    methods: {
      // Display e wallet account details on table
      getPaginatedEWalletAccounts() {
        let self = this, ewAccountData = null, ews = [], ids = [];

        self.loading = true;
        self.eWalletAccounts = [];
        if(self.limit != 'all'){
          ewAccountData = dbMains.collection("eWalletAccounts")
            .orderBy("eWalletAccountName", "asc")
            .limit(self.limit);
        }else if(self.limit == 'all'){
           ewAccountData = dbMains.collection("eWalletAccounts")
            .orderBy("eWalletAccountName", "asc");
        }
        ewAccountData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              ews.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < ews.length; i++){
              ews[i]["id"] = ids[i];
            }
            for(let j = 0; j < ews.length; j++){
              ews[j]["rowNum"] = 1 + j;
              ews[j]["eWallet"] = '';
              let getEW = dbMains.collection("eWallets");
              let wallets = [];

              getEW.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  wallets.push(doc.data());
                });
                for(let k = 0; k < wallets.length; k++){
                  if(ews[j].eWalletReference == wallets[k].eWalletId){
                    ews[j].eWallet = wallets[k].eWalletName;
                  }
                }
                self.eWalletAccounts.push(ews[j]);
              });
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Get e wallet details
      getEWallets(){
        let self = this;
        let ewData = dbMains.collection("eWallets")
          .orderBy("eWalletName", "asc");

        self.eWallets = [];
        ewData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.eWallets.push(doc.data());
          });
          self.newEWallet = self.eWallets[0].eWalletId;
        });
      },
      // Save new e wallet account details
      addEWalletAccount(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newEAccountName.$touch();
        self.$v.newEAccountNumber.$touch();
        self.$v.newEWallet.$touch();
        if(!self.$v.newEAccountName.$error && !self.$v.newEAccountNumber.$error && !self.$v.newEWallet.$error){
          self.requestProcessing = true;
          let ewAccountData = null;

          ewAccountData = dbMains.collection('eWalletAccounts')
            .where("eWalletAccountNumber", "==", self.newEAccountNumber)
            .where("eWalletReference","==",self.newEWallet);
          ewAccountData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'E Wallet Account already exists.',
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
              let dataId = 'EWAI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try {
                  dbMains.collection('eWalletAccounts').doc()
                  .set({
                    eWalletAccountId: dataId,
                    eWalletAccountName: self.newEAccountName,
                    eWalletAccountNumber: self.newEAccountNumber,
                    eWalletReference: self.newEWallet,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newEAccountName = '';
                    self.newEAccountNumber = '';
                    self.newEWallet = '';
                    self.$v.newEAccountName.$reset();
                    self.$v.newEAccountNumber.$reset();
                    self.$v.newEWallet.$reset();
                    self.requestProcessing = false;
                    self.$bvModal.hide('new-e-wallet-account-modal');
                    self.$refs['ew-account-table'].reset();
                    self.getEWallets();
                    self.getPaginatedEWalletAccounts();
                    self.$swal({
                      title: 'Success',
                      text: 'New E Wallet Account added successfully!',
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
      // Show edit e wallet account form
      openUpdateEWalletAccountModal(account){
        this.edit = {
          id: account.id,
          ewAccountId: account.eWalletAccountId,
          eAccountName: account.eWalletAccountName,
          eAccountNumber: account.eWalletAccountNumber,
          eWallet: account.eWalletReference
        }
        this.$bvModal.show('update-e-wallet-account-modal');
      },
      // Change e wallet account details
      updateEWalletAccount(){
        let self = this;

        self.requestProcessing = false;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let ewAccountData = null;

          self.requestProcessing = true;
          ewAccountData = dbMains.collection('eWalletAccounts')
            .where("eWalletAccountNumber", "==", self.edit.eAccountNumber)
            .where("eWalletReference","==",self.edit.eWallet)
            .where("eWalletAccountId", "!=", self.edit.ewAccountId);
          ewAccountData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'E Wallet Account already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("eWalletAccounts")
                .doc(self.edit.id)
                .update({
                  eWalletAccountName: self.edit.eAccountName,
                  eWalletAccountNumber: self.edit.eAccountNumber,
                  eWalletReference: self.edit.eWallet,
                  dateModified: today
                }).then(() => {
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-e-wallet-account-modal');
                  self.$refs['ew-account-table'].reset();
                  self.getPaginatedEWalletAccounts();
                  self.requestProcessing = false;
                  self.$swal({
                    title: 'Success',
                    text: 'E Wallet Account updated successfully!',
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