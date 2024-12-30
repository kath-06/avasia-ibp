<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <div class="row">
          <!-- Business type status links -->
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getBusinessTypes(1)">Active</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="redBg"></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getBusinessTypes(0)">Disabled</span>
            </badge>
          </div>
        </div>
        <div class="table-full-width">
          <!-- Business type list table -->
          <vue-good-table :columns="columns"
            :rows="businessTypes"
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
              <b><span v-if="props.column.field == 'type'">
                <span>{{props.row.type}}</span>
              </span>
              <span v-if="props.column.field == 'status'">
                <span>{{props.row.status == 1 ? 'Active' : 'Disabled'}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-if="props.row.status == 1"
                  v-on:click="openUpdateBusinessTypeModal(props.row)"
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
        <!-- Business type limit records on table -->
        <div class="row pl-4"
          v-if="!loading && businessTypes.length">
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
              @input="getBusinessTypes(1)"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New business type button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-business-type-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Business Type</base-button>
        </div>
      </card>
      <!-- NEW BUSINESS TYPE MODAL -->
      <b-modal size="md"
        id="new-business-type-modal"
        title="New Business Type" centered
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
              placeholder="Type"></base-input>
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
                @click.native="addBusinessType"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-business-type-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT BUSINESS TYPE MODAL -->
      <b-modal size="md"
        id="edit-business-type-modal"
        title="Edit Business Type" centered
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
              id="inputStyle"
              type="text"
              placeholder="Type"></base-input>
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
                @click.native="updateBusinessType"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-business-type-modal')"
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

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./,]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Business type table
        columns: [{
            label: 'Business Type',
            field: 'type'
          },{
            label: 'Status',
            field: 'status',
            sortable: false
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '80px'
          }
        ],
        loading: true,
        businessTypes: [],
        requestProcessing: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // New business type
        newType: '',
        // Edit business type
        edit: {
          id: '',
          typeId: '',
          type: ''
        }
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
      this.getBusinessTypes(1);
    },
    validations: {
      // New business type validation
      newType: {
        required,
        alphaNumCustomValidator
      },
      // Edit business type validation
      edit: {
        type: {
          required,
          alphaNumCustomValidator
        }
      }
    },
    methods: {
      // Add new business type data
      addBusinessType(){
        let self = this;

        self.$v.newType.$touch();
        if(!self.$v.newType.$error){
          self.requestProcessing = true;
          let businessType = dbMains.collection('businessTypes')
            .where("type", "==", upperCase(self.newType));

          businessType.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Business type already exists.',
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
              let dataId = 'BTI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('businessTypes').doc()
                  .set({
                    businessTypeId: dataId,
                    type: upperCase(self.newType),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newType = '';
                    self.requestProcessing = false;
                    self.$v.newType.$reset();
                    self.getBusinessTypes(1);
                    self.$bvModal.hide('new-business-type-modal');
                    self.$swal({
                      title: 'Success',
                      text: 'New business type added successfully!',
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
      // Get business type data for the table list
      getBusinessTypes(stat) {
        let self = this, typeData = null, types = [], ids = [];

        self.loading = true;
        self.businessTypes = [];
        if(self.limit != "all"){
          typeData = dbMains.collection("businessTypes")
            .where("status","==",stat)
            .orderBy("type", "asc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          typeData = dbMains.collection("businessTypes")
            .where("status","==",stat)
            .orderBy("type", "asc");
        }
        typeData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              types.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < types.length; i++){
              types[i]["id"] = ids[i];
              self.businessTypes.push(types[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Open edit business type modal
      openUpdateBusinessTypeModal(row){
        this.edit = {
          id: row.id,
          typeId: row.businessTypeId,
          type: row.type
        }
        this.$bvModal.show('edit-business-type-modal');
      },
      // Change business type details
      updateBusinessType(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          let typeData = dbMains.collection('businessTypes')
            .where("type", "==", upperCase(self.edit.type))
            .where("businessTypeId", "!=", self.edit.typeId);

          typeData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Business type already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("businessTypes")
                .doc(self.edit.id)
                .update({
                  type: upperCase(self.edit.type),
                  dateModified: today
                }).then(() => {
                  self.$v.edit.$reset();
                  self.$bvModal.hide('edit-business-type-modal');
                  self.requestProcessing = false;
                  self.getBusinessTypes(1);
                  self.$swal({
                    title: 'Success',
                    text: 'Business type updated successfully!',
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
      // Change business type status
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
              dbMains.collection("businessTypes")
              .doc(row.id)
              .update({
                status: stat,
                dateModified: today
              }).then(() => {
                self.$swal({
                  title: "Success",
                  text: "Business type status to " + msg + ".",
                  icon: "success",
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.getBusinessTypes(stat);
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