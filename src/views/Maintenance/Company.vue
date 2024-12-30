<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <div class="table-full-width">
          <!-- Company table -->
          <vue-good-table :columns="columns"
            :rows="companies"
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
              <b><span v-if="props.column.field == 'companyName'">
                <span>{{props.row.companyName}}</span>
              </span>
              <span v-if="props.column.field == 'address'">
                <span>{{props.row.address}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openUpdateCompanyModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit records on table -->
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
              @input="getPaginatedCompanies()"></v-select>
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
      <!-- ADD COMPANY MODAL -->
      <b-modal size="md"
        id="new-company-modal"
        title="New Company" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Company Name:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="newCompany"
              id="inputStyle"
              type="text"
              placeholder="Company"></base-input>
            <i class="text-red"
              v-if="$v.newCompany.$anyDirty && !$v.newCompany.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newCompany.$anyDirty && !$v.newCompany.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <textarea rows="4"
              cols="49"
              v-model="newAddress"
              id="inputStyle"
              class="pl-2"
              placeholder="Address"></textarea>
            <i class="text-red"
              v-if="$v.newAddress.$anyDirty && !$v.newAddress.required">Field Required</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addCompany"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-company-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE COMPANY MODAL -->
      <b-modal size="md"
        id="update-company-modal"
        title="Edit Company" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Company Name:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <base-input v-model="edit.companyName"
              id="inputStyle"
              type="text"
              placeholder="Company Name"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.companyName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.companyName.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-12 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-12 pl-5 pr-5">
            <textarea rows="4"
              cols="49"
              v-model="edit.address"
              id="inputStyle"
              class="pl-2"
              placeholder="Address"></textarea>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.address.required">Field Required</i>
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
                @click.native="$bvModal.hide('update-company-modal')"
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

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  const moment  = require('moment');
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Company table
        columns: [{
            label: 'Company',
            field: 'companyName'
          },{
            label: 'Address',
            field: 'address'
          },{
            label: '',
            field:'action',
            sortable: false,
            width: '50px'
          }
        ],
        loading: true,
        companies: [],
        // Enable or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // New company
        newCompany: '',
        newAddress: '',
        // Edit company
        edit: {
          id: '',
          companyId: '',
          companyName: '',
          address: ''
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
      this.getPaginatedCompanies();
    },
    validations: {
      // New company validations
      newCompany: {
        required,
        alphaNumCustomValidator
      },
      newAddress: {required},
      // Edit company validations
      edit: {
        companyName: {
          required,
          alphaNumCustomValidator
        },
        address: {required}
      }
    },
    methods: {
      // Display company details on table
      getPaginatedCompanies() {
        let self = this, companyData = null, coms = [], ids = [];

        self.loading = true;
        self.companies = [];
        if(self.limit != "all"){
          companyData = dbMains.collection("companies")
            .orderBy("companyName", "asc").limit(self.limit);
        }else if(self.limit == "all"){
          companyData = dbMains.collection("companies")
            .orderBy("companyName", "asc");
        }
        companyData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              coms.push(doc.data());
              ids.push(doc.id);
            });
            coms.sort(function(a,b) {
              return a.companyName - b.companyName;
            });
            for(let i = 0; i < coms.length; i++){
              coms[i]["rowNum"] = 1 + i;
              coms[i]["id"] = ids[i];
              coms[i].dateCreated = moment.unix(coms[i].dateCreated.seconds);
              self.companies.push(coms[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Save new company details
      addCompany(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newCompany.$touch();
        self.$v.newAddress.$touch();
        if(!self.$v.newCompany.$error && !self.$v.newAddress.$error){
          let nameData = null;

          self.requestProcessing = true;
          nameData = dbMains.collection('companies')
            .where("companyName", "==",self.newCompany);
          nameData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Company name already exists.',
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
              let dataId = 'CID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('companies').doc()
                  .set({
                    companyId: dataId,
                    companyName: self.newCompany,
                   address: self.newAddress,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newCompany = '';
                    self.newAddress = '';
                    self.requestProcessing = false;
                    self.$v.newCompany.$reset();
                    self.$v.newAddress.$reset();
                    self.$bvModal.hide('new-company-modal');
                    self.getPaginatedCompanies();
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
      },
      // Show edit company form
      openUpdateCompanyModal(row){
        this.edit = {
          id: row.id,
          companyId: row.companyId,
          companyName: row.companyName,
          address: row.address
        }
        this.$bvModal.show('update-company-modal');
      },
      // Change company details
      updateCompany(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let nameData = null;

          nameData = dbMains.collection('companies')
            .where("companyName", "==", self.edit.companyName)
           .where("companyId", "!=", self.edit.companyId);
          nameData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                      title: 'Invalid',
                      text: 'Company already exists.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("companies")
                .doc(self.edit.id)
                .update({
                  companyName: self.edit.companyName,
                  address: self.edit.address,
                  dateModified: today
                }).then(() => {
                  self.edit= {};
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-company-modal');
                  self.requestProcessing = false;
                  self.getPaginatedCompanies();
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