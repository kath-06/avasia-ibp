<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <!-- Enterprise status links -->
        <div class="row">
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="activeBadge"
                v-if="listStatus == 1"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getEnterprise(1)">Active</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="activeBadge"
                v-if="listStatus == 0"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getEnterprise(0)">Disabled</span>
            </badge>
          </div>
        </div>
        <div class="table-full-width">
          <!-- Enterprise list table -->
          <vue-good-table :columns="columns"
            :rows="enterprises"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="enterprise-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'enterprise'">
                <span>{{props.row.enterprise}}</span>
              </span>
              <span v-if="props.column.field == 'status'">
                <span>{{props.row.status == 1 ? 'Active' : 'Disabled'}}</span>
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
                  v-if="props.row.status == 1"
                  v-on:click="openEditEnterpriseModal(props.row)"
                  title="Update"></span>
                <span class="pointer ml-2 far fa-times-circle"
                  id="sideBarTxt"
                  v-if="props.row.status == 1"
                  v-on:click="changeStatus(props.row,0,'Disable')"
                  title="Disable"></span>
                <span class="pointer ml-2 far fa-check-circle"
                  id="sideBarTxt"
                  v-if="props.row.status == 0"
                  v-on:click="changeStatus(props.row,1,'Active')"
                  title="Active"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit record on table -->
        <div class="row pl-4"
          v-if="!loading && enterprises.length">
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
              @input="getEnterprise(1)"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New Enterprise button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-enterprise-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Enterprise</base-button>
        </div>
      </card>
      <!-- NEW ENTERPRISE MODAL -->
      <b-modal size="md"
        id="new-enterprise-modal"
        title="New Enterprise" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Enterprise:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newEnterprise"
              id="inputStyle"
              type="text"
              placeholder="Enterprise"></base-input>
            <i class="text-red"
              v-if="$v.newEnterprise.$anyDirty && !$v.newEnterprise.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newEnterprise.$anyDirty && !$v.newEnterprise.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addEnterprise"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-enterprise-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT ENTERPRISE MODAL -->
      <b-modal size="md"
        id="edit-enterprise-modal"
        title="Edit Enterprise" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Enterprise:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="edit.enterprise"
              id="inputStyle"
              type="text"
              placeholder="Enterprise"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.enterprise.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.enterprise.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateEnterprise"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-enterprise-modal')"
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
  import { mapGetters } from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./&,]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Enterprise table
        columns: [{
            label: 'Enterprise',
            field: 'enterprise'
          },{
            label: 'Status',
            field: 'status',
            sortable: false
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '80px'
          }
        ],
        loading: true,
        enterprises: [],
        // Enable or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // New enterprise
        newEnterprise: '',
        // Edit enterprise
        edit: {
          id: '',
          enterpriseId: '',
          enterprise: ''
        },
        listStatus: 1
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
      this.getEnterprise(1);
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New enterprise validations
      newEnterprise: {
        required,
        alphaNumCustomValidator
      },
      // Edit enterprise validations
      edit: {
        enterprise: {
          required,
          alphaNumCustomValidator
        }
      }
    },
    methods: {
      // Save new enterprise details
      addEnterprise(){
        let self = this;

        self.$v.newEnterprise.$touch();
        if(!self.$v.newEnterprise.$error){
          self.requestProcessing = true;
          let checkEnterprise = dbExpense.collection('enterprises')
            .where("enterprise", "==", upperCase(self.newEnterprise));

          checkEnterprise.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Enterprise already exists.',
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
              let dataId = 'PEI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbExpense.collection('enterprises').doc()
                  .set({
                    enterpriseId: dataId,
                    enterprise: upperCase(self.newEnterprise),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newEnterprise = '';
                    self.requestProcessing = false;
                    self.$v.newEnterprise.$reset();
                    self.$refs['enterprise-table'].reset();
                    self.getEnterprise(1);
                    self.$bvModal.hide('new-enterprise-modal');
                    self.$swal({
                      title: 'Success',
                      text: 'New enterprise added successfully!',
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
      // Display enterprise details for the table
      getEnterprise(stat) {
        let self = this, enterpriseData = null, enterps = [], ids = [];

        self.loading = true;
        self.enterprises = [];
        self.listStatus = stat;
        if(self.limit != "all"){
          enterpriseData = dbExpense.collection("enterprises")
            .where("status","==",stat)
            .orderBy("enterprise", "asc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          enterpriseData = dbExpense.collection("enterprises")
            .where("status","==",stat)
            .orderBy("enterprise", "asc");
        }
        enterpriseData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              enterps.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < enterps.length; i++){
              enterps[i]["id"] = ids[i];
              self.enterprises.push(enterps[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Show edit enterprise form
      openEditEnterpriseModal(row){
        this.edit = {
          id: row.id,
          enterpriseId: row.enterpriseId,
          enterprise: row.enterprise
        }
        this.$bvModal.show('edit-enterprise-modal');
      },
      // Change enterprise details
      updateEnterprise(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          let checkEnterprise = dbExpense.collection('enterprises')
            .where("enterprise", "==", upperCase(self.edit.enterprise))
            .where("enterpriseId", "!=", self.edit.enterpriseId);

          checkEnterprise.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Enterprise already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbExpense.collection("enterprises")
                .doc(self.edit.id)
                .update({
                  enterprise: upperCase(self.edit.enterprise),
                  dateModified: today
                }).then(() => {
                  self.$v.edit.$reset();
                  self.$bvModal.hide('edit-enterprise-modal');
                  self.requestProcessing = false;
                  self.$refs['enterprise-table'].reset();
                  self.getEnterprise(1);
                  self.$swal({
                    title: 'Success',
                    text: 'Enterprise updated successfully!',
                    icon: 'success',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
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
        }
      },
      // Change enterprise status
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
              dbExpense.collection("enterprises")
              .doc(row.id)
              .update({
                status: stat,
                dateModified: today
              }).then(() => {
                self.$swal({
                  title: "Success",
                  text: "Enterprise status to " + msg + ".",
                  icon: "success",
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.getEnterprise(stat);
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