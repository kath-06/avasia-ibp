<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <!-- Service type list table -->
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="serviceTypes"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="service-type-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'type'">
                <span>{{props.row.type}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openEditServiceTypeModal(props.row)"
                  title="Edit"
                  v-if="props.row.status == 1"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit service type records -->
        <div class="row pl-4"
          v-if="!loading && serviceTypes.length">
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
              @input="getServiceTypes()"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New service type button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-service-type-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Service Type</base-button>
        </div>
      </card>
      <!-- NEW SERVICE TYPE MODAL -->
      <b-modal size="md"
        id="new-service-type-modal"
        title="New Service Type" centered
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
                @click.native="addServiceType"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-service-type-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT SERVICE TYPE MODAL -->
      <b-modal size="md"
        id="edit-service-type-modal"
        title="Edit Service Type" centered
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
              v-if="$v.edit.type.$anyDirty && !$v.edit.type.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.type.$anyDirty && !$v.edit.type.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateServiceType"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-service-type-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </div>
</template>
<script>
  import {dbUsers, dbSales} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {capitalCase} from "text-case";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./&, ]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Service type button
        columns: [{
            label: 'Service Type',
            field: 'type'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '50px'
          }
        ],
        loading: true,
        serviceTypes: [],
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // Enable/disable buttons
        requestProcessing: false,
        // New Service type
        newType: '',
        // Edit service type
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
      this.getServiceTypes();
    },
    validations: {
      // New service type validations
      newType: {
        required,
        alphaNumCustomValidator
      },
      // Edit service type validations
      edit: {
        type: {
          required,
          alphaNumCustomValidator
        }
      }
    },
    methods: {
      // Add new service type
      addServiceType(){
        let self = this;

        self.$v.newType.$touch();
        if(!self.$v.newType.$error){
          self.requestProcessing = true;
          let checkType = dbSales.collection('serviceTypes')
            .where("type", "==", capitalCase(self.newType));

          checkType.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Type already exists.',
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
              let dataId = 'STI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbSales.collection('serviceTypes').doc()
                  .set({
                    serviceTypeId: dataId,
                    type: self.newType,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newType = '';
                    self.requestProcessing = false;
                    self.$v.newType.$reset();
                    self.$refs['service-type-table'].reset();
                    self.getServiceTypes();
                    self.$bvModal.hide('new-service-type-modal');
                    self.$swal({
                      title: 'Success',
                      text: 'New service type added successfully!',
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
      // Get service type data for table list
      getServiceTypes() {
        let self = this, typeData = null, types = [], ids = [];

        self.loading = true;
        self.serviceTypes = [];
        if(self.limit != "all"){
          typeData = dbSales.collection("serviceTypes")
            .orderBy("type", "asc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          typeData = dbSales.collection("serviceTypes")
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
              self.serviceTypes.push(types[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Open edit service type modal
      openEditServiceTypeModal(row){
        this.edit = {
          id: row.id,
          typeId: row.serviceTypeId,
          type: row.type
        }
        this.$bvModal.show('edit-service-type-modal');
      },
      // Change service type data
      updateServiceType(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          let checkType = dbSales.collection('serviceTypes')
            .where("serviceTypeId","!=", self.edit.typeId)
            .where("type", "==", capitalCase(self.edit.type));

          checkType.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Service type already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbSales.collection('serviceTypes')
                .doc(self.edit.id)
                .update({
                  type: self.edit.type,
                  dateModified: today
                }).then(() => {
                  self.requestProcessing = false;
                  self.$v.edit.$reset();
                  self.$refs['service-type-table'].reset();
                  self.getServiceTypes();
                  self.$bvModal.hide('edit-service-type-modal');
                  self.$swal({
                    title: 'Success',
                    text: 'Service type updated successfully!',
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
            }
          });
        }
      },
      // Change company status
      changeStatus(id, stat, msg){
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
              dbSales.collection("company")
              .doc(id)
              .update({
                status: stat,
                dateModified: today
              }).then(() => {
                self.$swal({
                  title: "Success",
                  text: "Company status to " + msg + ".",
                  icon: "success",
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.$refs['service-type-table'].reset();
                  self.getServiceTypes();
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