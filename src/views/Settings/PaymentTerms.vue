<template>
  <div> 
    <base-header class="pb-6 pb-8 pt-5"></base-header>     
    <div class="col-12 container-fluid mt--7" >
      <card class="pt-4"
        id="textStyle">
        <div class="table-full-width">
          <vue-good-table :columns="columns"
            :rows="paymentTerms"
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
              <b><span v-if="props.column.field == 'description'">
                <span>{{props.row.description}}</span>
              </span>
              <span v-if="props.column.field == 'value'">
                <span>{{props.row.value}}</span>
              </span>
              <span v-if="props.column.field == 'action'">
                <span class="pointer ml-2 far fa-edit"
                  id="sideBarTxt"
                  v-on:click="openUpdatePaymentTermsModal(props.row)"
                  title="Update"></span>
              </span></b>
            </template>
          </vue-good-table>
        </div>
        <hr class="mb-2 mt-2">
        <div class="row pl-4"
          v-if="!loading && paymentTerms.length">
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
              @input="getPaginatedPaymentTerms()"></v-select>
          </span>
        </div>
        <hr class="mb-2 mt-2">
        <div class="text-right pt-2">
          <base-button v-b-modal.new-payment-terms-modal
            id="darkBtn"
            class="col-md-4 ml-2 mr-2">New Payment Terms</base-button>
        </div>
      </card>
      <!-- ADD PAYMENT TERMS MODAL -->
      <b-modal size="lg"
        id="new-payment-terms-modal"
        title="New Payment Terms" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Description:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Value:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newDescription"
              id="inputStyle"
              type="text"
              placeholder="Description"></base-input>
            <i class="text-red"
              v-if="$v.newDescription.$anyDirty && !$v.newDescription.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newDescription.$anyDirty && !$v.newDescription.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="newValue"
              id="inputStyle"
              type="text"
              placeholder="Value"></base-input>
            <i class="text-red"
              v-if="$v.newValue.$anyDirty && !$v.newValue.required">Field Required</i>
            <i class="text-red"
              v-if="$v.newValue.$anyDirty && !$v.newValue.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="addPaymentTerms"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>Add
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('new-payment-terms-modal')"
                :disabled="requestProcessing">Close</base-button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- UPDATE PAYMENT TERMS MODAL -->
      <b-modal size="lg"
        id="update-payment-terms-modal"
        title="Edit Payment Terms" centered
        :hide-header-close="true"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true">
        <div class="form-group row mb-0">
          <label class="col-sm-6 col-form-label">
            <b>Description:</b>
            <b class="text-red">*</b>
          </label>
          <label class="col-sm-6 col-form-label">
            <b>Value:</b>
            <b class="text-red">*</b>
          </label>
        </div>
        <div class="form-group row mb-0">
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.description"
              id="inputStyle"
              type="text"
              placeholder="Description"></base-input>
            <i class="text-red"
              v-if="$v.edit.description.$anyDirty && !$v.edit.description.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.description.$anyDirty && !$v.edit.description.alphaNumCustomValidator">Invalid Characters</i>
          </div>
          <div class="col-sm-6 pl-5 pr-5">
            <base-input v-model="edit.value"
              id="inputStyle"
              type="text"
              placeholder="Value"></base-input>
            <i class="text-red"
              v-if="$v.edit.value.$anyDirty && !$v.edit.value.required">Field Required</i>
            <i class="text-red"
              v-if="$v.edit.value.$anyDirty && !$v.edit.value.numCustomValidator">Invalid Characters</i>
          </div>
        </div>
        <template v-slot:modal-footer>
          <div class="w-100">
            <div class="text-right">
              <base-button id="darkBtn"
                @click.native="updatePaymentTerms"
                :disabled="requestProcessing">
                <i v-if="requestProcessing"
                  class="fa fa-spinner fa-spin"></i>
                Update
              </base-button>
              <base-button id="darkInlineBtn"
                @click.native="$bvModal.hide('update-payment-terms-modal')"
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

  const alphaNumCustomValidator = helpers.regex('alphaNumAndDot', /^[ -./, A-Za-z0-9 ]*$/);
  const numCustomValidator = helpers.regex('alphaNumAndDot', /^[ 0-9 ]*$/);
  const today = new Date();
  const addZero = require('add-zero');

  export default {
    components: {},
    data() {
      return {
        columns: [{
            label: 'Description',
            field: 'description'
          },{
            label: 'Value',
            field: 'value',
            width: '100px'
          },{
            label: '',
            field:'action',
            sortable: false,
            width: '25px'
          }
        ],
        loading: true,
        paymentTerms: [],
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
        newDescription: '',
        newValue: '',
        edit: {
          id: '',
          paymentTermId: '',
          description: '',
          value: '',
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
      this.getPaginatedPaymentTerms();
    },
    validations: {
      newDescription: {
        required,
        alphaNumCustomValidator
      },
      newValue: {
        required,
        numCustomValidator
      },
      edit: {
        description: {
          required,
          alphaNumCustomValidator
        },
        value: {
          required,
          numCustomValidator
        }
      }
    },
    methods: {
      getPaginatedPaymentTerms() {
        let self = this, paymentTermData = null, payments = [], ids = [];

        self.loading = true;
        self.paymentTerms = [];
        if(self.limit != "all"){
          paymentTermData = dbMains.collection("paymentTerms")
            .orderBy("description", "asc").limit(self.limit);
        }else if(self.limit == "all"){
          paymentTermData = dbMains.collection("paymentTerms")
            .orderBy("description", "asc");
        }
        paymentTermData.get().then((querySnapshot) => {
          if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
              payments.push(doc.data());
              ids.push(doc.id);
            });
            payments.sort(function(a,b) {
              return a.description - b.description;
            });
            for(let i = 0; i < payments.length; i++){
              payments[i]["rowNum"] = 1 + i;
              payments[i]["id"] = ids[i];
              self.paymentTerms.push(payments[i]);
            }
          }
          setTimeout(function() {
            self.loading = false;
          }, 1000);
        });
      },
      addPaymentTerms(){
        let self = this;

        self.requestProcessing = false;
        self.$v.newDescription.$touch();
        self.$v.newValue.$touch();
        if(!self.$v.newDescription.$error && !self.$v.newValue.$error){
          let nameData = null;

          self.requestProcessing = true;
          nameData = dbMains.collection('paymentTerms')
            .where("description", "==",self.newDescription);
          nameData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                    title: 'Invalid',
                    text: 'Payment term already exists.',
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
              let dataId = 'PTID-' + today.getFullYear() + "" + addZero((today.getMonth() + 1), 2) + "" + today.getDate() + '-' + Math.floor(Math.random() * 1000000);

              getUserId.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  if(doc.exists){
                    users.push(doc.data());
                  }
                });
                try{
                  dbMains.collection('paymentTerms').doc()
                  .set({
                    paymentTermId: dataId,
                    description: self.newDescription,
                    value: self.newValue,
                    userReference: users[0].userId,
                    status: 1,
                    dateCreated: today,
                    dateModified: today
                  }).then(() => {
                    self.newDescription = '';
                    self.newValue = '';
                    self.requestProcessing = false;
                    self.$v.newDescription.$reset();
                    self.$v.newValue.$reset();
                    self.$bvModal.hide('new-payment-terms-modal');
                    self.getPaginatedPaymentTerms();
                    self.$swal({
                      title: 'Success',
                      text: 'New payment term added successfully!',
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
      openUpdatePaymentTermsModal(row){
        this.edit = {
          id: row.id,
          paymentTermId: row.paymentTermId,
          description: row.description,
          value: row.value
        }
        this.$bvModal.show('update-payment-terms-modal');
      },
      updatePaymentTerms(){
        let self = this;

        self.requestProcessing = true;
        self.$v.edit.$touch();
        if(!self.$v.edit.$error){
          let nameData = null;

          nameData = dbMains.collection('paymentTerms')
            .where("description", "==", self.edit.description)
           .where("paymentTermId", "!=", self.edit.paymentTermId);
          nameData.get().then((querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.forEach((doc) => {
                if(doc.exists){
                  self.$swal({
                      title: 'Invalid',
                      text: 'Payment term already exists.',
                      icon: 'error',
                      confirmButtonColor: '#b80000',
                      confirmButtonText: 'OK'
                    });
                  self.requestProcessing = false;
                }
              });
            }else if(querySnapshot){
              try{
                dbMains.collection("paymentTerms")
                .doc(self.edit.id)
                .update({
                  description: self.edit.description,
                  value: self.edit.value,
                  dateModified: today
                }).then(() => {
                  self.edit= {};
                  self.$v.edit.$reset();
                  self.$bvModal.hide('update-payment-terms-modal');
                  self.requestProcessing = false;
                  self.getPaginatedPaymentTerms();
                  self.$swal({
                    title: 'Success',
                    text: 'Payment term updated successfully!',
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
        }else{
          self.requestProcessing = false;
        }
      },
    }
  };
</script>
<style type="text/css">
  .form-control {height: calc(1.5em + 0.50rem + 2px);}
  .form-group {margin-bottom: 0rem}
</style>