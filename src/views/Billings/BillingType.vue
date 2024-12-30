<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <!-- Billing type table -->
        <vue-good-table :columns="columns"
          :rows="billingTypes"
          :search-options="{enabled: true,}"
          :pagination-options="{
            enabled: true,
            perPageDropdown: [10, 15, 20],
          }"
          :sort-options="{
            enabled: true,
            initialSortBy: {
              field: 'type',
              type: 'asc'
            }
          }"
          :line-numbers="true"
          :isLoading="loading"
          ref="billing-type-table">
          <template slot="table-row"
            slot-scope="props">
            <b><span v-if="props.column.field == 'type'">
              <span>{{props.row.type}}</span>
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
                v-on:click="openUpdateBillingTypeModal(props.row)"
                title="Update"></span>
            </span></b>
          </template>
        </vue-good-table>
        <hr class="mb-2 mt-2">
        <!-- Limit records -->
        <div class="row pl-4 pt-2"
          v-if="!loading && billingTypes.length">
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
              @input="getBillingTypes(1, '')"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New billing type button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-billing-type-modal
            id="darkBtn"
            class="col-md-2 ml-2 mr-2">New Billing Type</base-button>
        </div>
      </card>
      <!-- ADD BILLING TYPE MODAL -->
      <b-modal size="md"
        id="new-billing-type-modal"
        title="New Billing Type" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Type:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newType"
              id="inputStyle"
              type="text"
              placeholder="Billing Type"></base-input>
            <i class="text-red"
              v-if="$v.newType.$anyDirty && !$v.newType.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newType.$anyDirty && !$v.newType.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addBillingType"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-billing-type-modal')"
                :disabled="requestProcessing">
                Close
              </base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT BILLING TYPE MODAL -->
      <b-modal size="md"
        id="edit-billing-type-modal"
        title="Edit Billing Type" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Type:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="edit.type"
              type="text"
              id="inputStyle"
              placeholder="E Wallet"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.type.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.type.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateBillingType"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-billing-type-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbExpense} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {upperCase} from "text-case";
  import {mapGetters} from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z -./, ]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Billing type table
        columns: [{
            label: 'Type',
            field: 'type',
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '50px'
        }],
        loading: true,
        billingTypes: [],
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // New billing type
        newType: '',
        // Edit billing type
        edit: {
          id: '',
          btId: null,
          type: ''
        },
        banksUid: '',
        // Enable or disable buttons
        requestProcessing: false,
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
      this.getBillingTypes();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New billing type validations
      newType: {
        required,
        alphaNumCustomValidator
      },
      // Edit billing type validations
      edit: {
        type: {
          required,
          alphaNumCustomValidator
        }
      },
    },
    methods: {
      // Display billing type data on table
      getBillingTypes() {
        let self = this, btData = null, bts = [], ids = [];

        self.loading = true;
        self.billingTypes = [];
        if(self.limit != "all"){
          btData = dbExpense.collection("billingTypes")
            .orderBy("type","asc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          btData = dbExpense.collection("billingTypes")
            .orderBy("type","asc");
        }
        btData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              bts.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < bts.length; i++){
              bts[i]["rowNum"] = 1 + i;
              bts[i]["id"] = ids[i];
              self.billingTypes.push(bts[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Save new billing type data
      addBillingType(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newType.$touch();
        if(!self.$v.newType.$error){
          let typeData = null;

          self.requestProcessing = true;
          typeData = dbExpense.collection('billingTypes')
            .where("type", "==", upperCase(self.newType));
          typeData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Billing type already exists.',
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
              let dataId = 'BTI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbExpense.collection('billingTypes').doc()
                  .set({
                    billingTypeId: dataId,
                    type: upperCase(self.newType),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newType = '';
                    self.requestProcessing = false;
                    self.$v.newType.$reset();
                    self.$bvModal.hide('new-billing-type-modal');
                    self.$refs['billing-type-table'].reset();
                    self.getBillingTypes();
                    self.$swal({
                      title: 'Success',
                      text: 'New billing type added successfully!',
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
      // Show edit billing type form
      openUpdateBillingTypeModal(data){
         this.edit = {
          id: data.id,
          btId: data.billingTypeId,
          type: data.type
        }
        this.$bvModal.show('edit-billing-type-modal');
      },
      // Change billing type details
      updateBillingType(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let btData = null;

          btData = dbExpense.collection('billingTypes')
            .where("type","==", upperCase(self.edit.type))
            .where("billingTypeId", "!=", self.edit.btId);
          btData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Billing type already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbExpense.collection("billingTypes")
                .doc(self.edit.id)
                .update({
                  type: upperCase(self.edit.type),
                  dateModified: today
                }).then(() => {
                  self.$v.edit.$reset();
                  self.$bvModal.hide('edit-billing-type-modal');
                  self.requestProcessing = false;
                  self.$refs['billing-type-table'].reset();
                  self.getBillingTypes();
                  self.$swal({
                    title: 'Success',
                    text: 'Billing type updated successfully!',
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