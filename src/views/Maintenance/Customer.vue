<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="customers"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading">
            <template slot="table-row" slot-scope="props">
              <b><span v-if="props.column.field == 'name'">
                <span>{{props.row.name}}</span>
              </span>
              <span v-if="props.column.field == 'type'">
                <span>{{props.row.type == 'individual' ? 'Individual' : 'Corporate'}}</span>
              </span>
              <span v-if="props.column.field == 'tin'">
                <span>{{props.row.tin == '' ? '----------' : props.row.tin}}</span>
              </span>
              <span v-if="props.column.field == 'email'">
                <span>{{props.row.email == '' ? '----------' : props.row.email}}</span>
              </span>
              <span v-if="props.column.field == 'contactNumber'">
                <span>{{props.row.contactNumber == '' ? '----------' : props.row.contactNumber}}</span>
              </span>
              <span v-if="props.column.field == 'address'">
                <span>{{props.row.address == '' ? '----------' : props.row.address}}</span>
              </span>
              <span v-if="props.column.field == 'term'">
                <span>{{props.row.term == '' ? '----------' : props.row.term}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openUpdateCustomerModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <div class="row pl-4"
          v-if="!loading && customers.length">
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
              @input="getPaginatedCustomers()"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <div class="text-right pt-2">
          <base-button id="darkBtn"
            class="col-md-2 ml-2 mr-2"
            v-if="customers.length != 0"
            v-on:click="exportCustomer">Export</base-button>
          <base-button @click="printCustomer"
            id="darkBtn"
            v-if="customers.length != 0"
            class="col-md-2 ml-2 mr-2">Print</base-button>
          <base-button v-b-modal.new-customer-modal
            id="darkBtn"
            class="col-md-3 ml-2 mr-2">New Customer</base-button>
        </div>
      </card>
      <!-- ADD CUSTPMER MODAL -->
      <b-modal size="lg"
        id="new-customer-modal"
        title="New Customer" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Type:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b v-if="newType == 'individual'">Full Name:</b>
            <b v-if="newType == 'corporate'">Company:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select
              id="inputStyle"
              :options="customerTypes"
              :reduce="type => type.typeId"
              label="type"
              v-model="newType"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.newType.$anyDirty && !$v.newType.required">Field Required</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5"
            v-if="newType == 'individual'">
            <base-input v-model="newFullName"
              id="inputStyle"
              type="text"
              placeholder="Full Name"></base-input>
            <i class="text-red"
              v-if="$v.newFullName.$anyDirty && !$v.newFullName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newFullName.$anyDirty && !$v.newFullName.alphaCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5"
            v-if="newType == 'corporate'">
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
          <label class="col-sm-6 col-form-label">
            <b>Tin:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Email:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newTin"
              id="inputStyle"
              type="text"
              placeholder="Tin"></base-input>
            <i class="text-red"
              v-if="$v.newTin.$anyDirty && !$v.newTin.numCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newEmail"
              id="inputStyle"
              type="text"
              placeholder="Email"></base-input>
            <i class="text-red"
              v-if="$v.newEmail.$anyDirty && !$v.newEmail.email">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Contact Number:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newContactNumber"
              id="inputStyle"
              type="text"
              placeholder="Contact Number"></base-input>
            <i class="text-red"
              v-if="$v.newContactNumber.$anyDirty && !$v.newContactNumber.numCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <textarea rows="4"
              cols="49"
              v-model="newAddress"
              id="inputStyle"
              class="pl-2"
              placeholder="Address"></textarea>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Payment Terms:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Credit Limit:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="paymentTerms"
              :reduce="term => term.paymentTermId"
              label="description"
              v-model="newTerm"
              :clearable="true"></v-select>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newCreditLimit"
              id="inputStyle"
              type="text"
              placeholder="Credit Limit"></base-input>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Is Taxable?</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Business Style:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="taxables"
              :reduce="tax => tax.taxableId"
              label="taxable"
              v-model="newTaxable"
              :clearable="true"></v-select>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newBusStyle"
              id="inputStyle"
              type="text"
              placeholder="Business Style"></base-input>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addCustomer"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-customer-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE CUSTOMER MODAL -->
      <b-modal size="lg"
        id="update-customer-modal"
        title="Edit Customer" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Type:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b v-if="edit.type == 'individual'">Full Name:</b>
            <b v-if="edit.type == 'corporate'">Company:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="customerTypes"
              :reduce="type => type.typeId"
              label="type"
              v-model="edit.type"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.edit.type.$anyDirty && !$v.edit.type.required">Field Required</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5"
            v-if="edit.type == 'individual'">
            <base-input v-model="edit.fullName"
              id="inputStyle"
              type="text"
              placeholder="Full Name"></base-input>
            <i class="text-red"
              v-if="$v.edit.fullName.$anyDirty && !$v.edit.fullName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.fullName.$anyDirty && !$v.edit.fullName.alphaCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5"
            v-if="edit.type == 'corporate'">
            <base-input v-model="edit.company"
              id="inputStyle"
              type="text"
              placeholder="Company"></base-input>
            <i class="text-red"
              v-if="$v.edit.company.$anyDirty && !$v.edit.company.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.company.$anyDirty && !$v.edit.company.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Tin:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Email:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.tin"
              id="inputStyle"
              type="text"
              placeholder="Tin"></base-input>
            <i class="text-red"
              v-if="$v.edit.tin.$anyDirty && !$v.edit.tin.numCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.email"
              id="inputStyle"
              type="text"
              placeholder="Email"></base-input>
            <i class="text-red"
              v-if="$v.edit.email.$anyDirty && !$v.edit.email.email">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Contact Number:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.contactNumber"
              id="inputStyle"
              type="text"
              placeholder="Contact Number"></base-input>
            <i class="text-red"
              v-if="$v.edit.contactNumber.$anyDirty && !$v.edit.contactNumber.numCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <textarea rows="4"
              cols="49"
              v-model="edit.address"
              id="inputStyle"
              class="pl-2"
              placeholder="Address"></textarea>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Payment Terms:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Credit Limit:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="paymentTerms"
              :reduce="term => term.paymentTermId"
              label="description"
              v-model="edit.term"
              :clearable="true"></v-select>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.creditLimit"
              id="inputStyle"
              type="text"
              placeholder="Credit Limit"></base-input>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Is Taxable?</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Business Style:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="taxables"
              :reduce="tax => tax.taxableId"
              label="taxable"
              v-model="edit.taxable"
              :clearable="true"></v-select>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.busStyle"
              id="inputStyle"
              type="text"
              placeholder="Business Style"></base-input>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateCustomer"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-customer-modal')"
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
  import {helpers, required, email} from "vuelidate/lib/validators";
  import printJS from 'print-js';
  import {alignment} from 'export-xlsx';
  import ExcelExport from 'export-xlsx';

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -./, A-Za-z0-9 ]*$/);
  const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z. ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ -. 0-9 ]*$/);
  const today = new Date();
  const addZero = require('add-zero');
  const moment = require('moment');

  export default {
    components: {},
    data() {
      return {
        columns: [{
            label: 'Name',
            field: 'name'
          },{
            label: 'Type',
            field: 'type'
          },{
            label: 'Tin',
            field: 'tin'
          },{
            label: 'Email',
            field: 'email'
          },{
            label: 'Contact No',
            field: 'contactNumber'
          },{
            label: 'Address',
            field: 'address',
            width: '200px'
          },{
            label: 'Terms',
            field: 'term',
          },{
            label: '',
            field:'action',
            sortable: false,
            width: '25px'
          }
        ],
        loading: true,
        customers: [],
        requestProcessing: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        customerTypes: [
          {'typeId': 'corporate', 'type': 'Corporate'},
          {'typeId': 'individual', 'type': 'Individual'},
        ],
        paymentTerms: [],
        taxables: [
          {'taxableId': 1, 'taxable': 'Yes'},
          {'taxableId': 0, 'taxable': 'No'}
        ],
        newType: 'corporate',
        newFullName: '',
        newCompany: '',
        newTin: '',
        newEmail: '',
        newContactNumber: '',
        newAddress: '',
        newTerm: '',
        newCreditLimit: '',
        newTaxable: '',
        newBusStyle: '',
        edit: {
          id: '',
          customerId: '',
          type: '',
          fullName: '',
          company: '',
          tin: '',
          email: '',
          contactNumber: '',
          address: '',
          term: '',
          creditLimit: '',
          taxable: '',
          busStyle: ''
        },
      };
    },
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
      this.getPaymentTerms();
      this.getPaginatedCustomers();
    },
    validations: {
      newType: {required},
      newFullName: {
        required,
        alphaCustomValidator
      },
      newCompany: {
        required,
        alphaNumCustomValidator
      },
      newTin: {numCustomValidator},
      newEmail: {email},
      newContactNumber: {numCustomValidator},
      edit: {
        type: {required},
        fullName: {
          required,
          alphaCustomValidator
        },
        company: {
          required,
          alphaNumCustomValidator
        },
        tin: {numCustomValidator},
        email: {email},
        contactNumber: {numCustomValidator}
      }
    },
    methods: {
      getPaymentTerms(){
        let self = this;

        self.paymentTerms = [];
        let termData = dbMains.collection("paymentTerms")
          .orderBy("description","asc");

        termData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            self.paymentTerms.push(doc.data());
          });
        });
      },
      getPaginatedCustomers() {
        let self = this, customerData = null, data = [], ids = [];

        self.loading = true;
        self.customers = [];
        if(self.limit != "all"){
          customerData = dbMains.collection("customers")
            .orderBy("name", "asc").limit(self.limit);
        }else if(self.limit == "all"){
          customerData = dbMains.collection("customers")
            .orderBy("name", "asc");
        }
        customerData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              data.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < data.length; i++){
              data[i]["rowNum"] = 1 + i;
              data[i]["id"] = ids[i];
              data[i]["term"] = '';
              for(let a = 0; a < self.paymentTerms.length; a++){
                if(data[i].paymentTermReference == self.paymentTerms[a].paymentTermId){
                  data[i].term = self.paymentTerms[a].description;
                }
              }
              self.customers.push(data[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      addCustomer(){
        let self = this, formError = true;

        self.requestProcessing = false;
        self.$v.newType.$touch();
        self.$v.newFullName.$touch();
        self.$v.newCompany.$touch();
        self.$v.newTin.$touch();
        self.$v.newEmail.$touch();
        self.$v.newContactNumber.$touch();
        if(self.newType == 'individual' && !self.$v.newType.$error){
          if(!self.$v.newFullName.$error && !self.$v.newTin.$error && !self.$v.newEmail.$error && !self.$v.newContactNumber.$error){
            formError = false;
          }
        }else if(self.newType == 'corporate' && !self.$v.newType.$error){
          if(!self.$v.newCompany.$error && !self.$v.newTin.$error && !self.$v.newEmail.$error && !self.$v.newContactNumber.$error){
            formError = false;
          }
        }
        if(!formError){
          let nameData = null, name = '';

          self.requestProcessing = true;
          if(self.newType == 'individual'){
            nameData = dbMains.collection('customers')
              .where("name", "==",self.newFullName);
            name = self.newFullName;
          }else if(self.newType == 'corporate'){
            nameData = dbMains.collection('customers')
              .where("name", "==",self.newCompany);
            name = self.newCompany;
          }
          nameData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Full Name/Company already exists.',
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
                  dbMains.collection('customers').doc()
                  .set({
                    customerId: dataId,
                    name: name,
                    type: self.newType,
                    tin: self.newTin,
                    email: self.newEmail,
                    contactNumber: self.newContactNumber,
                    address: self.newAddress,
                    paymentTermReference: self.newTerm,
                    creditLimit: self.newCreditLimit,
                    taxable: self.newTaxable,
                    businessStyle: self.newBusStyle,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newType = 'corporate';
                    self.newFullName = '';
                    self.newCompany = '';
                    self.newTin = '';
                    self.newEmail = '';
                    self.newContactNumber = '';
                    self.newAddress = '';
                    self.newTerm = '';
                    self.newCreditLimit = '';
                    self.newTaxable = '';
                    self.newBusStyle = '';
                    self.requestProcessing = false;
                    self.$v.newType.$reset();
                    self.$v.newFullName.$reset();
                    self.$v.newCompany.$reset();
                    self.$v.newTin.$reset();
                    self.$v.newEmail.$reset();
                    self.$v.newContactNumber.$reset();
                    self.$bvModal.hide('new-customer-modal');
                    self.getPaginatedCustomers();
                    self.$swal({
                      title: 'Success',
                      text: 'New customer added successfully!',
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
      openUpdateCustomerModal(row){
        this.edit = {
          id: row.id,
          customerId: row.customerId,
          type: row.type,
          tin: row.tin,
          email: row.email,
          contactNumber: row.contactNumber,
          address: row.address,
          term: row.paymentTermReference,
          creditLimit: row.creditLimit,
          taxable: row.taxable,
          busStyle: row.businessStyle
        }
        if(this.edit.type == 'individual'){
          this.edit.fullName = row.name;
        }else{
          this.edit.company = row.name;
        }
        this.$bvModal.show('update-customer-modal');
      },
      updateCustomer(){
        let self = this, hasError = true;

        self.requestProcessing = true;
        self.$v.edit.type.$touch();
        self.$v.edit.fullName.$touch();
        self.$v.edit.company.$touch();
        self.$v.edit.tin.$touch();
        self.$v.edit.email.$touch();
        self.$v.edit.contactNumber.$touch();
        if(!self.$v.edit.type.$error && self.edit.type == 'individual'){
          if(!self.$v.edit.fullName.$error && !self.$v.edit.tin.$error && !self.$v.edit.email.$error && !self.$v.edit.contactNumber.$error){
            hasError = false;
          }
        }else if(!self.$v.edit.type.$error && self.edit.type == 'corporate'){
          if(!self.$v.edit.company.$error && !self.$v.edit.tin.$error && !self.$v.edit.email.$error && !self.$v.edit.contactNumber.$error){
            hasError = false;
          }
        }
        if(!hasError){
          let nameData = null, name = '';

          if(self.edit.type == 'individual'){
            nameData = dbMains.collection('customers')
              .where("name", "==", self.edit.fullName)
              .where("customerId", "!=", self.edit.customerId);
            name = self.edit.fullName;
          }else if(self.edit.type == 'corporate'){
            nameData = dbMains.collection('customers')
              .where("name", "==", self.edit.company)
              .where("customerId", "!=", self.edit.customerId);
            name = self.edit.company;
          }
          nameData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                      title: 'Invalid',
                      text: 'Customer already exists.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("customers")
                .doc(self.edit.id)
                .update({
                  name: name,
                  type: self.edit.type,
                  tin: self.edit.tin,
                  email: self.edit.email,
                  contactNumber: self.edit.contactNumber,
                  address: self.edit.address,
                  paymentTermReference: self.edit.term,
                  creditLimit: self.edit.creditLimit,
                  taxable: self.edit.taxable,
                  businessStyle: self.edit.busStyle,
                  dateModified: today
                }).then(() => {
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-customer-modal');
                  self.requestProcessing = false;
                  self.getPaginatedCustomers();
                  self.$swal({
                    title: 'Success',
                    text: 'Customer updated successfully!',
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
      printCustomer(){
        let self = this;
        let printCustomer = self.customers;

        for(let a = 0; a < printCustomer.length; a++){
          if(printCustomer[a].type == 'individual'){
            printCustomer[a].type = 'Individual';
          }else{
            printCustomer[a].type = 'Corporate';
          }
        }
        printJS({
          printable: printCustomer,
          properties: [{
              field: 'name',
              displayName: 'Name'
            },{
              field: 'type',
              displayName: 'Type'
            },{
              field: 'tin',
              displayName: 'Tin'
            },{
              field: 'email',
              displayName: 'Email'
            },{
              field: 'contactNumber',
              displayName: 'Contact No.'
            },{
              field: 'address',
              displayName: 'Address'
            },{
              field: 'term',
              displayName: 'Terms'
            }
          ],
          type: 'json',
          header: '<h2>Customers</h2>',
            style: 'td { text-align: center; } body { font-family: "Calibri"; }',
            documentTitle: 'Customers ' + moment().format("MMMM YYYY")
        });
      },
      exportCustomer(){
        const excelExport = new ExcelExport();

        let self = this;
        let exportCustomer = self.customers, companyName = '';
        let companyData = dbMains.collection('companyProfile');

        for(let a = 0; a < exportCustomer.length; a++){
          if(exportCustomer[a].type == 'individual'){
            exportCustomer[a].type = 'Individual';
          }else{
            exportCustomer[a].type = 'Corporate';
          }
          for(let b = 0; b < self.paymentTerms.length; b++){
            if(exportCustomer[a].paymentTermReference == self.paymentTerms[b].paymentTermId){
              exportCustomer[a]["paymentTerm"] = self.paymentTerms[b].description;
            }
          }
          if(exportCustomer[a].taxable == 1){
            exportCustomer[a].taxable = 'Yes';
          }else{
            exportCustomer[a].taxable = 'No';
          }
        }
        companyData.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            companyName = doc.data().name;
          });
          const SETTINGS_FOR_EXPORT = {
          // Table settings
            fileName: companyName + ' Customers (' + moment().format("MMM DD, YYYY") + ')',
            workSheets: [{
              sheetName: 'Customers',
              startingRowNumber: 2,
              gapBetweenTwoTables: 2,
              tableSettings: {
                data: {
                  importable: true,
                  tableTitle: companyName + ' Customers: (' + moment().format("MMM DD, YYYY") + ')',
                  headerDefinition: [{
                    name: 'Number',
                    key: 'num',
                    width: 10
                  },{
                    name: 'Name',
                    key: 'name',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Type',
                    key: 'type',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Tin',
                    key: 'tin',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Email',
                    key: 'email',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Contact Number',
                    key: 'contactNumber',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Address',
                    key: 'address',
                    width: 36,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Terms',
                    key: 'paymentTerm',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Credit Limit',
                    key: 'creditLimit',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  },{
                    name: 'Taxable?',
                    key: 'taxable',
                    width: 18,
                    style: {alignment: alignment.middleCenter},
                  }],
                },
              },
            }],
          };
          const data = [];

          for(let e = 0; e < exportCustomer.length; e++){
            exportCustomer[e]["num"] = e + 1;
          }
          data.push({data : exportCustomer});

          excelExport.downloadExcel(SETTINGS_FOR_EXPORT, data);
        });
      }
    }
  };
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>