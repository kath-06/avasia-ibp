<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7">
      <card class="pt-4"
        id="textStyle">
        <div class="table-full-width">
          <!-- Withholding tax code table list -->
          <vue-good-table :columns="columns"
            :rows="withholdingTaxCodes"
            :search-options="{enabled: true}"
            :pagination-options="{
              enabled: true,
              perPageDropdown: [10, 15, 20],
            }"
            :sort-options="{enabled: true}"
            :line-numbers="true"
            :isLoading="loading"
            ref="wtc-table">
            <template slot="table-row"
              slot-scope="props">
              <b><span v-if="props.column.field == 'withholdingTaxCode'">
                <span>{{props.row.withholdingTaxCode}}</span>
              </span>
              <span v-if="props.column.field == 'withholdingTaxRate'">
                <span>{{props.row.withholdingTaxRate}}</span>
              </span>
              <span v-if="props.column.field == 'type'">
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
                  v-on:click="openUpdateWTaxCodeModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <!-- Limit record on table -->
        <div class="row pl-4"
          v-if="!loading && withholdingTaxCodes.length">
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
              @input="getPaginatedWithholdingTaxCodes(1, '')"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <!-- New withholding tax code button -->
        <div class="text-right pt-2">
          <base-button v-b-modal.new-withholding-tax-code-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Withholding Tax Code</base-button>
        </div>
      </card>
      <!-- ADD WITHHOLDING TAX CODE MODAL -->
      <b-modal size="lg"
        id="new-withholding-tax-code-modal"
        title="New Withholding Tax Code" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Withholding Tax Code:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Withholding Tax Rate:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newWithholdingTaxCode"
              id="inputStyle"
              type="text"
              placeholder="Withholding Tax Code"></base-input>
            <i class="text-red"
              v-if="$v.newWithholdingTaxCode.$anyDirty && !$v.newWithholdingTaxCode.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newWithholdingTaxCode.$anyDirty && !$v.newWithholdingTaxCode.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newWithholdingTaxRate"
              id="inputStyle"
              type="text"
              placeholder="Withholding Tax Rate"></base-input>
            <i class="text-red"
              v-if="$v.newWithholdingTaxRate.$anyDirty && !$v.newWithholdingTaxRate.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newWithholdingTaxRate.$anyDirty && !$v.newWithholdingTaxRate.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Type:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Nature of Income:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select input="inputStyle"
              :options="wTypes"
              :reduce="types => types.typeId"
              label="typeName"
              v-model="newType"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.newType.$anyDirty && !$v.newType.required">Field Required</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <textarea rows="4"
              cols="39"
              v-model="newNatureOfIncome"
              id="inputStyle"
              class="pl-2"
              placeholder="Nature Of Income"></textarea>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addWithholdingTaxCode"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-withholding-tax-code-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE WTAX CODE MODAL -->
      <b-modal size="lg"
        id="update-wtax-code-modal"
        title="Edit Withholding Tax Code" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Withholding Tax Code:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Withholding Tax Rate:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.wTaxCode"
              type="text"
              id="inputStyle"
              placeholder="Withholding Tax Code"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.wTaxCode.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.wTaxCode.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.wTaxRate"
              type="text"
              id="inputStyle"
              placeholder="Withholding Tax Rate"></base-input>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.wTaxRate.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.wTaxRate.numCustomValidator">Invalid Characters</i>
          </div> 
        </div>
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Type:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Nature of Income:</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <v-select input="inputStyle"
              :options="wTypes"
              :reduce="types => types.typeId"
              label="typeName"
              v-model="edit.type"
              :clearable="false"></v-select>
            <i class="text-red"
              v-if="$v.edit.$anyDirty && !$v.edit.type.required">Field Required</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <textarea rows="4"
              cols="39"
              v-model="edit.natureOfIncome"
              id="inputStyle"
              class="pl-2"
              placeholder="Nature Of Income"></textarea>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateWTaxCode"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-wtax-code-modal')"
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
  import {upperCase} from "text-case";
  import {mapGetters} from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9. ]*$/);
  const tableColumns = ["#", "Withholding Tax Code", "Tax Rate", "Type", "Actions"];
  const moment  = require('moment');
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        // Withholding tax code table
        columns: [{
            label: 'Withholding Tax Code',
            field: 'withholdingTaxCode'
          },{
            label: 'Tax Rate',
            field: 'withholdingTaxRate'
          },{
            label: 'Type',
            field: 'type'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '50px'
          }
        ],
        loading: true,
        loadError: false,
        withholdingTaxCodeTable: {
          title: "Withholding Tax Code Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        withholdingTaxCodesCount: 0,
        withholdingTaxCodes: [],
        currentPage: 1 ,
        searchTerm: '',
        searching: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // Disable/Enable buttons
        requestProcessing: false,
        // Type selection
        wTypes: [
          {"typeId": "Individual", "typeName": "Individual"},
          {"typeId": "Corporate", "typeName": "Corporate"}
        ],
        // New withholding tax code
        newWithholdingTaxCode: '',
        newWithholdingTaxRate: '',
        newType: 'Individual',
        newNatureOfIncome: '',
        // Edit withholding tax code
        edit: {
          id:'',
          wTaxCodeId: '',
          wTaxCode: '',
          wTaxRate: '',
          type: '',
          natureOfIncome: ''
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
      this.getPaginatedWithholdingTaxCodes(1, "");
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New withholding tax code
      newWithholdingTaxCode: {
        required,
        alphaNumCustomValidator
      },
      newWithholdingTaxRate: {
        required,
        numCustomValidator
      },
      newType: {required},
      // Edit withholding tax code
      edit: {
        wTaxCode: {
          required,
          alphaNumCustomValidator
        },
        wTaxRate: {
          required,
          numCustomValidator
        },
        type: {required}
      }
    },
    methods: {
      // Get withholding tax code data
      getPaginatedWithholdingTaxCodes(page, searchTerm) {
        let self = this, withholdingTaxCodeData = null, taxCodes = [], ids = [];

        self.loading = true;
        self.loadError = false;
        self.withholdingTaxCodes = [];
        if(searchTerm) {
          self.searching = true;
        }
        if(searchTerm){
          if(self.limit != "all"){
            withholdingTaxCodeData = dbMains.collection("withholdingTaxCode")
              .where("withholdingTaxCode", "==", upperCase(searchTerm))
              .orderBy("dateCreated", "asc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            withholdingTaxCodeData = dbMains.collection("withholdingTaxCode")
              .where("withholdingTaxCode", "==", upperCase(searchTerm))
              .orderBy("dateCreated", "asc");
          }
        }else{
          if(self.limit != "all"){
            withholdingTaxCodeData = dbMains.collection("withholdingTaxCode")
            .orderBy("dateCreated", "asc")
            .limit(self.limit);
          }else if(self.limit == "all"){
            withholdingTaxCodeData = dbMains.collection("withholdingTaxCode")
              .orderBy("dateCreated", "asc");
          }
        }
        withholdingTaxCodeData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              taxCodes.push(doc.data());
              ids.push(doc.id);
            });
            taxCodes.sort(function(a,b) {
              return a.withholdingTaxCode - b.withholdingTaxCode;
            });
            for(let i = 0; i < taxCodes.length; i++){
              taxCodes[i]["rowNum"] = 1 + i;
              taxCodes[i]["id"] = ids[i];
              taxCodes[i].dateCreated = moment.unix(taxCodes[i].dateCreated.seconds);
              self.withholdingTaxCodes.push(taxCodes[i]);
            }
            self.withholdingTaxCodesCount = taxCodes.length;
            self.currentPage = page;
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      onPageChange (page) {
        let searchTerm = this.searchTerm;

        this.getPaginatedWithholdingTaxCodes(page, searchTerm);
      },
      resetData() {
        this.searching = false;
        if(this.searchTerm == "") {
          this.getPaginatedWithholdingTaxCodes(1, "");
        }
      },
      reloadData() {
        this.searchTerm = "";
        this.searching = false;
        this.getPaginatedWithholdingTaxCodes(1, "");
      },
      search() {
        let searchTerm = this.searchTerm;

        if(searchTerm) {
          this.getPaginatedWithholdingTaxCodes(1, searchTerm);
        }
      },
      // Add new withholding tax code data
      addWithholdingTaxCode(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newWithholdingTaxCode.$touch();
        self.$v.newWithholdingTaxRate.$touch();
        self.$v.newType.$touch();
        if(!self.$v.newWithholdingTaxCode.$error && !self.$v.newWithholdingTaxRate.$error && !self.$v.newType.$error){
          let taxCodeData = null;

          self.requestProcessing = true;
          taxCodeData = dbMains.collection('withholdingTaxCode')
            .where("withholdingTaxCode", "==", upperCase(self.newWithholdingTaxCode));
          taxCodeData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Withholding tax code already exists.',
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
              let dataId = 'WTC-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('withholdingTaxCode').doc()
                  .set({
                    withholdingTaxCodeId: dataId,
                    withholdingTaxCode: upperCase(self.newWithholdingTaxCode),
                    withholdingTaxRate: self.newWithholdingTaxRate,
                    type: self.newType,
                    natureOfIncome: self.newNatureOfIncome,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newWithholdingTaxCode = '';
                    self.newWithholdingTaxRate = '';
                    self.newType = 'Individual';
                    self.newNatureOfIncome = '';
                    self.requestProcessing = false;
                    self.$v.newWithholdingTaxCode.$reset();
                    self.$v.newWithholdingTaxRate.$reset();
                    self.$v.newType.$reset();
                    self.$bvModal.hide('new-withholding-tax-code-modal');
                    self.$refs['wtc-table'].reset();
                    self.getPaginatedWithholdingTaxCodes(1, "");
                    self.$swal({
                      title: 'Success',
                      text: 'New withholding tax code added successfully!',
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
      // Open update withholding tax code modal
      openUpdateWTaxCodeModal(row){
        this.edit = {
          id: row.id,
          wTaxCodeId: row.withholdingTaxCodeId,
          wTaxCode: row.withholdingTaxCode,
          wTaxRate: row.withholdingTaxRate,
          type: row.type,
          natureOfIncome: row.natureOfIncome
        }
        this.$bvModal.show('update-wtax-code-modal');
      },
      // Change withholding tax code details
      updateWTaxCode(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let wTaxCodeData = null;

          wTaxCodeData = dbMains.collection('withholdingTaxCode')
            .where("withholdingTaxCode", "==", upperCase(self.edit.wTaxCode))
            .where("withholdingTaxCodeId", "!=", self.edit.wTaxCodeId);
          wTaxCodeData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Withholding tax code already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("withholdingTaxCode")
                .doc(self.edit.id)
                .update({
                  withholdingTaxCode: upperCase(self.edit.wTaxCode),
                  withholdingTaxRate: self.edit.wTaxRate,
                  type: self.edit.type,
                  natureOfIncome: self.edit.natureOfIncome,
                  dateModified: today
                }).then(() => {
                  self.edit= {};
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-wtax-code-modal');
                  self.requestProcessing = false;
                  self.getPaginatedWithholdingTaxCodes(1, "");
                  self.$refs['wtc-table'].reset();
                  self.$swal({
                    title: 'Success',
                    text: 'Withholding tax code updated successfully!',
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