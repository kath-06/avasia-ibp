<template>
  <div> 
    <card class="pt-4"
      id="textStyle">
      <!-- Remittance disbursement type status links -->
      <div class="row">
        <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
          <badge class="badge-dot ml-2 pointer">
            <i id="activeBadge"
              v-if="stat == 1"></i>
            <i id="redBg" v-else></i>
            <span class="pointer status"
              id="linkTxt"
              v-on:click="getPaginatedRDTypes(1)">Active</span>
          </badge>
          <badge class="badge-dot ml-3 pointer">
            <i id="activeBadge"
              v-if="stat == 0"></i>
            <i id="redBg" v-else></i>
            <span class="pointer status"
              id="linkTxt"
              v-on:click="getPaginatedRDTypes(0)">Disabled</span>
          </badge>
        </div>
      </div>
      <div class="table-full-width">
        <!-- Remittance disbursement type table -->
        <vue-good-table :columns="columns"
          :rows="rdTypes"
          :search-options="{enabled: true}"
          :pagination-options="{
            enabled: true,
            perPageDropdown: [10, 15, 20],
          }"
          :sort-options="{enabled: true}"
          :line-numbers="true"
          :isLoading="loading"
          ref="rd-type-table">
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
                v-if="props.row.status == 1"
                v-on:click="openUpdateRDTypeModal(props.row)"
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
      <!-- Limit records on table -->
      <div class="row pl-4"
        v-if="!loading && rdTypes.length">
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
            @input="getPaginatedRDTypes(1)"></v-select>
        </span>
      </div>
      <hr class="mb-2 mt-2">
      <!-- New remittance disbursement type button -->
      <div class="text-right pt-2">
        <base-button v-b-modal.new-remittance-disbursement-type-modal
          id="darkBtn"
          class="col-md-4 ml-2 mr-2">New Remittance Disbursement Type</base-button>
      </div>
    </card>
    <!-- ADD REMITTANCE DISBURSEMENT TYPE MODAL -->
    <b-modal size="md"
      id="new-remittance-disbursement-type-modal"
      title="New Remittance Disbursement Type" centered
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
              @click.native="addRDType"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Add
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('new-remittance-disbursement-type-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
    <!-- UPDATE REMITTANCE DISBURSEMENT TYPE MODAL -->
    <b-modal size="md"
      id="update-remittance-disbursement-type-modal"
      title="Edit Remittance Disbursement Type" centered
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
              @click.native="updateRDType"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Update
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('update-remittance-disbursement-type-modal')"
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
  import {upperCase} from "text-case";
  import {mapGetters} from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    name: "remittance-disbursement-type",
    data() {
      return {
        // Remittance disbursement type table
        columns: [{
            label: 'Type',
            field: 'type'
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
        rdTypes: [],
        loading: true,
        // Enable or disable buttons
        requestProcessing: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        stat: 1,
        // New remittance disbursement type
        newType: '',
        // Edit remittance disbursement type
        edit: {
          id: '',
          rdTypeId: '',
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
      this.getPaginatedRDTypes(1);
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New remittance disbursement type validations
      newType: {
        required,
        alphaNumCustomValidator
      },
      // Edit remittance disbursement type validations
      edit: {
        type: {
          required, alphaNumCustomValidator
        }
      }
    },
    methods: {
      // Display remittance disbursement type details on table
      getPaginatedRDTypes(stat) {
        let self = this, rdData = null, rds = [], ids = [];

        self.loading = true;
        self.rdTypes = [];
        self.stat = stat;
        if(self.limit != "all"){
          rdData = dbMains.collection("remittanceDisbursementTypes")
            .where("status","==",stat)
            .orderBy("type", "asc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          rdData = dbMains.collection("remittanceDisbursementTypes")
            .where("status","==",stat)
            .orderBy("type", "asc");
        }
        rdData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              rds.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < rds.length; i++){
              rds[i]["id"] = ids[i];
              self.rdTypes.push(rds[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Save new remittance disbursement type details
      addRDType(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newType.$touch();
        if(!self.$v.newType.$error){
          let rdData = null;

          self.requestProcessing = true;
          rdData = dbMains.collection('remittanceDisbursementTypes')
            .where("type", "==", upperCase(self.newType));
          rdData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Remittance disbursement type already exists.',
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
              let dataId = 'RDTI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('remittanceDisbursementTypes').doc()
                  .set({
                    remittanceDisbursementTypeId: dataId,
                    type: upperCase(self.newType),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newType = '';
                    self.requestProcessing = false;
                    self.$v.newType.$reset();
                    self.$bvModal.hide('new-remittance-disbursement-type-modal');
                    self.$refs['rd-type-table'].reset();
                    self.getPaginatedRDTypes(1);
                    self.$swal({
                      title: 'Success',
                      text: 'New remittance disbursement type added successfully!',
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
      // Show edit remittance disbursement type form
      openUpdateRDTypeModal(row){
        this.edit = {
          id: row.id,
          rdTypeId: row.remittanceDisbursementTypeId,
          type: row.type
        }
        this.$bvModal.show('update-remittance-disbursement-type-modal');
      },
      // Change remittance disbursement type details
      updateRDType(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let rdData = null;

          rdData = dbMains.collection('remittanceDisbursementTypes')
            .where("type", "==", upperCase(self.edit.type))
            .where("remittanceDisbursementTypeId", "!=", self.edit.rdTypeId);
          rdData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Remittance disbursement type already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("remittanceDisbursementTypes")
                .doc(self.edit.id)
                .update({
                  type: upperCase(self.edit.type),
                  dateModified: today
                }).then(() => {
                  self.edit= {};
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-remittance-disbursement-type-modal');
                  self.requestProcessing = false;
                  self.$refs['rd-type-table'].reset();
                  self.getPaginatedRDTypes(1);
                  self.$swal({
                    title: 'Success',
                    text: 'Remittance disbursement type updated successfully!',
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
      // Change remittance disbursement type status
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
              dbMains.collection("remittanceDisbursementTypes")
              .doc(row.id)
              .update({
                status: stat,
                dateModified: today
              }).then(() => {
                self.$swal({
                  title: "Success",
                  text: "Remittance disbursement type status to " + msg + ".",
                  icon: "success",
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.$refs['rd-type-table'].reset();
                  self.getPaginatedRDTypes(stat);
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