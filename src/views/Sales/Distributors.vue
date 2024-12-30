<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <!-- Distributor link status -->
        <div class="row">
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="activeBadge"
                v-if="distributorStat == 1"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getDistributors(1)">Enabled</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="activeBadge"
                v-if="distributorStat == 0"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getDistributors(0)">Disabled</span>
            </badge>
          </div>
        </div>
        <!-- Distributor list table -->
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="distributors"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="distributor-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'distributorName'">
                <span>{{props.row.distributorName}}</span>
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
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openEditDistributorModal(props.row)"
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
        <!-- Limit distributor records on table -->
        <div class="row pl-4"
          v-if="!loading && distributors.length">
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
              @input="getDistributors(distributorStat)"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New distributor button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-distributor-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Distributor</base-button>
        </div>
      </card>
      <!-- NEW DISTRIBUTOR MODAL -->
      <b-modal size="lg"
        id="new-distributor-modal"
        title="New Distributor" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Distributor:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newDistributor"
              id="inputStyle"
              type="text"
              placeholder="Distributor"></base-input>
            <i class="text-red"
              v-if="$v.newDistributor.$anyDirty && !$v.newDistributor.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newDistributor.$anyDirty && !$v.newDistributor.alphaNumCustomValidator">Invalid Characters</i>
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
            <b>Contact Person:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Email Address:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newContactPerson"
              id="inputStyle"
              type="text"
              placeholder="Contact Person"></base-input>
            <i class="text-red"
              v-if="$v.newContactPerson.$anyDirty && !$v.newContactPerson.alphaCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newEmailAddress"
              id="inputStyle"
              type="text"
              placeholder="Email Address"></base-input>
            <i class="text-red"
              v-if="$v.newEmailAddress.$anyDirty && !$v.newEmailAddress.email">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addDistributor"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-distributor-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT DISTRIBUTOR MODAL -->
      <b-modal size="lg"
        id="edit-distributor-modal"
        title="Edit Distributor" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Distributor:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.distributorName"
              id="inputStyle"
              type="text"
              placeholder="Distributor"></base-input>
            <i class="text-red"
              v-if="$v.edit.distributorName.$anyDirty && !$v.edit.distributorName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.distributorName.$anyDirty && !$v.edit.distributorName.alphaNumCustomValidator">Invalid Characters</i>
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
            <b>Contact Person:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Email Address:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.contactPerson"
              id="inputStyle"
              type="text"
              placeholder="Contact Person"></base-input>
            <i class="text-red"
              v-if="$v.edit.contactPerson.$anyDirty && !$v.edit.contactPerson.alphaCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.email"
              id="inputStyle"
              type="text"
              placeholder="Email Address"></base-input>
            <i class="text-red"
              v-if="$v.edit.email.$anyDirty && !$v.edit.email.email">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateDistributor"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-distributor-modal')"
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
  const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z -. ]*$/);
  const today = new Date();
  // const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Distributor table
        columns: [{
            label: 'Distributor',
            field: 'distributorName'
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
        // New distributor
        newDistributor: '',
        newAddress: '',
        newTinNumber: '',
        newContactNumber: '',
        newContactPerson: '',
        newEmailAddress: '',
        // Edit distributor
        edit: {
          id: '',
          distributorId: '',
          distributorName: '',
          address: '',
          tin: '',
          contactNumber: '',
          email: '',
          contactPerson: '',
        },
        distributorStat: 1
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
      this.getDistributors(this.distributorStat);
    },
    computed: {
      ...mapGetters({
        valid: 'Sales/valid',
        error: 'Sales/error',
        clients: 'Sales/clients',
        distributors: 'Sales/distributors',
      })
    },
    validations: {
      // New distributor validations
      newDistributor: {
        required,
        alphaNumCustomValidator
      },
      newAddress: {required},
      newTinNumber: {numCustomValidator},
      newContactNumber: {numCustomValidator},
      newContactPerson: {alphaCustomValidator},
      newEmailAddress: {email},
      // Edit distributor validations
      edit: {
        distributorName: {
          required,
          alphaNumCustomValidator
        },
        address: {required},
        tin: {numCustomValidator},
        contactNumber: {numCustomValidator},
        email: {email},
        contactPerson: {alphaCustomValidator},
      }
    },
    methods: {
      // Add new distributor
      async addDistributor(){
        let self = this;

        self.$v.newDistributor.$touch();
        self.$v.newAddress.$touch();
        self.$v.newTinNumber.$touch();
        self.$v.newContactNumber.$touch();
        self.$v.newContactPerson.$touch();
        self.$v.newEmailAddress.$touch();
        if(!self.$v.newDistributor.$error && !self.$v.newAddress.$error && !self.$v.newTinNumber.$error && !self.$v.newContactNumber.$error && !self.$v.newContactPerson.$error && !self.$v.newEmailAddress.$error){
          self.requestProcessing = true;
          let distributorData = {
            distributorId: '',
            distributorName: upperCase(self.newDistributor),
            address: self.newAddress,
            tin: self.newTinNumber,
            contactNumber: self.newContactNumber,
            contactPerson: self.newContactPerson,
            email: self.newEmailAddress,
            userReference: '',
            status: 1,
            dateCreated: today,
            dateModified: today,
          };

          self.$store.dispatch("Sales/checkDistributor", {
            validate: 1,
            newDistributor: self.newDistributor
          }).then(() => {
            setTimeout(function(){
              if(self.valid == 1){
                self.validationMessage('Distributor');
              }else if(self.valid == 0){
                self.$store.dispatch("Sales/checkDistributor", {
                  validate: 2,
                  newTinNumber: self.newTinNumber
                }).then(() => {
                  setTimeout(function(){
                    if(self.valid == 1){
                      self.validationMessage('Tin');
                    }else if(self.valid == 0){
                      self.$store.dispatch("Sales/checkDistributor", {
                        validate: 3,
                        newContactNumber: self.newContactNumber
                      }).then(() => {
                        setTimeout(function(){
                          if(self.valid == 1){
                            self.validationMessage('Contact number');
                          }else if(self.valid == 0){
                            self.$store.dispatch("Sales/checkDistributor", {
                              validate: 4,
                              newEmailAddress: self.newEmailAddress
                            }).then(() => {
                              setTimeout(function(){    
                                if(self.valid == 1){
                                  self.validationMessage('Email address');
                                }else if(self.valid == 0){
                                  self.$store.dispatch("Sales/newDistributor", distributorData)
                                  .then(() => {
                                    setTimeout(function(){
                                      if(self.error == 0){
                                        self.newDistributor = '';
                                        self.newAddress = '';
                                        self.newTinNumber = '';
                                        self.newContactNumber = '';
                                        self.newContactPerson = '';
                                        self.newEmailAddress = '';
                                        self.requestProcessing = false;
                                        self.$v.newDistributor.$reset();
                                        self.$v.newAddress.$reset();
                                        self.$v.newTinNumber.$reset();
                                        self.$v.newContactNumber.$reset();
                                        self.$v.newContactPerson.$reset();
                                        self.$v.newEmailAddress.$reset();
                                        self.$refs['distributor-table'].reset();
                                        self.getDistributors(self.distributorStat);
                                        self.$bvModal.hide('new-distributor-modal');
                                        self.$swal({
                                          title: 'Success',
                                          text: 'New distributor added successfully!',
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
      // Get distributor data for table list
      async getDistributors(stat) {
        let self = this;

        self.loading = true;
        self.distributorStat = stat;
        self.$store.dispatch("Sales/getDistributors", {
          limit: self.limit,
          stat: stat
        });
        setTimeout(function() {
          self.loading = false;
        }, 1000);
      },
      // Open edit distributor modal
      openEditDistributorModal(row){
        this.edit = {
          id: row.id,
          distributorId: row.distributorId,
          distributorName: row.distributorName,
          address: row.address,
          tin: row.tin,
          contactNumber: row.contactNumber,
          email: row.email,
          contactPerson: row.contactPerson,
        }
        this.$bvModal.show('edit-distributor-modal');
      },
      // Change distributor data
      async updateDistributor(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          self.$store.dispatch("Sales/checkEditDistributor", {
            validate: 1,
            distributorName: self.edit.distributorName,
            distributorId: self.edit.distributorId,
          }).then(() => {
            setTimeout(function(){
              if(self.valid == 1){
                self.validationMessage('Client name');
              }else if(self.valid == 0){
                self.$store.dispatch("Sales/checkEditDistributor",{
                  validate: 2,
                  tin: self.edit.tin,
                  distributorId: self.edit.distributorId
                }).then(() => {
                  setTimeout(function(){
                    if(self.valid == 1){
                      self.validationMessage("Tin");
                    }else if(self.valid == 0){
                      self.$store.dispatch("Sales/checkEditDistributor",{
                        validate: 3,
                        contactNumber: self.edit.contactNumber,
                        distributorId: self.edit.distributorId
                      }).then(() => {
                        setTimeout(function(){
                          if(self.valid == 1){
                            self.validationMessage("Contact number");
                          }else if(self.valid == 0){
                            self.$store.dispatch("Sales/checkEditDistributor",{
                              validate: 4,
                              email: self.edit.email,
                              distributorId: self.edit.distributorId
                            }).then(() => {
                              setTimeout(function(){
                                if(self.valid == 1){
                                  self.validationMessage("Email address");
                                }else if(self.valid == 0){
                                  self.requestProcessing = false;
                                  self.$store.dispatch("Sales/editDistributor", self.edit)
                                  .then(() => {
                                    if(self.error == 0){
                                      self.$v.edit.$reset();
                                      self.$refs['distributor-table'].reset();
                                      self.getDistributors(self.distributorStat);
                                      self.$bvModal.hide('edit-client-modal');
                                      self.$swal({
                                        title: 'Success',
                                        text: 'Distributor updated successfully!',
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
      // Change distributor status
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
            self.$store.dispatch("Sales/distributorStatus", {
              id: id,
              stat: stat,
            }).then(() => {
              setTimeout(function(){
                if(self.error == 0){
                  self.$swal({
                    title: "Success",
                    text: "Distributor status change to " + msg + ".",
                    icon: "success",
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    self.$refs['distributor-table'].reset();
                    self.getDistributors(stat);
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