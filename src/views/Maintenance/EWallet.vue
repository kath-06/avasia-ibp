<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <tabs fill class="flex-column flex-md-row">
        <tab-pane title="E Wallets">
          <card class="pt-4"
            id="textStyle">
              <!-- E wallet table -->
              <vue-good-table :columns="columns"
                :rows="eWallets"
                :search-options="{enabled: true,}"
                :pagination-options="{
                  enabled: true,
                  perPageDropdown: [10, 15, 20],
                }"
                :sort-options="{
                  enabled: true,
                  initialSortBy: {
                    field: 'eWalletName',
                    type: 'asc'
                  }
                }"
                :line-numbers="true"
                :isLoading="loading"
                ref="e-wallet-table">
                <template slot="table-row"
                  slot-scope="props">
                  <b><span v-if="props.column.field == 'eWalletName'">
                    <span>{{props.row.eWalletName}}</span>
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
                      v-on:click="openUpdateEWalletModal(props.row)"
                      title="Update"></span>
                  </span></b>
                </template>
              </vue-good-table>
              <hr class="mb-2 mt-2">
              <!-- Limit records on table -->
              <div class="row pl-4 pt-2"
                v-if="!loading && eWallets.length">
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
                    @input="getPaginatedEWallets(1, '')"></v-select>
                </span>
              </div>
              <hr class="mb-2 mt-2">
              <!-- New e wallet buttons -->
              <div class="text-right pt-2">
                <base-button v-b-modal.new-e-wallet-modal
                  id="darkBtn"
                  class="col-md-2 ml-2 mr-2">New E Wallet</base-button>
              </div>
            </card>
        </tab-pane>
        <tab-pane title="E Wallet Accounts">
          <e-wallet-account></e-wallet-account>
        </tab-pane>
      </tabs>
      <!-- ADD E WALLET MODAL -->
      <b-modal size="md"
        id="new-e-wallet-modal"
        title="New E Wallet" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>E Wallet:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newEWallet"
              id="inputStyle"
              type="text"
              placeholder="E Wallet"></base-input>
            <i class="text-red"
              v-if="$v.newEWallet.$anyDirty && !$v.newEWallet.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newEWallet.$anyDirty && !$v.newEWallet.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addEWallet"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-e-wallet-modal')"
                :disabled="requestProcessing">
                Close
              </base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE E WALLET MODAL -->
      <b-modal size="md"
        id="update-e-wallet-modal"
        title="Edit E Wallet" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>E Wallet:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="edit.eWallet"
              type="text"
              id="inputStyle"
              placeholder="E Wallet"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.eWallet.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.eWallet.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateEWallet"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-e-wallet-modal')"
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

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // E wallet table
        columns: [{
            label: 'E Wallet',
            field: 'eWalletName',
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
        eWallets: [],
        // New e wallet
        newEWallet: '',
        // Edit e wallet
        edit: {
          id: '',
          eWalletId: null,
          eWallet: ''
        },
        banksUid: '',
        // Enale or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20"
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
      this.getPaginatedEWallets();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New e wallet validations
      newEWallet: {
        required,
        alphaNumCustomValidator
      },
      // Edit e wallet validations
      edit: {
        eWallet: {
          required,
          alphaNumCustomValidator
        }
      },
    },
    methods: {
      // Display e wallet details on table
      getPaginatedEWallets() {
        let self = this, ewData = null, ews = [], ids = [];

        self.loading = true;
        self.eWallets = [];
        if(self.limit != "all"){
          ewData = dbMains.collection("eWallets")
            .orderBy("eWalletName","asc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          ewData = dbMains.collection("eWallets")
            .orderBy("eWalletName","asc");
        }
        ewData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              ews.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < ews.length; i++){
              ews[i]["rowNum"] = 1 + i;
              ews[i]["id"] = ids[i];
              self.eWallets.push(ews[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Save new e wallet details
      addEWallet(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newEWallet.$touch();
        if(!self.$v.newEWallet.$error){
          let eWalletData = null;

          self.requestProcessing = true;
          eWalletData = dbMains.collection('eWallets')
            .where("eWalletName", "==", upperCase(self.newEWallet));
          eWalletData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'E Wallet already exists.',
                    icon: 'error',
                    confirmButtonColor: '#f5365c',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              let getUserId = dbUsers.collection('users')
                .where("username", '==', localStorage.getItem('aisname'));
              let users = [];
              let dataId = 'EWI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('eWallets').doc()
                  .set({
                    eWalletId: dataId,
                    eWalletName: upperCase(self.newEWallet),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newEWallet = '';
                    self.requestProcessing = false;
                    self.$v.newEWallet.$reset();
                    self.$bvModal.hide('new-e-wallet-modal');
                    self.$refs['e-wallet-table'].reset();
                    self.getPaginatedEWallets();
                    self.$swal({
                      title: 'Success',
                      text: 'New E Wallet added successfully!',
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
      // Show eidt e wallet form
      openUpdateEWalletModal(data){
         this.edit = {
          id: data.id,
          eWalletId: data.eWalletId,
          eWallet: data.eWalletName
        }
        this.$bvModal.show('update-e-wallet-modal');
      },
      // Change e wallet details
      updateEWallet(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let ewData = null;

          ewData = dbMains.collection('eWallets')
            .where("eWalletName","==", upperCase(self.edit.eWallet))
            .where("eWalletId", "!=", self.edit.eWalletId);
          ewData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'E Wallet already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("eWallets")
                .doc(self.edit.id)
                .update({
                  eWalletName: upperCase(self.edit.eWallet),
                  dateModified: today
                }).then(() => {
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-e-wallet-modal');
                  self.requestProcessing = false;
                  self.$refs['e-wallet-table'].reset();
                  self.getPaginatedEWallets();
                  self.$swal({
                    title: 'Success',
                    text: 'E Wallet updated successfully!',
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