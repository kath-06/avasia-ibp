<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <!-- Client link status -->
        <div class="row">
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="activeBadge"
                v-if="clientStat == 1"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getClients(1)">Enabled</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="activeBadge"
                v-if="clientStat == 0"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getClients(0)">Disabled</span>
            </badge>
          </div>
        </div>
        <!-- Client list table -->
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="clients"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="client-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'clientName'">
                <span>{{props.row.clientName}}</span>
              </span>
              <span v-if="props.column.field == 'address'">
                <span>{{props.row.address}}</span>
              </span>
              <span v-if="props.column.field == 'tin'">
                <span>{{props.row.tin}}</span>
              </span>
              <span v-if="props.column.field == 'contactNumber'">
                <span>{{props.row.contactNumber}}</span>
              </span>
              <span v-if="props.column.field == 'email'">
                <span>{{props.row.email}}</span>
              </span>
              <span v-if="props.column.field == 'businessStyle'">
                <span>{{props.row.businessStyle}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openEditClientModal(props.row)"
                  title="Edit"
                  v-if="props.row.status == 1"></span>
                <span class="pointer ml-2 far fa-times-circle"
                  id="sideBarTxt"
                  v-on:click="changeStatus(props.row.id, 0, 'Disable')"
                  title="Disable"
                  v-if="props.row.status == 1"></span>
                <span class="pointer ml-2 far fa-check-circle"
                  id="sideBarTxt"
                  v-on:click="changeStatus(props.row.id, 1, 'Enable')"
                  title="Enable"
                  v-if="props.row.status == 0"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit client records on table -->
        <div class="row pl-4"
          v-if="!loading && clients.length">
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
              @input="getClients(clientStat)"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New client button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-client-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Client</base-button>
        </div>
      </card>
      <!-- NEW CLIENT MODAL -->
      <b-modal size="lg"
        id="new-client-modal"
        title="New Client" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Client:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newClient"
              id="inputStyle"
              type="text"
              placeholder="Client"></base-input>
            <i class="text-red"
              v-if="$v.newClient.$anyDirty && !$v.newClient.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newClient.$anyDirty && !$v.newClient.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <textarea rows="4"
              cols="39"
              v-model="newAddress"
              id="inputStyle"
              class="pl-2"
              placeholder="Address"></textarea>
            <i class="text-red"
              v-if="$v.newAddress.$anyDirty && !$v.newAddress.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Tin Number:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Contact Number:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newTinNumber"
              id="inputStyle"
              type="text"
              placeholder="Tin Number"></base-input>
            <i class="text-red"
              v-if="$v.newTinNumber.$anyDirty && !$v.newTinNumber.numCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newContactNumber"
              id="inputStyle"
              type="text"
              placeholder="Contact Number"></base-input>
            <i class="text-red"
              v-if="$v.newContactNumber.$anyDirty && !$v.newContactNumber.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Email Address:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Business Style:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newEmailAddress"
              id="inputStyle"
              type="text"
              placeholder="Email Address"></base-input>
            <i class="text-red"
              v-if="$v.newEmailAddress.$anyDirty && !$v.newEmailAddress.email">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newBusinessStyle"
              id="inputStyle"
              type="text"
              placeholder="Business Style"></base-input>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addClient"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-client-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT CLIENT MODAL -->
      <b-modal size="lg"
        id="edit-client-modal"
        title="Edit Client" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Client:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.clientName"
              id="inputStyle"
              type="text"
              placeholder="Client"></base-input>
            <i class="text-red"
              v-if="$v.edit.clientName.$anyDirty && !$v.edit.clientName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.clientName.$anyDirty && !$v.edit.clientName.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <textarea rows="4"
              cols="39"
              v-model="edit.address"
              id="inputStyle"
              class="pl-2"
              placeholder="Address"></textarea>
            <i class="text-red"
              v-if="$v.edit.address.$anyDirty && !$v.edit.address.required">Field Required</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Tin Number:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Contact Number:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.tin"
              id="inputStyle"
              type="text"
              placeholder="Tin Number"></base-input>
            <i class="text-red"
              v-if="$v.edit.tin.$anyDirty && !$v.edit.tin.numCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.contactNumber"
              id="inputStyle"
              type="text"
              placeholder="Contact Number"></base-input>
            <i class="text-red"
              v-if="$v.edit.contactNumber.$anyDirty && !$v.edit.contactNumber.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Email Address:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Business Style:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.email"
              id="inputStyle"
              type="text"
              placeholder="Email Address"></base-input>
            <i class="text-red"
              v-if="$v.edit.email.$anyDirty && !$v.edit.email.email">Invalid Characters</i>
          </div>
           <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.businessStyle"
              id="inputStyle"
              type="text"
              placeholder="Business Style"></base-input>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateClient"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-client-modal')"
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
  import {helpers, required, email} from "vuelidate/lib/validators";
  import {mapGetters} from 'vuex';
  import {upperCase} from "text-case";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./&, ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const today = new Date();
  // const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Client table
        columns: [{
            label: 'Client',
            field: 'clientName'
          },{
            label: 'Address',
            field: 'address'
          },{
            label: 'Tin',
            field: 'tin'
          },{
            label: 'Contact No.',
            field: 'contactNumber'
          },{
            label: 'Email',
            field: 'email'
          },{
            label: 'Business Style',
            field: 'businessStyle'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
          }
        ],
        loading: true,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // Enable/disable button
        requestProcessing: false,
        // New client
        newClient: '',
        newAddress: '',
        newTinNumber: '',
        newContactNumber: '',
        newEmailAddress: '',
        newBusinessStyle: '',
        // Edit client
        edit: {
          id: '',
          clientId: '',
          clientName: '',
          address: '',
          tin: '',
          contactNumber: '',
          email: '',
          businessStyle: '',
        },
        clientStat: 1
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
      this.getClients(this.clientStat);
    },
    computed: {
      ...mapGetters({
        valid: 'Sales/valid',
        error: 'Sales/error',
        clients: 'Sales/clients',
      })
    },
    validations: {
      // New client validations
      newClient: {
        required,
        alphaNumCustomValidator
      },
      newAddress: {required},
      newTinNumber: {numCustomValidator},
      newContactNumber: {numCustomValidator},
      newEmailAddress: {email},
      // Edit client validations
      edit: {
        clientName: {
          required,
          alphaNumCustomValidator
        },
        address: {required},
        tin: {numCustomValidator},
        contactNumber: {numCustomValidator},
        email: {email},
      }
    },
    methods: {
      // Add new client
      async addClient(){
        let self = this;

        self.$v.newClient.$touch();
        self.$v.newAddress.$touch();
        self.$v.newTinNumber.$touch();
        self.$v.newContactNumber.$touch();
        self.$v.newEmailAddress.$touch();
        if(!self.$v.newClient.$error && !self.$v.newAddress.$error && !self.$v.newTinNumber.$error && !self.$v.newContactNumber.$error && !self.$v.newEmailAddress.$error){
          self.requestProcessing = true;
          let newClient = {
            clientId: '',
            clientName: upperCase(self.newClient),
            address: self.newAddress,
            tin: self.newTinNumber,
            contactNumber: self.newContactNumber,
            email: self.newEmailAddress,
            businessStyle: self.newBusinessStyle,
            userReference: '',
            status: 1,
            dateCreated: today,
            dateModified: today,
          };

          self.$store.dispatch("Sales/checkClient", {
            validate: 1,
            newClient: self.newClient
          }).then(() => {
            setTimeout(function(){
              if(self.valid == 1){
                self.validationMessage('Client name');
              }else if(self.valid == 0){
                self.$store.dispatch("Sales/checkClient", {
                  validate: 2,
                  newTinNumber: self.newTinNumber
                }).then(() => {
                  setTimeout(function(){
                    if(self.valid == 1){
                      self.validationMessage('Tin');
                    }else if(self.valid == 0){
                      self.$store.dispatch("Sales/checkClient", {
                        validate: 3,
                        newContactNumber: self.newContactNumber
                      }).then(() => {
                        setTimeout(function(){
                          if(self.valid == 1){
                            self.validationMessage('Contact number');
                          }else if(self.valid == 0){
                            self.$store.dispatch("Sales/checkClient", {
                              validate: 4,
                              newEmailAddress: self.newEmailAddress
                            }).then(() => {
                              setTimeout(function(){    
                                if(self.valid == 1){
                                  self.validationMessage('Email address');
                                }else if(self.valid == 0){
                                  self.$store.dispatch("Sales/newClient", newClient)
                                  .then(() => {
                                    setTimeout(function(){
                                      if(self.error == 0){
                                        self.newClient = '';
                                        self.newAddress = '';
                                        self.newTinNumber = '';
                                        self.newContactNumber = '';
                                        self.newEmailAddress = '';
                                        self.newBusinessStyle = '';
                                        self.requestProcessing = false;
                                        self.$v.newClient.$reset();
                                        self.$v.newAddress.$reset();
                                        self.$v.newTinNumber.$reset();
                                        self.$v.newContactNumber.$reset();
                                        self.$v.newEmailAddress.$reset();
                                        self.$refs['client-table'].reset();
                                        self.getClients(self.clientStat);
                                        self.$bvModal.hide('new-client-modal');
                                        self.$swal({
                                          title: 'Success',
                                          text: 'New client added successfully!',
                                          icon: 'success',
                                          confirmButtonColor: '#b80000',
                                          confirmButtonText: 'OK'
                                        });
                                      }else if(self.error == 1){
                                        self.errorMessage();
                                      }
                                    },500);
                                  });
                                }
                              },500)
                            });
                          }
                        },500);
                      });
                    }
                  },500);
                });
              }
            },500);
          });
        }
      },
      //Validation Message
      validationMessage(msg){
        let self = this;

        self.$swal({
          title: 'Invalid',
          text: msg + ' already exists.',
          icon: 'error',
          confirmButtonColor: '#b80000',
          confirmButtonText: 'OK'
        });
        self.requestProcessing = false;
      },
      //Error Message
      errorMessage(){
        let self = this;

        self.$swal({
          title: 'Error',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#b80000',
          confirmButtonText: 'OK'
        });
      },
      // Get client data for table list
      async getClients(stat) {
        let self = this;

        self.loading = true;
        self.clientStat = stat;
        self.$store.dispatch("Sales/getClients", {
          limit: self.limit,
          stat: stat
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Open edit client modal
      openEditClientModal(row){
        this.edit = {
          id: row.id,
          clientId: row.clientId,
          clientName: row.clientName,
          address: row.address,
          tin: row.tin,
          contactNumber: row.contactNumber,
          email: row.email,
          businessStyle: row.businessStyle,
        }
        this.$bvModal.show('edit-client-modal');
      },
      // Change client data
      async updateClient(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          self.$store.dispatch("Sales/checkEditClient", {
            validate: 1,
            clientName: self.edit.clientName,
            clientId: self.edit.clientId,
          }).then(() => {
            setTimeout(function(){
              if(self.valid == 1){
                self.validationMessage('Client name');
              }else if(self.valid == 0){
                self.$store.dispatch("Sales/checkEditClient",{
                  validate: 2,
                  tin: self.edit.tin,
                  clientId: self.edit.clientId
                }).then(() => {
                  setTimeout(function(){
                    if(self.valid == 1){
                      self.validationMessage("Tin");
                    }else if(self.valid == 0){
                      self.$store.dispatch("Sales/checkEditClient",{
                        validate: 3,
                        contactNumber: self.edit.contactNumber,
                        clientId: self.edit.clientId
                      }).then(() => {
                        setTimeout(function(){
                          if(self.valid == 1){
                            self.validationMessage("Contact number");
                          }else if(self.valid == 0){
                            self.$store.dispatch("Sales/checkEditClient",{
                              validate: 4,
                              email: self.edit.email,
                              clientId: self.edit.clientId
                            }).then(() => {
                              setTimeout(function(){
                                if(self.valid == 1){
                                  self.validationMessage("Email address");
                                }else if(self.valid == 0){
                                  self.requestProcessing = false;
                                  self.$store.dispatch("Sales/editClient", self.edit)
                                  .then(() => {
                                    if(self.error == 0){
                                      self.$v.edit.$reset();
                                      self.$refs['client-table'].reset();
                                      self.getClients(self.clientStat);
                                      self.$bvModal.hide('edit-client-modal');
                                      self.$swal({
                                        title: 'Success',
                                        text: 'Client updated successfully!',
                                        icon: 'success',
                                        confirmButtonColor: '#b80000',
                                        confirmButtonText: 'OK'
                                      });
                                    }else if(self.error == 1){
                                      self.errorMessage();
                                    }
                                  });
                                }
                              },500);
                            });
                          }
                        },500);
                      });
                    }
                  },500);
                });
              }
            }, 500);
          });
        }
      },
      // Change client status
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
            self.$store.dispatch("Sales/clientStatus", {
              id: id,
              stat: stat,
            }).then(() => {
              setTimeout(function(){
                if(self.error == 0){
                  self.$swal({
                    title: "Success",
                    text: "Client status change to " + msg + ".",
                    icon: "success",
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    self.$refs['client-table'].reset();
                    self.getClients(stat);
                  });
                }else if(self.error == 1){
                  self.errorMessage();
                }
              },1000);
            });
          }
        });
      },
    }
  };
</script>
<style type="text/css">
  /*Form styles*/
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>