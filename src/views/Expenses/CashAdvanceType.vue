<template>
  <div> 
    <card class="pt-4"
      id="textStyle">
      <div class="table-full-width">
        <!-- Cash advance type table -->
        <vue-good-table :columns="columns"
          :rows="caTypes"
          :search-options="{enabled: true}"
          :pagination-options="{
            enabled: true,
            perPageDropdown: [10, 15, 20],
          }"
          :sort-options="{enabled: true}"
          :line-numbers="true"
          :isLoading="loading"
          ref="ca-type-table">
          <template slot="table-row"
            slot-scope="props">
            <b><span v-if="props.column.field == 'type'">
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
                v-on:click="openUpdateCATypeModal(props.row)"
                title="Update"></span>
            </span></b>
          </template>
        </vue-good-table>
      </div>
      <hr class="mb-2 mt-2">
      <!-- Limit records on table -->
      <div class="row pl-4"
        v-if="!loading && caTypes.length">
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
            @input="getPaginatedCATypes()"></v-select>
        </span>
      </div>
      <hr class="mb-2 mt-2">
      <!-- New cash advance type button -->
      <div class="text-right pt-2">
        <base-button v-b-modal.new-cash-advance-type-modal
          id="darkBtn"
          class="col-md-4 ml-2 mr-2">New Cash Advance Type</base-button>
      </div>
    </card>
    <!-- ADD CASH ADVANCE TYPE MODAL -->
    <b-modal size="md"
      id="new-cash-advance-type-modal"
      title="New Cash Advance Type" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-12 col-form-label">
          <b>Type:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-12 pl-5 pr-5">
          <base-input v-model="newType"
            id="inputStyle"
            type="text"
            placeholder="Type"></base-input>
          <i class="text-red"
            v-if="$v.newType.$anyDirty && !$v.newType.required">Field Required</i>
          <i class="text-red"
            v-if="$v.newType.$anyDirty && !$v.newType.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="addCAType"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Add
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('new-cash-advance-type-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
    <!-- UPDATE CASH ADVANCE TYPE MODAL -->
    <b-modal size="md"
      id="update-cash-advance-type-modal"
      title="Edit Cash Advance Type" centered
      :hide-header-close="true"
      :no-close-on-backdrop="true"
      :no-close-on-esc="true">
      <div class="form-group row mb-0">
        <label class="col-sm-12 col-form-label">
          <b>Type:</b>
          <b class="text-red">*</b>
        </label>
      </div>
      <div class="form-group row mb-0">
        <div class="col-sm-12 pl-5 pr-5">
          <base-input v-model="edit.type"
            id="inputStyle"
            type="text"
            placeholder="Type"></base-input>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.type.required">Field Required</i>
          <i class="text-red"
            v-if="$v.edit.$anyDirty && !$v.edit.type.alphaNumCustomValidator">Invalid Characters</i>
        </div>
      </div>
      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="text-right">
            <base-button id="darkBtn"
              @click.native="updateCAType"
              :disabled="requestProcessing">
              <i v-if="requestProcessing"
                class="fa fa-spinner fa-spin"></i>
              Update
            </base-button>
            <base-button id="darkInlineBtn"
              @click.native="$bvModal.hide('update-cash-advance-type-modal')"
              :disabled="requestProcessing">Close</base-button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>
<script>
  import {dbUsers, dbExpense} from '@/main';
  import {helpers, required} from "vuelidate/lib/validators";
  import {upperCase} from "text-case";
  import {mapGetters} from "vuex";

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ A-Za-z0-9 -./, ]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    name: "cash-advance-type",
    data() {
      return {
        // Cash advance table
        columns: [{
            label: 'Cash Advance Type',
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
        caTypes: [],
        loading: true,
        // Enable or disbale buttons
        requestProcessing: false,
        // Limit records
        views: [
          {"limitId": "20", "limit": "20 Records"}, 
          {"limitId": "50", "limit": "50 Records"},
          {"limitId": "all", "limit": "All Records"}
        ],
        limit: "20",
        // New cash advance type
        newType: '',
        // Edit cash advance type
        edit: {
          id: '',
          caTypeId: '',
          type: ''
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
      this.getPaginatedCATypes();
    },
    computed: {
      ...mapGetters({
        users: 'Users/users'
      })
    },
    validations: {
      // New cash advance type validations
      newType: {
        required,
        alphaNumCustomValidator
      },
      // Edit cash advance type validations
      edit: {
        type: {
          required, alphaNumCustomValidator
        }
      }
    },
    methods: {
      // Display cash advance type details on table
      getPaginatedCATypes() {
        let self = this, caData = null, cas = [], ids = [];

        self.loading = true;
        self.caTypes = [];
        if(self.limit != "all"){
          caData = dbExpense.collection("cashAdvanceTypes")
            .orderBy("type", "asc")
            .limit(self.limit);
        }else if(self.limit == "all"){
          caData = dbExpense.collection("cashAdvanceTypes")
            .orderBy("type", "asc");
        }
        caData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              cas.push(doc.data());
              ids.push(doc.id);
            });
            for(let i = 0; i < cas.length; i++){
              cas[i]["id"] = ids[i];
              self.caTypes.push(cas[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      // Save new cash advance type details
      addCAType(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newType.$touch();
        if(!self.$v.newType.$error){
          let caData = null;

          self.requestProcessing = true;
          caData = dbExpense.collection('cashAdvanceTypes')
            .where("type", "==", upperCase(self.newType));
          caData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Cash Advance type already exists.',
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
              let dataId = 'CATI-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbExpense.collection('cashAdvanceTypes').doc()
                  .set({
                    cashAdvanceTypeId: dataId,
                    type: upperCase(self.newType),
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newType = '';
                    self.requestProcessing = false;
                    self.$v.newType.$reset();
                    self.$bvModal.hide('new-cash-advance-type-modal');
                    self.$refs['ca-type-table'].reset();
                    self.getPaginatedCATypes();
                    self.$swal({
                      title: 'Success',
                      text: 'New cash advance type added successfully!',
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
      // Show edit cash advance type form
      openUpdateCATypeModal(row){
        this.edit = {
          id: row.id,
          caTypeId: row.cashAdvanceTypeId,
          type: row.type
        }
        this.$bvModal.show('update-cash-advance-type-modal');
      },
      // Change cash advance type details
      updateCAType(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let caData = null;

          caData = dbExpense.collection('cashAdvanceTypes')
            .where("type", "==", upperCase(self.edit.type))
            .where("cashAdvanceTypeId", "!=", self.edit.caTypeId);
          caData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Cash Advance type already exists.',
                    icon: 'error',
                    confirmButtonColor: '#b80000',
                    confirmButtonText: 'OK'
                  });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbExpense.collection("cashAdvanceTypes")
                .doc(self.edit.id)
                .update({
                  type: upperCase(self.edit.type),
                  dateModified: today
                }).then(() => {
                  self.edit= {};
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-cash-advance-type-modal');
                  self.requestProcessing = false;
                  self.$refs['ca-type-table'].reset();
                  self.getPaginatedCATypes();
                  self.$swal({
                    title: 'Success',
                    text: 'Cash Advance type updated successfully!',
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