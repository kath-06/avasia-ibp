<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="suppliers"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading">
            <template slot="table-row" slot-scope="props">
              <b><span v-if="props.column.field == 'supplierName'">
                <span>{{props.row.supplierName}}</span>
              </span>
              <span v-if="props.column.field == 'contactNumber'">
                <span>{{props.row.contactNumber == '' ? '----------' : props.row.contactNumber}}</span>
              </span>
              <span v-if="props.column.field == 'email'">
                <span>{{props.row.email == '' ? '----------' : props.row.email}}</span>
              </span>
              <span v-if="props.column.field == 'address'">
                <span>{{props.row.address}}</span>
              </span>
              <span v-if="props.column.field == 'tin'">
                <span>{{props.row.tin == '' ? '----------' : props.row.tin}}</span>
              </span>
              <span v-if="props.column.field == 'supplierType'">
                <span>{{props.row.supplierType == 'individual' ? 'Individual' : 'Corporate'}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openUpdateSupplierModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <div class="row pl-4"
          v-if="!loading && suppliers.length">
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
              @input="getPaginatedSuppliers()"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <div class="text-right pt-2">
          <base-button v-b-modal.new-supplier-modal
            id="darkBtn"
            class="col-md-3 ml-2 mr-2">New Supplier</base-button>
          <base-button v-b-modal.note-to-supplier-modal
            id="darkBtn"
            class="col-md-3 ml-2 mr-2">Note to Supplier</base-button>
        </div>
      </card>
      <!-- ADD SUPPLIER MODAL -->
      <b-modal size="lg"
        id="new-supplier-modal"
        title="New Supplier" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Supplier Name:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Contact Person:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newSupplierName"
              id="inputStyle"
              type="text"
              placeholder="Supplier"></base-input>
            <i class="text-red"
              v-if="$v.newSupplierName.$anyDirty && !$v.newSupplierName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newSupplierName.$anyDirty && !$v.newSupplierName.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newContactPerson"
              id="inputStyle"
              type="text"
              placeholder="Contact Person"></base-input>
            <i class="text-red"
              v-if="$v.newContactPerson.$anyDirty && !$v.newContactPerson.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Contact Number:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Email:</b>
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
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Tin:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <textarea rows="4"
              cols="49"
              v-model="newAddress"
              id="inputStyle"
              class="pl-2"
              placeholder="Address"></textarea>
            <i class="text-red"
              v-if="$v.newAddress.$anyDirty && !$v.newAddress.required">Field Required</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newTin"
              id="inputStyle"
              type="text"
              placeholder="Tin"></base-input>
            <i class="text-red"
              v-if="$v.newTin.$anyDirty && !$v.newTin.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Withhold Tax?</b>
            <b class="text-red">* </b>
            <input type="checkbox"
              id="withholdTax"
              v-model="newWithholdTax">
          </label>
          <label class="col-sm-6 col-form-label">
            <b>With Tax?</b>
            <b class="text-red">* </b>
            <input type="checkbox"
              id="withVAT"
              v-model="newWithVAT">
          </label>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Supplier Type:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="supplierTypes"
              :reduce="type => type.typeId"
              label="type"
              v-model="newSupplierType"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.newSupplierType.$anyDirty && !$v.newSupplierType.required">Field Required</i>
            </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addSupplier"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-supplier-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE SUPPLIER MODAL -->
      <b-modal size="lg"
        id="update-supplier-modal"
        title="Edit Supplier" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Supplier Name:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Contact Person:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.supplierName"
              id="inputStyle"
              type="text"
              placeholder="Supplier"></base-input>
            <i class="text-red"
              v-if="$v.edit.supplierName.$anyDirty && !$v.edit.supplierName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.supplierName.$anyDirty && !$v.edit.supplierName.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.contactPerson"
              id="inputStyle"
              type="text"
              placeholder="Contact Person"></base-input>
            <i class="text-red"
              v-if="$v.edit.contactPerson.$anyDirty && !$v.edit.contactPerson.alphaCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Contact Number:</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Email:</b>
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
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Tin:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <textarea rows="4"
              cols="49"
              v-model="edit.address"
              id="inputStyle"
              class="pl-2"
              placeholder="Address"></textarea>
            <i class="text-red"
              v-if="$v.edit.address.$anyDirty && !$v.edit.address.required">Field Required</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.tin"
              id="inputStyle"
              type="text"
              placeholder="Tin"></base-input>
            <i class="text-red"
              v-if="$v.edit.tin.$anyDirty && !$v.edit.tin.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Withhold Tax?</b>
            <b class="text-red">* </b>
            <input type="checkbox"
              id="withholdTax"
              v-model="edit.withholdTax">
          </label>
          <label class="col-sm-6 col-form-label">
            <b>With Tax?</b>
            <b class="text-red">* </b>
            <input type="checkbox"
              id="withVAT"
              v-model="edit.withVAT">
          </label>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Supplier Type:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select id="inputStyle"
              :options="supplierTypes"
              :reduce="type => type.typeId"
              label="type"
              v-model="edit.supplierType"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.edit.supplierType.$anyDirty && !$v.edit.supplierType.required">Field Required</i>
            </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateSupplier"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-supplier-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- NOTE TO SUPPLIER MODAL -->
      <b-modal size="lg"
        id="note-to-supplier-modal"
        title="Note to Supplier" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-2 col-form-label">
            <b>Note:</b>
            <b class="text-red">*</b>
          </label>
          <div class="col-sm-8 pl-0">
            <textarea rows="2"
              cols="69"
              v-model="newNote"
              id="inputStyle"
              class="pl-2"
              placeholder="Note to supplier"></textarea>
            <i class="text-red"
              v-if="$v.newNote.$anyDirty && !$v.newNote.required">Field Required</i>
          </div>
          <div class="col-sm-2">
            <base-button id="darkBtn"
                @click="addNote()" block
                :disabled="requestProcessing">Add</base-button>
          </div>
        </div>
        <div class="table-full-width">
          <vue-good-table :columns="noteColumns"
            :rows="notes"
            :search-options="{enabled: false}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="noteLoading">
            <template slot="table-row" slot-scope="props">
              <b><span v-if="props.column.field == 'note'">
                <span>{{props.row.note}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openUpdateNoteModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('note-to-supplier-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE NOTE TO SUPPLIER MODAL -->
      <b-modal size="md"
        id="update-note-to-supplier-modal"
        title="Edit Note to Supplier" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-2 col-form-label">
            <b>Note:</b>
            <b class="text-red">*</b>
          </label>
          <div class="col-sm-8 pl-0">
            <textarea rows="2"
              cols="49"
              v-model="editNote"
              id="inputStyle"
              class="pl-2"
              placeholder="Note to supplier"></textarea>
            <i class="text-red"
              v-if="$v.editNote.$anyDirty && !$v.editNote.required">Field Required</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click="updateNote()"
                :disabled="requestProcessing">Update</base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-note-to-supplier-modal')"
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

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -./, A-Za-z0-9 ]*$/);
  const alphaCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z. ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ -. 0-9 ]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        columns: [{
            label: 'Supplier',
            field: 'supplierName'
          },{
            label: 'Contact No',
            field: 'contactNumber',
            width: '150px'
          },{
            label: 'Email',
            field: 'email',
            width: '150px'
          },{
            label: 'Address',
            field: 'address',
            width: '200px'
          },{
            label: 'Tin',
            field: 'tin'
          },{
            label: 'Type',
            field: 'supplierType'
          },{
            label: '',
            field:'action',
            sortable: false,
            width: '25px'
          }
        ],
        loading: true,
        suppliers: [],
        requestProcessing: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        supplierTypes: [
          {'typeId': 'individual', 'type': 'Individual'},
          {'typeId': 'corporate', 'type': 'Corporate'}
        ],
        newSupplierName: '',
        newContactPerson: '',
        newContactNumber: '',
        newEmail: '',
        newAddress: '',
        newTin: '',
        newWithholdTax: true,
        newWithVAT: true,
        newSupplierType: 'individual',
        edit: {
          id: '',
          supplierId: '',
          supplierName: '',
          contactPerson: '',
          contactNumber: '',
          email: '',
          address: '',
          tin: '',
          withholdTax: '',
          withVAT: '',
          supplierType: ''
        },
        newNote: '',
        noteColumns: [{
            label: 'Note',
            field: 'note'
          },{
            label: '',
            field:'action',
            sortable: false,
            width: '25px'
          }
        ],
        noteLoading: true,
        notes: [],
        editNoteId: '',
        editNote: '',
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
      this.getPaginatedSuppliers();
      this.getNotes();
    },
    validations: {
      newSupplierName: {
        required,
        alphaNumCustomValidator
      },
      newContactPerson: {alphaCustomValidator},
      newContactNumber: {numCustomValidator},
      newEmail: {email},
      newAddress: {required},
      newTin: {numCustomValidator},
      newSupplierType: {required},
      edit: {
        supplierName: {
          required,
          alphaNumCustomValidator
        },
        contactPerson: {alphaCustomValidator},
        contactNumber: {numCustomValidator},
        email: {email},
        address: {required},
        tin: {numCustomValidator},
        supplierType: {required}
      },
      newNote: {required},
      editNote: {required}
    },
    methods: {
      getPaginatedSuppliers() {
        let self = this, supplierData = null, sups = [], ids = [];

        self.loading = true;
        self.suppliers = [];
        if(self.limit != "all"){
          supplierData = dbMains.collection("suppliers")
            .orderBy("supplierName", "asc").limit(self.limit);
        }else if(self.limit == "all"){
          supplierData = dbMains.collection("suppliers")
            .orderBy("supplierName", "asc");
        }
        supplierData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              sups.push(doc.data());
              ids.push(doc.id);
            });
            sups.sort(function(a,b) {
              return a.supplierName - b.supplierName;
            });
            for(let i = 0; i < sups.length; i++){
              sups[i]["rowNum"] = 1 + i;
              sups[i]["id"] = ids[i];
              self.suppliers.push(sups[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      addSupplier(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newSupplierName.$touch();
        self.$v.newAddress.$touch();
        self.$v.newSupplierType.$touch();
        if(!self.$v.newSupplierName.$error && !self.$v.newAddress.$error && !self.$v.newSupplierType.$error){
          let nameData = null;

          self.requestProcessing = true;
          nameData = dbMains.collection('suppliers')
            .where("supplierName", "==",self.newSupplierName);
          nameData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Supplier name already exists.',
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
              let dataId = 'SID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('suppliers').doc()
                  .set({
                    supplierId: dataId,
                    supplierName: self.newSupplierName,
                    contactPerson: self.newContactPerson,
                    contactNumber: self.newContactNumber,
                    email: self.newEmail,
                    address: self.newAddress,
                    tin: self.newTin,
                    withholdTax: self.newWithholdTax,
                    withVAT: self.newWithVAT,
                    supplierType: self.newSupplierType,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newSupplierName = '';
                    self.newContactPerson = '';
                    self.newContactNumber = '';
                    self.newEmail = '';
                    self.newAddress = '';
                    self.newTin = '';
                    self.newWithholdTax = true;
                    self.newWithVAT = true;
                    self.newSupplierType = 'individual';
                    self.requestProcessing = false;
                    self.$v.newSupplierName.$reset();
                    self.$v.newAddress.$reset();
                    self.$v.newSupplierType.$reset();
                    self.$bvModal.hide('new-supplier-modal');
                    self.getPaginatedSuppliers();
                    self.$swal({
                      title: 'Success',
                      text: 'New supplier added successfully!',
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
      openUpdateSupplierModal(row){
        this.edit = {
          id: row.id,
          supplierId: row.supplierId,
          supplierName: row.supplierName,
          contactPerson: row.contactPerson,
          contactNumber: row.contactNumber,
          email: row.email,
          address: row.address,
          tin: row.tin,
          withholdTax: row.withholdTax,
          withVAT: row.withVAT,
          supplierType: row.supplierType
        }
        this.$bvModal.show('update-supplier-modal');
      },
      updateSupplier(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let nameData = null;

          nameData = dbMains.collection('suppliers')
            .where("supplierName", "==", self.edit.supplierName)
           .where("supplierId", "!=", self.edit.supplierId);
          nameData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                      title: 'Invalid',
                      text: 'Supplier already exists.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("suppliers")
                .doc(self.edit.id)
                .update({
                  supplierName: self.edit.supplierName,
                  contactPerson: self.edit.contactPerson,
                  contactNumber: self.edit.contactNumber,
                  email: self.edit.email,
                  address: self.edit.address,
                  tin: self.edit.tin,
                  withholdTax: self.edit.withholdTax,
                  withVAT: self.edit.withVAT,
                  supplierType: self.edit.supplierType,
                  dateModified: today
                }).then(() => {
                  self.edit= {};
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-supplier-modal');
                  self.requestProcessing = false;
                  self.getPaginatedSuppliers();
                  self.$swal({
                    title: 'Success',
                    text: 'Supplier updated successfully!',
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
      getNotes() {
        let self = this, noteData = null, note = [], ids = [];

        self.noteLoading = true;
        self.notes = [];
        noteData = dbMains.collection("supplierNotes")
            .orderBy("dateCreated", "asc");
        noteData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              note.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < note.length; i++){
              note[i]["rowNum"] = 1 + i;
              note[i]["id"] = ids[i];
              self.notes.push(note[i]);
            }
          }
          setTimeout(function() {
            self.noteLoading = false;
          }, 1000);
        });
      },
      addNote(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newNote.$touch();
        if(!self.$v.newNote.$error){
          self.requestProcessing = true;
          let getUserId = dbUsers.collection('users')
            .where("username", '==', localStorage.getItem('aisname'));
          let users = [];
          let dataId = 'NSI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

          getUserId.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              if(doc.exists){
                users.push(doc.data());
              }
            });
            try{
              dbMains.collection('supplierNotes').doc()
              .set({
                supplierNoteId: dataId,
                note: self.newNote,
                userReference: users[0].userId,
                status: 1,
                dateCreated: today,
                dateModified: today
              }).then(() => {
                self.newNote = '';
                self.requestProcessing = false;
                self.$v.newNote.$reset();
                self.getNotes();
                self.$swal({
                  title: 'Success',
                  text: 'New supplier note added successfully!',
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
      },
      openUpdateNoteModal(row){
        this.editNoteId= row.id;
        this.editNote = row.note;
        this.$bvModal.show('update-note-to-supplier-modal');
      },
      updateNote(){
        let self = this;

        self.requestProcessing = true;
        self.$v.editNote.$touch();
        if(!self.$v.editNote.$error){
          try{
            self.requestProcessing = true;
            dbMains.collection("supplierNotes")
            .doc(self.editNoteId)
            .update({
              note: self.editNote,
              dateModified: today
            }).then(() => {
              self.editNote = '';
              self.$v.editNote.$reset();
              self.$bvModal.hide('update-note-to-supplier-modal');
              self.requestProcessing = false;
              self.getNotes();
              self.$swal({
                title: 'Success',
                text: 'Supplier note updated successfully!',
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
            self.requestProcessing = false;
          }
        }
      },
    }
  };
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>