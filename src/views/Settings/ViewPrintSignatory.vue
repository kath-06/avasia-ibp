<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <h3>{{types.type}} Signatory</h3>
        <hr>
        <!-- <div class="text-right pt-2 pb-2">
          <base-button v-b-modal.new-signatory-modal
            id="darkBtn"
            class="col-md-2 ml-2 mr-2">Add Signatory</base-button>
        </div> -->
        <div class="table-full-width">
          <!-- Print signatory table -->
          <vue-good-table :columns="columns"
            :rows="signatories"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="signatory-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'orderNumber'">
                <span>{{props.row.orderNumber}}</span>
              </span>
              <span v-if="props.column.field == 'label'">
                <span>{{props.row.label}}</span>
              </span>
              <span v-if="props.column.field == 'name'">
                <span>{{props.row.name}}</span>
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
                  v-on:click="openUpdateSignatory(props.row)"
                  title="Update"></span>
                <!-- <span class="pointer ml-2 far fa-times-circle"
                  id="sideBarTxt"
                  v-on:click="removeSignatory(props.row)"
                  title="Remove"></span> -->
              </span></b>
            </template>
          </vue-good-table>
        </div>
      </card>
      <div class="text-right pt-4 pb-4">
        <!-- Close page -->
        <base-button id="darkInlineBtn"
          class="col-md-2 ml-2 mr-3"
          @click.native="$router.push('/settings/print/signatory')">Close</base-button>
      </div>
      <!-- ADD SIGNATORY MODAL -->
      <b-modal size="md"
        id="new-signatory-modal"
        title="New Signatory" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Signatory Order Number:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newOrderNumber"
              id="inputStyle"
              type="text"
              placeholder="0"></base-input>
            <i class="text-red"
              v-if="$v.newOrderNumber.$anyDirty && !$v.newOrderNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newOrderNumber.$anyDirty && !$v.newOrderNumber.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Label Name:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newLabelName"
              id="inputStyle"
              type="text"
              placeholder="Prepared by"></base-input>
            <i class="text-red"
              v-if="$v.newLabelName.$anyDirty && !$v.newLabelName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newLabelName.$anyDirty && !$v.newLabelName.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Name:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newName"
              id="inputStyle"
              type="text"
              placeholder="Juan Dela Cruz"></base-input>
            <i class="text-red"
              v-if="$v.newName.$anyDirty && !$v.newName.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addSignatory"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-signatory-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT SIGNATORY MODAL -->
      <b-modal size="md"
        id="update-signatory-modal"
        title="Edit Signatory" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Signatory Order Number:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="edit.orderNumber"
              id="inputStyle"
              type="text"
              placeholder="0"
              disabled></base-input>
            <i class="text-red"
              v-if="$v.edit.orderNumber.$anyDirty && !$v.edit.orderNumber.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.orderNumber.$anyDirty && !$v.edit.orderNumber.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Label Name:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="edit.label"
              id="inputStyle"
              type="text"
              placeholder="Prepared by"
              disabled></base-input>
            <i class="text-red"
              v-if="$v.edit.label.$anyDirty && !$v.edit.label.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.label.$anyDirty && !$v.edit.label.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Name:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="edit.name"
              id="inputStyle"
              type="text"
              placeholder="Juan Dela Cruz"></base-input>
            <i class="text-red"
              v-if="$v.edit.name.$anyDirty && !$v.edit.name.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateSignatory"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-signatory-modal')"
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
  import {required, helpers} from "vuelidate/lib/validators";
  import {mapGetters} from "vuex";
  import {capitalCase, sentenceCase} from "text-case";

  const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0.-9 ]*$/);
  const today = new Date();

  export default {
    computed: {
      ...mapGetters({
        types: "PrintSignatory/signatoryType",
        validationMessage: "PrintSignatory/validationMessage",
        errorMessage: "PrintSignatory/errorMessage",
        users: "Users/users",
        signatories: "PrintSignatory/signatories"
      })
    },
    data () {
      return {
        newOrderNumber: '',
        newLabelName: '',
        newName: '',
        // Enable or disable buttons
        requestProcessing: false,
        // Signatory table
        columns: [{
            label: 'Order Number',
            field: 'orderNumber',
            width: '100px'
          },{
            label: 'Label',
            field: 'label'
          },{
            label: 'Name',
            field: 'name'
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
        edit: {
          id: '',
          signatoryId: '',
          orderNumber: '',
          labelName: '',
          name: ''
        }
      }
    },
    validations: {
      newOrderNumber: {
        required,
        numCustomValidator
      },
      newLabelName: {
        required,
        alphaCustomValidator
      },
      newName: {
        alphaCustomValidator
      },
      edit: {
        orderNumber: {
          required,
          numCustomValidator
        },
        label: {
          required,
          alphaCustomValidator
        },
        name: {
          alphaCustomValidator
        }
      }
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
      await this.$store.dispatch("PrintSignatory/getSignatoryType", {id: this.$router.currentRoute.params.id });
      this.getSignatories();
    },
    methods: {
      // Save new signatory details
      addSignatory(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newOrderNumber.$touch();
        self.$v.newLabelName.$touch();
        self.$v.newName.$touch();
        if(!self.$v.newOrderNumber.$error && !self.$v.newLabelName.$error && ! self.$v.newName.$error){
          self.requestProcessing = true;
          let newData = {
            signatoryId: '',
            orderNumber: self.newOrderNumber,
            label: sentenceCase(self.newLabelName),
            name: capitalCase(self.newName) || '',
            signatoryTypeReference: self.$router.currentRoute.params.id,
            createdBy: '',
            userReference: '',
            status: 1,
            dateCreated: today,
            dateModified: today
          }
          self.$store.dispatch("PrintSignatory/saveSignatory", newData)
            .then(() => {
              setTimeout(function() {
                self.requestProcessing = false;
                if(self.errorMessage == 0){
                  self.newOrderNumber = '';
                  self.newLabelName = '';
                  self.newName = '';
                  self.$v.newOrderNumber.$reset();
                  self.$v.newLabelName.$reset();
                  self.$v.newName.$reset();
                  self.$bvModal.hide('new-signatory-modal');
                  self.$swal({
                    title: 'Success',
                    text: 'New print signatory added successfully!',
                    icon: 'success',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    self.getSignatories();
                  });
                }else if(self.errorMessage == 1){
                  self.signatoryErrorMessage();
                }
              }, 1000);
            });
        }
      },
      // Display invalid message
      signatoryInvalidMessage(){
        let self = this;

        self.$swal({
          title: 'Invalid',
          text: 'Print signatory label name already exists.',
          icon: 'error',
          confirmButtonColor: '#f5365c',
          confirmButtonText: 'OK'
        });
        self.requestProcessing = false;
      },
      // Display error message
      signatoryErrorMessage(){
        let self = this;

        self.$swal({
          title: 'Error',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#b80000',
          confirmButtonText: 'OK'
        });
      },
      // Get signatory data for list table
      getSignatories() {
        let self = this;

        self.loading = true;
        self.loadError = false;
        self.$store.dispatch("PrintSignatory/getSignatories", {id: self.$router.currentRoute.params.id});
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      openUpdateSignatory(row) {
        let self = this;

        self.edit = {
          id: row.id,
          signatoryId: row.signatoryId,
          orderNumber: row.orderNumber,
          label: row.label,
          name: row.name
        }
        self.$bvModal.show("update-signatory-modal");
      },
      // Change signatory details
      updateSignatory(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.$store.dispatch("PrintSignatory/checkUpdateSignatory", self.edit)
          .then(() => {
            setTimeout(function() {
              if(self.validationMessage == 1){
                self.signatoryInvalidMessage();
              }else if(self.validationMessage == 0){
                self.edit.label = sentenceCase(self.edit.label);
                self.edit.name = capitalCase(self.edit.name);
                self.$store.dispatch("PrintSignatory/updateSignatory", self.edit)
                .then(() => {
                  self.requestProcessing = false;
                  if(self.errorMessage == 0){
                    self.edit = {};
                    self.$v.edit.$reset();
                    self.$bvModal.hide('update-signatory-modal');
                    self.$refs['signatory-table'].reset();
                    self.getSignatories();
                    self.$swal({
                      title: 'Success',
                      text: 'Signatory updated successfully!',
                      icon: 'success',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  }else if(self.errorMessage == 1){
                    self.signatoryErrorMessage();
                  }
                });
              }
            }, 1000);
          });
        }
      },
      removeSignatory (data) {
        let self = this;

        self.requestProcessing = true;
        self.$swal({
          title: 'Are you sure?',
          text: "You want to remove this signatory",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#b80000',
          cancelButtonColor: '#f5c71a',
          confirmButtonText: 'CONFIRM'
        }).then((result) => {
          if(result.value) {
            self.$store.dispatch('PrintSignatory/deleteSignatory', { id: data.id })
            .then(() => {
              self.requestProcessing = false;
              if(self.errorMessage == 0){
                self.$refs['signatory-table'].reset();
                self.getSignatories();
                self.$swal({
                  title: 'Success',
                  text: 'Signatory remove successfully!',
                  icon: 'success',
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                });
              }else if(self.errorMessage == 1){
                self.signatoryErrorMessage();
              }
            })
          }
        })
      }
    }
  };
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>