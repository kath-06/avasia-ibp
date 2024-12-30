<template>
  <div> 
    <card class="pt-4"
      id="textStyle">
      <div class="row">
        <!-- Reimbursement status links -->
        <div class="col-12 text-left ml-1 mt-2 mb-2 pt-2">
          <badge class="badge-dot ml-2 pointer">
            <i id="activeBadge"
              v-if="stat == 1"></i>
            <i id="redBg" v-else></i>
            <span class="pointer status"
              id="linkTxt"
              v-on:click="getPaginatedReimDescs(1)">Enabled</span>
          </badge>
          <badge class="badge-dot ml-3 pointer">
            <i id="activeBadge"
              v-if="stat == 0"></i>
            <i id="redBg" v-else></i>
            <span class="pointer status"
              id="linkTxt"
              v-on:click="getPaginatedReimDescs(0)">Disabled</span>
          </badge>
        </div>
      </div>
      <div class="table-full-width">
        <!-- Reimbursement description table -->
        <vue-good-table :columns="columns"
          :rows="reimDescs"
          :search-options="{enabled: true}"
          :pagination-options="{
            enabled: true,
            perPageDropdown: [10, 15, 20],
          }"
          :sort-options="{enabled: true}"
          :line-numbers="true"
          :isLoading="loading"
          ref="reim-desc-table">
          <template slot="table-row" slot-scope="props">
            <b><span v-if="props.column.field == 'description'">
              <span>{{props.row.description}}</span>
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
                v-on:click="openUpdateReimDescModal(props.row)"
                title="Update"></span>
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
      <!-- Limit records on table -->
      <div class="row pl-4"
        v-if="!loading && reimDescs.length">
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
            @input="getPaginatedReimDescs(stat)"></v-select>
        </span>
      </div>
      <hr class="mb-2 mt-2">
      <!-- New reimbursemnt description button -->
      <div class="text-right pt-2">
        <base-button v-b-modal.new-reim-desc-modal
          id="darkBtn"
          class="col-md-4 ml-2 mr-2">New Reimbursement Description</base-button>
      </div>
    </card>
    <!-- ADD REIMBURSEMENT DESCRIPTION MODAL -->
    <b-modal size="md"
      id="new-reim-desc-modal"
      title="New Reimbursement Description" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-12 col-form-label">
          <b>Description:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-12 pl-5 pr-5">
          <base-input v-model="newDesc"
            id="inputStyle"
            type="text"
            placeholder="Description"></base-input>
          <i class="text-red"
            v-if="$v.newDesc.$anyDirty && !$v.newDesc.required">Field Required</i>
          <i class="text-red"
            v-if="$v.newDesc.$anyDirty && !$v.newDesc.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="addReimDesc"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Add
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('new-reim-desc-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
    <!-- UPDATE REIMBURSEMENT DESCRIPTION MODAL -->
    <b-modal size="md"
      id="update-reim-desc-modal"
      title="Edit Reimbursement Description" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-12 col-form-label">
          <b>Description:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-12 pl-5 pr-5">
          <base-input v-model="edit.desc"
            id="inputStyle"
            type="text"
            placeholder="Description"></base-input>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.desc.required">Field Required</i>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.desc.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="updateReimDesc"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Update
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('update-reim-desc-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>
<script>
  import {dbUsers, dbMains} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {upperCase} from "text-case";
  import {mapGetters} from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  const tableColumns = ["#", "Reimbursement Description", "Actions"];
  const moment  = require('moment');
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    name: "reim-desc",
    data() {
      return {
        // Reimbursement description table
        columns: [{
            label: 'Reimbursement Description',
            field: 'description'
          },{
            label: 'Created by',
            field: 'userReference'
          },{
            label: '',
            field: 'action',
            sortable: false,
            width: '80px'
          }
        ],
        loading: true,
        loadError: false,
        reimDescTable: {
          title: "Reimbursement Description Table",
          subTitle: "",
          columns: [...tableColumns]
        },
        reimDescsCount: 0,
        reimDescs: [],
        stat: 1,
        currentPage: 1,
        searchTerm: '',
        searching: false,
        // Enable or disable buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // New reimbursement description
        newDesc: '',
        // Edit reimbursement description
        edit: {
          id: '',
          reimDescId: '',
          desc: ''
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
      this.getPaginatedReimDescs(1);
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New reimbursement description
      newDesc: {
        required,
        alphaNumCustomValidator
      },
      // Edit reimbursement description
      edit: {
        desc: {
          required, alphaNumCustomValidator
        }
      }
    },
    methods: {
      // Display reimbursement description details on table
      getPaginatedReimDescs(stat) {
        let self = this, descData = null, descs = [], ids = [];

        self.loading = true;
        self.loadError = false;
        self.reimDescs = [];
        self.stat = stat;
        if(self.limit != "all"){
          descData = dbMains.collection("reimbursementDescriptions")
            .where("status","==",stat)
            .orderBy("dateCreated", "asc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          descData = dbMains.collection("reimbursementDescriptions")
            .where("status","==",stat)
            .orderBy("dateCreated", "asc");
        }
        descData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              descs.push(doc.data());
              ids.push(doc.id);
            });
            descs.sort(function(a,b) {
              return a.description - b.description;
            });
            for(let i = 0; i < descs.length; i++){
              descs[i]["rowNum"] = 1 + i;
              descs[i]["id"] = ids[i];
              descs[i].dateCreated = moment.unix(descs[i].dateCreated.seconds);
              self.reimDescs.push(descs[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Save new reimbursement description details
      addReimDesc(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newDesc.$touch();
        if(!self.$v.newDesc.$error){
          let descData = null;

          self.requestProcessing = true;
          descData = dbMains.collection('reimbursementDescriptions')
            .where("description", "==", upperCase(self.newDesc));
          descData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Reimbursement description already exists.',
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
              let dataId = 'RDI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('reimbursementDescriptions').doc()
                  .set({
                    reimbursementDescId: dataId,
                    description: upperCase(self.newDesc),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newDesc = '';
                    self.requestProcessing = false;
                    self.$v.newDesc.$reset();
                    self.$bvModal.hide('new-reim-desc-modal');
                    self.$refs['reim-desc-table'].reset();
                    self.getPaginatedReimDescs(1);
                    self.$swal({
                      title: 'Success',
                      text: 'New reimbursement description added successfully!',
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
      // Show edit reimbursement description form
      openUpdateReimDescModal(row){
        this.edit = {
          id: row.id,
          reimDescId: row.reimbursementDescId,
          desc: row.description
        }
        this.$bvModal.show('update-reim-desc-modal');
      },
      // Change reimbursement description details
      updateReimDesc(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let descData = null;

          descData = dbMains.collection('reimbursementDescriptions')
            .where("description", "==", upperCase(self.edit.desc))
            .where("reimbursementDescId", "!=", self.edit.reimDescId);
          descData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Reimbursement description already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("reimbursementDescriptions")
                .doc(self.edit.id)
                .update({
                  description: upperCase(self.edit.desc),
                  dateModified: today
                }).then(() => {
                  self.edit= {};
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-reim-desc-modal');
                  self.requestProcessing = false;
                  self.$refs['reim-desc-table'].reset();
                  self.getPaginatedReimDescs(1);
                  self.$swal({
                    title: 'Success',
                    text: 'Reimbursement description updated successfully!',
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
      // Change reimbursement description status
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
              dbMains.collection("reimbursementDescriptions")
              .doc(id)
              .update({
                status: stat,
                dateModified: today
              }).then(() => {
                self.$swal({
                  title: "Success",
                  text: "Reimbursement description status to " + msg + ".",
                  icon: "success",
                  confirmButtonColor: '#b80000',
                  confirmButtonText: 'OK'
                }).then(() => {
                  self.$refs['reim-desc-table'].reset();
                  self.getPaginatedReimDescs(stat);
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
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>