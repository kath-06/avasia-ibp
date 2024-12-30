<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <div class="table-full-width">
          <!-- Print signatory type table -->
          <vue-good-table :columns="columns"
            :rows="signatoryTypes"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="signatory-type-table">
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
                <router-link :to='"/view/print/signatory/" + props.row.printSignatoryId'
                  class="pointer ml-2 fa fa-print"
                  id="sideBarTxt"
                  title="View Signatory"></router-link>
                <!-- <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openUpdateSignatoryType(props.row)"
                  title="Update Type"></span> -->
              </span></b>
            </template>
          </vue-good-table>
        </div><hr>
        <!-- Limit records -->
        <div class="row pl-4"
          v-if="!loading && signatoryTypes.length">
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
              @input="getSignatoryType(1, '')"></v-select>
          </span>
        </div><hr>
        <!-- New signatory type button -->
        <!-- <div class="text-right pt-2">
          <base-button v-b-modal.new-signatory-type-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Signatory Type</base-button>
        </div> -->
      </card>
      <!-- ADD SIGNATORY TYPE MODAL -->
      <b-modal size="md"
        id="new-signatory-type-modal"
        title="New Signatory Type" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Signatory Type:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newType"
              id="inputStyle"
              type="text"
              placeholder="Signatory Type"></base-input>
            <i class="text-red"
              v-if="$v.newType.$anyDirty && !$v.newType.required">Field Required</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addSignatoryType"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-signatory-type-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE SIGNATORY TYPE MODAL -->
      <b-modal size="md"
        id="update-signatory-type-modal"
        title="Edit Signatory Type" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Signatory Type:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="edit.type"
              id="inputStyle"
              type="text"
              placeholder="Signatory Type"></base-input>
            <i class="text-red"
              v-if="$v.edit.type.$anyDirty && !$v.edit.type.required">Field Required</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateSignatoryType"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-signatory-type-modal')"
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
  import {required} from "vuelidate/lib/validators";
  import {capitalCase} from "text-case";
  import {mapGetters} from "vuex";

  const today = new Date();

  export default {
    components: {},
    data() {
      return {
        // User role table
        columns: [{
            label: 'Signatory Type',
            field: 'type'
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
        loadError: false,
        // Enale or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // New user role
        newType: '',
        // Edit user role
        edit: {
          id: '',
          printSignatoryTypeId: '',
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
            if(roles[0].userRole == 'User' || roles[0].userRole == 'Manager'){     
              next("/main/home");
            }else if(roles[0].userRole == 'Administrator'){
              next();
            }
          });
        }
      });
    },
    async mounted(){
      this.getSignatoryTypes();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users',
        validationMessage: "PrintSignatory/validationMessage",
        errorMessage: "PrintSignatory/errorMessage",
        signatoryTypes: "PrintSignatory/signatoryTypes"
      })
    },
    validations: {
      // New signatory type validations
      newType: {
        required
      },
      // Edit signatory type validations
      edit: {
        type: {
          required
        }
      }
    },
    methods: {
      // Save new signatory type details
      addSignatoryType(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newType.$touch();
        if(!self.$v.newType.$error){
          self.requestProcessing = true;
          self.$store.dispatch("PrintSignatory/checkSignatoryType", {newType: self.newType})
          .then(() => {
            setTimeout(function() {
              if(self.validationMessage == 1){
                self.signatoryTypeInvalidMessage();
                self.requestProcessing = false;
              }else if(self.validationMessage == 0){
                let newData = {
                  printSignatoryId: '',
                  type: capitalCase(self.newType),
                  createdBy: '',
                  userReference: '',
                  status: 1,
                  dateCreated: today,
                  dateModified: today
                }
                self.$store.dispatch("PrintSignatory/saveSignatoryType", newData)
                .then(() => {
                  self.requestProcessing = false;
                  if(self.errorMessage == 0){
                    self.newType = '';
                    self.$v.newType.$reset();
                    self.$bvModal.hide('new-signatory-type-modal');
                    self.$swal({
                      title: 'Success',
                      text: 'New print signatory type added successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    }).then(() => {
                      self.getSignatoryTypes();
                    });
                  }else if(self.errorMessage == 1){
                    self.signatoryTypeErrorMessage();
                  }
                });
              }
            }, 1000);
          });
        }
      },
      // Display invalid message
      signatoryTypeInvalidMessage(){
        let self = this;

        self.$swal({
          title: 'Invalid',
          text: 'Print signatory type already exists.',
          icon: 'error',
          confirmButtonColor: '#f5365c',
          confirmButtonText: 'OK'
        });
        self.requestProcessing = false;
      },
      // Display error message
      signatoryTypeErrorMessage(){
        let self = this;

        self.$swal({
          title: 'Error',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#b80000',
          confirmButtonText: 'OK'
        });
      },
      // Get signatory type data for list table
      getSignatoryTypes() {
        let self = this;

        self.loading = true;
        self.loadError = false;
        self.$store.dispatch("PrintSignatory/getSignatoryTypes", {limit: self.limit});
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      openUpdateSignatoryType(row) {
        this.edit = {
          id: row.id,
          printSignatoryTypeId: row.printSignatoryId,
          type: row.type
        }
        this.$bvModal.show("update-signatory-type-modal");
      },
      // Change signatory type details
      updateSignatoryType(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.type.$touch();
        if(!self.$v.edit.type.$error){
          self.$store.dispatch("PrintSignatory/checkUpdateSignatoryType", self.edit)
          .then(() => {
            setTimeout(function() {
              if(self.validationMessage == 1){
                self.signatoryTypeInvalidMessage();
              }else if(self.validationMessage == 0){
                self.edit.type = capitalCase(self.edit.type);
                self.$store.dispatch("PrintSignatory/updateSignatoryType", self.edit)
                .then(() => {
                  self.requestProcessing = false;
                  if(self.errorMessage == 0){
                    self.edit = {};
                    self.$v.edit.type.$reset();
                    self.$bvModal.hide('update-signatory-type-modal');
                    self.requestProcessing = false;
                    self.$refs['signatory-type-table'].reset();
                    self.getSignatoryTypes();
                    self.$swal({
                      title: 'Success',
                      text: 'Signatory type updated successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  }else if(self.errorMessage == 1){
                    self.signatoryTypeErrorMessage();
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
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>