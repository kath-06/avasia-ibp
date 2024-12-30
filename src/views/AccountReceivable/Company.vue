<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <!-- Company link status -->
        <div class="row">
          <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
            <badge class="badge-dot ml-2 pointer">
              <i id="activeBadge"
                v-if="companyStat == 1"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getCompanies(1)">Enabled</span>
            </badge>
            <badge class="badge-dot ml-3 pointer">
              <i id="activeBadge"
                v-if="companyStat == 0"></i>
              <i id="redBg" v-else></i>
              <span class="pointer status"
                id="linkTxt"
                v-on:click="getCompanies(0)">Disabled</span>
            </badge>
          </div>
        </div>
        <!-- Company list table -->
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="companies"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="company-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'company'">
                <span>{{props.row.company}}</span>
              </span>
              <span v-if="props.column.field == 'address'">
                <span>{{props.row.address}}</span>
              </span>
              <span v-if="props.column.field == 'tinNumber'">
                <span>{{props.row.tinNumber}}</span>
              </span>
              <span v-if="props.column.field == 'contactNumber'">
                <span>{{props.row.contactNumber}}</span>
              </span>
              <span v-if="props.column.field == 'emailAddress'">
                <span>{{props.row.emailAddress}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openEditCompanyModal(props.row)"
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
        <!-- Limit company records on table -->
        <div class="row pl-4"
          v-if="!loading && companies.length">
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
              @input="getCompanies(companyStat)"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New company button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-company-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Company</base-button>
        </div>
      </card>
      <!-- NEW COMPANY MODAL -->
      <b-modal size="lg"
        id="new-company-modal"
        title="New Company" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Company:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newCompany"
              id="inputStyle"
              type="text"
              placeholder="Company"></base-input>
            <i class="text-red"
              v-if="$v.newCompany.$anyDirty && !$v.newCompany.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newCompany.$anyDirty && !$v.newCompany.alphaNumCustomValidator">Invalid Characters</i>
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
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addCompany"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-company-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- EDIT COMPANY MODAL -->
      <b-modal size="lg"
        id="edit-company-modal"
        title="Edit Company" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Company:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.company"
              id="inputStyle"
              type="text"
              placeholder="Company"></base-input>
            <i class="text-red"
              v-if="$v.edit.company.$anyDirty && !$v.edit.company.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.company.$anyDirty && !$v.edit.company.alphaNumCustomValidator">Invalid Characters</i>
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
            <base-input v-model="edit.tinNumber"
              id="inputStyle"
              type="text"
              placeholder="Tin Number"></base-input>
            <i class="text-red"
              v-if="$v.edit.tinNumber.$anyDirty && !$v.edit.tinNumber.numCustomValidator">Invalid Characters</i>
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
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.emailAddress"
              id="inputStyle"
              type="text"
              placeholder="Email Address"></base-input>
            <i class="text-red"
              v-if="$v.edit.emailAddress.$anyDirty && !$v.edit.emailAddress.email">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateCompany"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('edit-company-modal')"
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
  import {helpers, required, email} from "vuelidate/lib/validators";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./&, ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Company table
        columns: [{
            label: 'Company',
            field: 'company'
          },{
            label: 'Address',
            field: 'address'
          },{
            label: 'Tin No.',
            field: 'tinNumber'
          },{
            label: 'Contact No.',
            field: 'contactNumber'
          },{
            label: 'Email',
            field: 'emailAddress'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '100px'
          }
        ],
        loading: true,
        companies: [],
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // Enable/disable button
        requestProcessing: false,
        // New company
        newCompany: '',
        newAddress: '',
        newTinNumber: '',
        newContactNumber: '',
        newEmailAddress: '',
        // Edit company
        edit: {
          id: '',
          companyId: '',
          company: '',
          address: '',
          tinNumber: '',
          contactNumber: '',
          emailAddress: ''
        },
        companyStat: 1
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
      this.getCompanies(this.companyStat);
    },
    validations: {
      // New company validations
      newCompany: {
        required,
        alphaNumCustomValidator
      },
      newAddress: {required},
      newTinNumber: {numCustomValidator},
      newContactNumber: {numCustomValidator},
      newEmailAddress: {email},
      // Edit company validations
      edit: {
        company: {
          required,
          alphaNumCustomValidator
        },
        address: {required},
        tinNumber: {numCustomValidator},
        contactNumber: {numCustomValidator},
        emailAddress: {email}
      }
    },
    methods: {
      // Add new compney
      addCompany(){
        let self = this;

        self.$v.newCompany.$touch();
        self.$v.newAddress.$touch();
        self.$v.newTinNumber.$touch();
        self.$v.newContactNumber.$touch();
        self.$v.newEmailAddress.$touch();
        if(!self.$v.newCompany.$error && !self.$v.newAddress.$error && !self.$v.newTinNumber.$error && !self.$v.newContactNumber.$error && !self.$v.newEmailAddress.$error){
          self.requestProcessing = true;
          let checkTinNumber = dbSales.collection('company')
            .where("tinNumber", "==", self.newTinNumber);

          checkTinNumber.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Tin number already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              let checkContactNumber = dbSales.collection('company')
                .where("contactNumber", "==", self.newContactNumber);

              checkContactNumber.get().then((querySnapshot) => {
                if(!querySnapshot.empty){
                  querySnapshot.forEach((doc) => {
                    if(doc.exists){
                      self.$swal({
                        title: 'Invalid',
                        text: 'Contact number already exists.',
                        icon: 'error',
                        confirmButtonColor: '#b80000',
                        confirmButtonText: 'OK'
                      });
                      self.requestProcessing = false;
                    }
                  });
                }else if(querySnapshot){
                  let checkEmail = dbSales.collection('company')
                    .where("emailAddress", "==", self.newEmailAddress);

                  checkEmail.get().then((querySnapshot) => {
                    if(!querySnapshot.empty){
                      querySnapshot.forEach((doc) => {
                        if(doc.exists){
                          self.$swal({
                            title: 'Invalid',
                            text: 'Email address already exists.',
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
                      let dataId = 'CI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

                      getUserId.get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                          if(doc.exists){
                            users.push(doc.data());
                          }
                        });
                        try{
                          dbSales.collection('company').doc()
                          .set({
                            companyId: dataId,
                            company: self.newCompany,
                            address: self.newAddress,
                            tinNumber: self.newTinNumber,
                            contactNumber: self.newContactNumber,
                            emailAddress: self.newEmailAddress,
                            type: 2,
                            userReference: users[0].userId,
                            status: 1,
                            dateCreated: today,
                            dateModified: today
                          }).then(() => {
                            self.newCompany = '';
                            self.newAddress = '';
                            self.newTinNumber = '';
                            self.newContactNumber = '';
                            self.newEmailAddress = '';
                            self.requestProcessing = false;
                            self.$v.newCompany.$reset();
                            self.$v.newAddress.$reset();
                            self.$v.newTinNumber.$reset();
                            self.$v.newContactNumber.$reset();
                            self.$v.newEmailAddress.$reset();
                            self.$refs['company-table'].reset();
                            self.getCompanies(self.companyStat);
                            self.$bvModal.hide('new-company-modal');
                            self.$swal({
                              title: 'Success',
                              text: 'New company added successfully!',
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
              });
            }
          });
        }
      },
      // Get company data for table list
      getCompanies(stat) {
        let self = this, companyData = null, coms = [], ids = [];

        self.loading = true;
        self.companies = [];
        self.companyStat = stat;
        if(self.limit != "all"){
          companyData = dbSales.collection("company")
            .where("status","==",stat)
            .orderBy("company", "asc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          companyData = dbSales.collection("company")
            .where("status","==",stat)
            .orderBy("company", "asc");
        }
        companyData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              coms.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < coms.length; i++){
              coms[i]["id"] = ids[i];
              self.companies.push(coms[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Open edit company modal
      openEditCompanyModal(row){
        this.edit = {
          id: row.id,
          companyId: row.companyId,
          company: row.company,
          address: row.address,
          tinNumber: row.tinNumber,
          contactNumber: row.contactNumber,
          emailAddress: row.emailAddress
        }
        this.$bvModal.show('edit-company-modal');
      },
      // Change company data
      updateCompany(){
        let self = this;

        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          self.requestProcessing = true;
          let checkTinNumber = dbSales.collection('company')
            .where("companyId","!=", self.edit.companyId)
            .where("tinNumber", "==", self.edit.tinNumber);

          checkTinNumber.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Tin number already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              let checkContactNumber = dbSales.collection('company')
                .where("companyId","!=", self.edit.companyId)
                .where("contactNumber", "==", self.edit.contactNumber);

              checkContactNumber.get().then((querySnapshot) => {
                if(!querySnapshot.empty){
                  querySnapshot.forEach((doc) => {
                    if(doc.exists){
                      self.$swal({
                        title: 'Invalid',
                        text: 'Contact number already exists.',
                        icon: 'error',
                        confirmButtonColor: '#b80000',
                        confirmButtonText: 'OK'
                      });
                      self.requestProcessing = false;
                    }
                  });
                }else if(querySnapshot){
                  let checkEmail = dbSales.collection('company')
                    .where("companyId","!=", self.edit.companyId)
                    .where("emailAddress", "==", self.edit.emailAddress);

                  checkEmail.get().then((querySnapshot) => {
                    if(!querySnapshot.empty){
                      querySnapshot.forEach((doc) => {
                        if(doc.exists){
                          self.$swal({
                            title: 'Invalid',
                            text: 'Email address already exists.',
                            icon: 'error',
                            confirmButtonColor: '#b80000',
                            confirmButtonText: 'OK'
                          });
                          self.requestProcessing = false;
                        }
                      });
                    }else if(querySnapshot){
                      try{
                        dbSales.collection('company')
                        .doc(self.edit.id)
                        .update({
                          company: self.edit.company,
                          address: self.edit.address,
                          tinNumber: self.edit.tinNumber,
                          contactNumber: self.edit.contactNumber,
                          emailAddress: self.edit.emailAddress,
                          dateModified: today
                        }).then(() => {
                          self.requestProcessing = false;
                          self.$v.edit.$reset();
                          self.$refs['company-table'].reset();
                          self.getCompanies(self.companyStat);
                          self.$bvModal.hide('edit-company-modal');
                          self.$swal({
                            title: 'Success',
                            text: 'Company updated successfully!',
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
              });
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
                  self.$refs['company-table'].reset();
                  self.getCompanies(stat);
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
  /*Form styles*/
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>