<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <!-- Business section table -->
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="businessSections"
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
              <b><span v-if="props.column.field == 'sectionName'">
                <span>{{props.row.sectionName}}</span>
              </span>
              <span v-if="props.column.field == 'sectionAddress'">
                <span>{{props.row.sectionAddress}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openUpdateBusinessSectionModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <div class="row pl-4"
          v-if="!loading && businessSections.length">
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
              @input="getPaginatedBusinessSections(1, '')"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <div class="text-right pt-2">
          <base-button v-b-modal.new-business-section-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Business Section</base-button>
        </div>
      </card>
      <!-- ADD BUSINESS SECTION MODAL -->
      <b-modal size="lg"
        id="new-business-section-modal"
        title="New Business Section" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Section Name:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newSectionName"
              id="inputStyle"
              type="text"
              placeholder="Section Name"></base-input>
            <i class="text-red"
              v-if="$v.newSectionName.$anyDirty && !$v.newSectionName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newSectionName.$anyDirty && !$v.newSectionName.alphaNumCustomValidator">Invalid Characters</i>
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
            <i class="text-red"
              v-if="$v.newAddress.$anyDirty && !$v.newAddress.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addBusinessSection"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-business-section-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE BUSINESS SECTION MODAL -->
      <b-modal size="lg"
        id="update-business-section-modal"
        title="Edit Business Section" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Section Name:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Address:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.sectionName"
              id="inputStyle"
              type="text"
              placeholder="Section Name"></base-input>
            <i class="text-red"
              v-if="$v.edit.sectionName.$anyDirty && !$v.edit.sectionName.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.sectionName.$anyDirty && !$v.edit.sectionName.alphaNumCustomValidator">Invalid Characters</i>
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
            <i class="text-red"
              v-if="$v.edit.address.$anyDirty && !$v.edit.address.alphaNumCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updateBusinessSection"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-business-section-modal')"
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

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  // const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9. ]*$/);
  const tableColumns = ["#", "Business Section", "Address", "Actions"];
  const moment  = require('moment');
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        columns: [{
            label: 'Business Section',
            field: 'sectionName'
          },{
            label: 'Address',
            field: 'sectionAddress'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '50px'
          }
        ],
        loading: true,
        loadError: false,
        businessSectionTable: {
          title: "Business Section Table",
          subTitle: "",
          columns: [...tableColumns]},
        businessSectionsCount: 0,
        businessSections: [],
        currentPage: 1 ,
        searchTerm: '',
        searching: false,
        requestProcessing: false,
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        newSectionName: '',
        newAddress: '',
        edit: {
          id: '',
          businessSectionId: '',
          sectionName: '',
          address: ''
        }
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
      this.getPaginatedBusinessSections(1, "");
    },
    validations: {
      newSectionName: {
        required,
        alphaNumCustomValidator
      },
      newAddress: {
        required,
        alphaNumCustomValidator
      },
      edit: {
        sectionName: {
          required,
          alphaNumCustomValidator
        },
        address: {
          required,
          alphaNumCustomValidator
        }
      }
    },
    methods: {
      getPaginatedBusinessSections(page, searchTerm) {
        let self = this, businessSectionData = null, sections = [], ids = [];

        self.loading = true;
        self.loadError = false;
        self.businessSections = [];
        if(searchTerm) {
          self.searching = true;
        }
        if(searchTerm){
          if(self.limit != "all"){
            businessSectionData = dbMains.collection("businessSections")
              .where("sectionName", "==", upperCase(searchTerm))
              .orderBy("dateCreated", "asc")
              .limit(self.limit);
          }else if(self.limit == "all"){
            businessSectionData = dbMains.collection("businessSections")
              .where("sectionName", "==", upperCase(searchTerm))
              .orderBy("dateCreated", "asc");
          }
        }else{
          if(self.limit != "all"){
            businessSectionData = dbMains.collection("businessSections")
              .orderBy("dateCreated", "asc").limit(self.limit);
          }else if(self.limit == "all"){
            businessSectionData = dbMains.collection("businessSections")
              .orderBy("dateCreated", "asc");
          }
        }
        businessSectionData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              sections.push(doc.data());
              ids.push(doc.id);
            });
            sections.sort(function(a,b) {
              return a.sectionName - b.sectionName;
            });
            for(let i = 0; i < sections.length; i++){
              sections[i]["rowNum"] = 1 + i;
              sections[i]["id"] = ids[i];
              sections[i].dateCreated = moment.unix(sections[i].dateCreated.seconds);
              self.businessSections.push(sections[i]);
            }
            // let firstRow = (page - 1) * 10;
            // let lastRow = (page * 10);

            // for(let k = firstRow; k < lastRow; k++){
            //   if(sections[k]){
            //     self.businessSections.push(sections[k]);
            //   }
            // }
            self.businessSectionsCount = sections.length;
            self.currentPage = page;
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      onPageChange (page) {
        let searchTerm = this.searchTerm;

        this.getPaginatedBusinessSections(page, searchTerm);
      },
      resetData() {
        this.searching = false;
        if(this.searchTerm == "") {
          this.getPaginatedBusinessSections(1, "");
        }
      },
      reloadData() {
        this.searchTerm = "";
        this.searching = false;
        this.getPaginatedBusinessSections(1, "");
      },
      search() {
        let searchTerm = this.searchTerm;

        if(searchTerm) {
          this.getPaginatedBusinessSections(1, searchTerm);
        }
      },
      addBusinessSection(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newSectionName.$touch();
        self.$v.newAddress.$touch();
        if(!self.$v.newSectionName.$error && !self.$v.newAddress.$error){
          let sectionData = null;

          self.requestProcessing = true;
          sectionData = dbMains.collection('businessSections')
            .where("sectionName", "==", upperCase(self.newSectionName));
          sectionData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Business section already exists.',
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
              let dataId = 'BCI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('businessSections').doc()
                  .set({
                    businessSectionId: dataId,
                    sectionName: upperCase(self.newSectionName),
                    sectionAddress: self.newAddress,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newSectionName = '';
                    self.newAddress = '';
                    self.requestProcessing = false;
                    self.$v.newSectionName.$reset();
                    self.$v.newAddress.$reset();
                    self.$bvModal.hide('new-business-section-modal');
                    self.getPaginatedBusinessSections(1, "");
                    self.$swal({
                      title: 'Success',
                      text: 'New business section added successfully!',
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
      openUpdateBusinessSectionModal(row){
        this.edit = {
          id: row.id,
          businessSectionId: row.businessSectionId,
          sectionName: row.sectionName,
          address: row.sectionAddress
        }
        this.$bvModal.show('update-business-section-modal');
      },
      updateBusinessSection(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let sectionData = null;

          sectionData = dbMains.collection('businessSections')
            .where("sectionName", "==", upperCase(self.edit.sectionName))
            .where("businessSectionId", "!=", self.edit.businessSectionId);
          sectionData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                      title: 'Invalid',
                      text: 'Business section already exists.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("businessSections")
                .doc(self.edit.id)
                .update({
                  sectionName: upperCase(self.edit.sectionName),
                  sectionAddress: self.edit.address, 
                  dateModified: today
                }).then(() => {
                  self.edit= {};
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-business-section-modal');
                  self.requestProcessing = false;
                  self.getPaginatedBusinessSections(1, "");
                  self.$swal({
                    title: 'Success',
                    text: 'Business section updated successfully!',
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